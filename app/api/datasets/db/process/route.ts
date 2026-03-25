import { NextResponse } from "next/server";
import { Client } from "pg";
import { db } from "@/db";
import { datasets, datasetRows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildDashboardFromDataset } from "@/utils/ai/generateDashboard";
import { dbConnectionSchema } from "@/utils/validation";
import { rateLimit } from "@/utils/rate-limit";
import { getOrCreateWorkspace } from "@/utils/workspace";
import { getSessionUser } from "@/utils/session";

function sanitizeIdentifier(value: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error("Nome da tabela contém caracteres inválidos");
  }
  return value;
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`db-process:${ip}`, 5, 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em breve." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = dbConnectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { connectionString, tableName } = parsed.data;
    const mapping = body.mapping || {};
    const safeTable = sanitizeIdentifier(tableName);

    let workspaceId: string;
    try {
      workspaceId = await getOrCreateWorkspace(user.id);
    } catch {
      return NextResponse.json(
        { error: "Falha crítica criando workspace" },
        { status: 500 },
      );
    }

    // Connect to external DB and Extract Data
    const dbClient = new Client({
      connectionString,
      ssl: { rejectUnauthorized: true },
      connectionTimeoutMillis: 10000,
      statement_timeout: 30000,
    });
    await dbClient.connect();
    const result = await dbClient.query(
      `SELECT * FROM "${safeTable}" LIMIT 20000`,
    );
    await dbClient.end();

    const rows = result.rows;
    if (rows.length === 0)
      return NextResponse.json({ error: "Tabela vazia" }, { status: 400 });

    // Create tracking Dataset
    const [dataset] = await db
      .insert(datasets)
      .values({
        workspaceId,
        name: `Tabela: ${tableName}`,
        status: "processing",
      })
      .returning({ id: datasets.id });

    if (!dataset) throw new Error("Erro ao criar dataset interno");

    // Parse formatting according to mapping
    const rowsToInsert = rows.map((row: any) => {
      const cleanRow: any = {};
      Object.keys(row).forEach((key) => {
        if (mapping[key] !== "ignore") {
          if (mapping[key] === "number") {
            const rawVal = String(row[key] || 0)
              .replace("R$", "")
              .replace(/\./g, "")
              .replace(",", ".")
              .trim();
            cleanRow[key] = parseFloat(rawVal) || 0;
          } else {
            cleanRow[key] = row[key];
          }
        }
      });
      return { datasetId: dataset.id, rowData: cleanRow };
    });

    // Chunk Insert to bypass large payload limits
    for (let i = 0; i < rowsToInsert.length; i += 2000) {
      const chunk = rowsToInsert.slice(i, i + 2000);
      await db.insert(datasetRows).values(chunk);
    }

    await db
      .update(datasets)
      .set({ status: "ready" })
      .where(eq(datasets.id, dataset.id));

    console.log("Acionando IA na rota do DB");
    await buildDashboardFromDataset(dataset.id, workspaceId);

    return NextResponse.json({
      success: true,
      count: rowsToInsert.length,
      datasetId: dataset.id,
    });
  } catch (err: any) {
    console.error("Erro PG Process ETL:", err.message);
    return NextResponse.json(
      { error: "Erro ETL: " + err.message },
      { status: 500 },
    );
  }
}
