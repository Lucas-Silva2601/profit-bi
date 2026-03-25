import { NextResponse } from "next/server";
import { db } from "@/db";
import { datasets, datasetRows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildDashboardFromDataset } from "@/utils/ai/generateDashboard";
import { rateLimit } from "@/utils/rate-limit";
import { getOrCreateWorkspace } from "@/utils/workspace";
import { getSessionUser } from "@/utils/session";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ROWS = 50000;

export async function POST(req: Request) {
  try {
    const contentLength = parseInt(
      req.headers.get("content-length") || "0",
      10,
    );
    if (contentLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 10MB." },
        { status: 413 },
      );
    }

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`upload:${user.id}`, 10, 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Muitos uploads. Aguarde um momento." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { fileName, mapping, rows, primaryColor, secondaryColor } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado recebido" },
        { status: 400 },
      );
    }

    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        {
          error: `Máximo de ${MAX_ROWS.toLocaleString("pt-BR")} linhas permitido`,
        },
        { status: 400 },
      );
    }

    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json(
        { error: "Nome do arquivo inválido" },
        { status: 400 },
      );
    }

    if (!mapping || typeof mapping !== "object") {
      return NextResponse.json(
        { error: "Mapeamento inválido" },
        { status: 400 },
      );
    }

    let workspaceId: string;
    try {
      workspaceId = await getOrCreateWorkspace(user.id);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    const [dataset] = await db
      .insert(datasets)
      .values({
        workspaceId,
        name: fileName,
        status: "processing",
      })
      .returning({ id: datasets.id });

    if (!dataset) {
      return NextResponse.json(
        { error: "Erro ao criar dataset" },
        { status: 500 },
      );
    }

    const datasetId = dataset.id;

    const rowsToInsert = rows.map((row: any) => {
      const cleanRow: any = {};
      Object.keys(row).forEach((key) => {
        if (mapping[key] !== "ignore") {
          if (mapping[key] === "number") {
            const rawVal = String(row[key] || "")
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
      return {
        datasetId,
        rowData: cleanRow,
      };
    });

    const chunkSize = 1000;
    try {
      for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
        const chunk = rowsToInsert.slice(i, i + chunkSize);
        await db.insert(datasetRows).values(chunk);
      }
    } catch (insertError: any) {
      await db
        .update(datasets)
        .set({ status: "error", errorLog: insertError.message })
        .where(eq(datasets.id, datasetId));
      return NextResponse.json(
        { error: "Erro ao inserir lote de dados" },
        { status: 500 },
      );
    }

    // Process AI generation BEFORE marking as ready
    try {
      await buildDashboardFromDataset(
        datasetId,
        workspaceId,
        primaryColor,
        secondaryColor,
      );
    } catch (aiError: any) {
      console.error(
        "AI Generation failed for dataset " + datasetId + ":",
        aiError.message,
      );
      await db
        .update(datasets)
        .set({
          status: "ready",
          errorLog: "AI generation failed: " + aiError.message,
        })
        .where(eq(datasets.id, datasetId));
    }

    await db
      .update(datasets)
      .set({ status: "ready" })
      .where(eq(datasets.id, datasetId));

    console.log(
      "Acionando a Ollama Cloud em background para o dataset " + datasetId,
    );

    return NextResponse.json({ success: true, datasetId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
