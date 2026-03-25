import { NextResponse } from "next/server";
import { Client } from "pg";
import { getSessionUser } from "@/utils/session";
import { dbConnectionSchema } from "@/utils/validation";
import { rateLimit } from "@/utils/rate-limit";

const ALLOWED_SCHEMAS = ["public"];

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
    const limit = rateLimit(`db-preview:${ip}`, 10, 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em breve." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = dbConnectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { connectionString, tableName } = parsed.data;
    const safeTable = sanitizeIdentifier(tableName);

    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: true },
      connectionTimeoutMillis: 10000,
      statement_timeout: 15000,
    });

    await client.connect();

    const res = await client.query(`SELECT * FROM "${safeTable}" LIMIT 5`);
    await client.end();

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: "Tabela especificada está vazia ou não existe" },
        { status: 404 }
      );
    }

    const headers = Object.keys(res.rows[0]);
    return NextResponse.json({ headers, previewRows: res.rows });
  } catch (err: any) {
    console.error("Erro PG Preview:", err.message);
    return NextResponse.json(
      { error: "Erro de Conexão: " + err.message },
      { status: 500 }
    );
  }
}
