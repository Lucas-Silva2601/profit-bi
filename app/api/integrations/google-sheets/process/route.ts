import { google } from "googleapis";
import { db } from "@/db";
import { datasets, datasetRows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildDashboardFromDataset } from "@/utils/ai/generateDashboard";
import { getOrCreateWorkspace } from "@/utils/workspace";
import { getSessionUser } from "@/utils/session";
import { NextResponse } from "next/server";
import { env } from "@/env";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { spreadsheetId, sheetName, token } = body;

    if (!spreadsheetId || !token) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Decode token
    const tokenData = JSON.parse(Buffer.from(token, "base64").toString());

    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(tokenData);

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // Get spreadsheet info
    const spreadsheetRes = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "properties(title),sheets(properties(sheetId,title))",
    });

    const spreadsheetTitle = spreadsheetRes.data.properties?.title || "Google Sheets";
    const availableSheets = spreadsheetRes.data.sheets?.map((s) => s.properties?.title) || [];

    // If sheetName not provided, use first sheet
    const targetSheet = sheetName || availableSheets[0];

    if (!targetSheet) {
      return NextResponse.json(
        { error: "Planilha vazia" },
        { status: 400 }
      );
    }

    // Fetch data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${targetSheet}!A:ZZ`,
    });

    const rows = response.data.values || [];

    if (rows.length < 2) {
      return NextResponse.json(
        { error: "Planilha sem dados suficientes" },
        { status: 400 }
      );
    }

    const headers = rows[0];
    const dataRows = rows.slice(1).map((row) => {
      const obj: any = { Aba_Origem: targetSheet };
      headers.forEach((h, i) => {
        obj[h] = row[i] || "";
      });
      return obj;
    });

    let workspaceId: string;
    try {
      workspaceId = await getOrCreateWorkspace(user.id);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    // Create dataset
    const [dataset] = await db
      .insert(datasets)
      .values({
        workspaceId,
        name: `Google Sheets: ${spreadsheetTitle}`,
        status: "processing",
      })
      .returning({ id: datasets.id });

    if (!dataset) {
      return NextResponse.json(
        { error: "Erro ao criar dataset" },
        { status: 500 }
      );
    }

    // Insert rows in chunks
    const chunkSize = 1000;
    try {
      for (let i = 0; i < dataRows.length; i += chunkSize) {
        const chunk = dataRows.slice(i, i + chunkSize);
        await db
          .insert(datasetRows)
          .values(chunk.map((r) => ({ datasetId: dataset.id, rowData: r })));
      }
    } catch (insertError: any) {
      await db
        .update(datasets)
        .set({ status: "error", errorLog: insertError.message })
        .where(eq(datasets.id, dataset.id));
      return NextResponse.json(
        { error: "Erro ao inserir dados" },
        { status: 500 }
      );
    }

    // Generate dashboard
    try {
      await buildDashboardFromDataset(dataset.id, workspaceId);
    } catch (aiError: any) {
      console.error("AI Generation failed:", aiError.message);
    }

    await db
      .update(datasets)
      .set({ status: "ready" })
      .where(eq(datasets.id, dataset.id));

    return NextResponse.json({
      success: true,
      datasetId: dataset.id,
      availableSheets,
      spreadsheetTitle,
    });
  } catch (err: any) {
    console.error("Google Sheets process error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
