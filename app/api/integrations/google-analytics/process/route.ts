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
    const { propertyId, dateStart, dateEnd, token } = body;

    if (!propertyId || !token || !dateStart || !dateEnd) {
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
      env.GOOGLE_ANALYTICS_REDIRECT_URI || env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(tokenData);

    const analyticsdata = google.analyticsdata({
      version: "v1beta",
      auth: oauth2Client,
    });

    // Fetch GA4 data
    // @ts-ignore - googleapis types are incomplete
    const response: any = await analyticsdata.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: dateStart, endDate: dateEnd }],
        dimensions: [
          { name: "date" },
          { name: "pagePath" },
          { name: "sourceMedium" },
          { name: "country" },
          { name: "deviceCategory" },
        ],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "engagementRate" },
          { name: "bounceRate" },
          { name: "screenPageViews" },
          { name: "eventCount" },
          { name: "averageSessionDuration" },
        ],
        limit: 10000,
      },
    });

    const rows = (response.data.rows || []).map((row: any) => ({
      data: row.dimensionValues?.[0]?.value || "",
      pagina: row.dimensionValues?.[1]?.value || "",
      origem: row.dimensionValues?.[2]?.value || "",
      pais: row.dimensionValues?.[3]?.value || "",
      dispositivo: row.dimensionValues?.[4]?.value || "",
      usuarios_ativos: parseInt(row.metricValues?.[0]?.value) || 0,
      sessoes: parseInt(row.metricValues?.[1]?.value) || 0,
      engajamento: parseFloat(row.metricValues?.[2]?.value) * 100,
      taxa_rejeicao: parseFloat(row.metricValues?.[3]?.value) * 100,
      pageviews: parseInt(row.metricValues?.[4]?.value) || 0,
      eventos: parseInt(row.metricValues?.[5]?.value) || 0,
      duracao_media_sessao: parseFloat(row.metricValues?.[6]?.value) || 0,
    }));

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado encontrado para o período selecionado" },
        { status: 400 }
      );
    }

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
        name: `Google Analytics: ${propertyId}`,
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
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      await db
        .insert(datasetRows)
        .values(chunk.map((r: any) => ({ datasetId: dataset.id, rowData: r })));
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
      rowCount: rows.length,
    });
  } catch (err: any) {
    console.error("Google Analytics process error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
