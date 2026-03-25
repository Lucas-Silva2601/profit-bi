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
    const { adAccountId, dateStart, dateEnd, token } = body;

    if (!adAccountId || !token || !dateStart || !dateEnd) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Decode token
    const tokenData = JSON.parse(Buffer.from(token, "base64").toString());
    const accessToken = tokenData.access_token;

    // Fetch insights from Meta Ads API
    const insightsRes = await fetch(
      `https://graph.facebook.com/v21.0/${adAccountId}/insights`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          fields:
            "date_start,date_stop,spend,impressions,clicks,reach,conversions,campaign_name,adset_name,ad_name,actions,cpc,cpm,ctr,objective",
          level: "campaign",
          time_range: JSON.stringify({ since: dateStart, until: dateEnd }),
          limit: "1000",
        }).toString(),
      }
    );

    const insightsData = await insightsRes.json();

    if (insightsData.error) {
      throw new Error(insightsData.error.message);
    }

    const rows = (insightsData.data || []).map((item: any) => {
      const conversions = item.conversions?.[0]?.value || 0;
      const actions = item.actions?.reduce(
        (sum: number, a: any) => sum + (parseInt(a.value) || 0),
        0
      ) || 0;

      return {
        data_inicio: item.date_start || "",
        data_fim: item.date_stop || "",
        campanha: item.campaign_name || "N/A",
        conjunto_anuncios: item.adset_name || "N/A",
        anuncio: item.ad_name || "N/A",
        objetivo: item.objective || "N/A",
        investimento: parseFloat(item.spend) || 0,
        impressoes: parseInt(item.impressions) || 0,
        cliques: parseInt(item.clicks) || 0,
        alcance: parseInt(item.reach) || 0,
        conversoes: parseFloat(conversions) || 0,
        acoes_totais: actions,
        cpc: parseFloat(item.cpc) || 0,
        cpm: parseFloat(item.cpm) || 0,
        ctr: parseFloat(item.ctr) || 0,
      };
    });

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
        name: `Meta Ads: ${adAccountId}`,
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
    console.error("Meta Ads process error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
