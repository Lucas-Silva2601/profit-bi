import { generateText } from "ai";
import { env } from "@/env";
import { ollamaModel } from "@/utils/ai/provider";
import { db } from "@/db";
import { dashboards, datasetRows } from "@/db/schema";
import { eq } from "drizzle-orm";

function detectColumnType(col: string, sample: any[]): string {
  const lower = col.toLowerCase();
  if (
    /(data|date|mes|ano|year|month|dia|week|semana|periodo|trimestre)/.test(
      lower,
    )
  )
    return "date";
  if (
    /(valor|total|preco|price|custo|faturamento|receita|venda|quantidade|qtd|amount|lucro|despesa|imposto|frete|salario)/.test(
      lower,
    )
  )
    return "number";
  if (
    /(nome|categoria|status|tipo|regiao|cidade|estado|pais|vendedor|produto|cliente|genero|departamento|filial|canal)/.test(
      lower,
    )
  )
    return "category";
  const nums = sample.filter((r: any) => {
    const v = r[col];
    if (v === null || v === undefined) return false;
    const n = parseFloat(
      String(v)
        .replace(/[^\d.,-]/g, "")
        .replace(",", "."),
    );
    return !isNaN(n);
  }).length;
  if (nums > sample.length * 0.6) return "number";
  return "category";
}

function generateSmartDashboard(
  columns: string[],
  columnAnalysis: { name: string; type: string }[],
  sampleData: any[],
  uniqueAbas: string[],
): any {
  const dateCols = columnAnalysis
    .filter((c) => c.type === "date")
    .map((c) => c.name);
  const numberCols = columnAnalysis
    .filter((c) => c.type === "number")
    .map((c) => c.name);
  const categoryCols = columnAnalysis
    .filter((c) => c.type === "category")
    .map((c) => c.name);

  const kpis: any[] = [];
  const charts: any[] = [];
  const filters: any[] = [];

  numberCols.slice(0, 4).forEach((col) => {
    kpis.push({
      title: `Total ${col}`,
      metric_column: col,
      aggregation: "sum",
      format: "currency",
    });
  });

  if (categoryCols.length > 0) {
    kpis.push({
      title: `Total Registros`,
      metric_column: categoryCols[0],
      aggregation: "count",
      format: "number",
    });
  }

  if (numberCols.length > 0) {
    kpis.push({
      title: `Média ${numberCols[0]}`,
      metric_column: numberCols[0],
      aggregation: "average",
      format: "currency",
    });
  }

  if (dateCols.length > 0 && numberCols.length > 0) {
    charts.push({
      title: `Evolução de ${numberCols[0]} ao Longo do Tempo`,
      type: "area",
      xAxisColumn: dateCols[0],
      yAxisColumn: numberCols[0],
      yAggregation: "sum",
      description: `Tendência temporal de ${numberCols[0]}`,
    });
  }

  if (categoryCols.length > 0 && numberCols.length > 0) {
    charts.push({
      title: `${numberCols[0]} por ${categoryCols[0]}`,
      type: "bar",
      xAxisColumn: categoryCols[0],
      yAxisColumn: numberCols[0],
      yAggregation: "sum",
      description: `Comparação de ${numberCols[0]} entre categorias`,
    });
  }

  if (categoryCols.length > 0 && numberCols.length > 0) {
    charts.push({
      title: `Distribuição de ${numberCols[0]} por ${categoryCols[0]}`,
      type: "pie",
      xAxisColumn: categoryCols[0],
      yAxisColumn: numberCols[0],
      yAggregation: "sum",
      description: `Proporção de ${numberCols[0]} entre categorias`,
    });
  }

  if (dateCols.length > 0 && numberCols.length > 1) {
    charts.push({
      title: `Evolução de ${numberCols[1]} ao Longo do Tempo`,
      type: "line",
      xAxisColumn: dateCols[0],
      yAxisColumn: numberCols[1],
      yAggregation: "sum",
      description: `Tendência temporal de ${numberCols[1]}`,
    });
  }

  if (categoryCols.length > 1 && numberCols.length > 0) {
    charts.push({
      title: `${numberCols[0]} por ${categoryCols[1]}`,
      type: "bar",
      xAxisColumn: categoryCols[1],
      yAxisColumn: numberCols[0],
      yAggregation: "sum",
      description: `Análise cruzada de ${numberCols[0]} por ${categoryCols[1]}`,
    });
  }

  if (numberCols.length >= 2) {
    charts.push({
      title: `Relação ${numberCols[0]} vs ${numberCols[1]}`,
      type: "scatter",
      xAxisColumn: numberCols[0],
      yAxisColumn: numberCols[1],
      yAggregation: "sum",
      description: `Correlação entre ${numberCols[0]} e ${numberCols[1]}`,
    });
  }

  if (dateCols.length > 0 && numberCols.length > 1) {
    charts.push({
      title: `Área de ${numberCols[1]} por Período`,
      type: "area",
      xAxisColumn: dateCols[0],
      yAxisColumn: numberCols[1],
      yAggregation: "sum",
      description: `Volume acumulado de ${numberCols[1]}`,
    });
  }

  if (categoryCols.length > 1 && numberCols.length > 0) {
    charts.push({
      title: `Composição de ${numberCols[0]} por ${categoryCols[1]}`,
      type: "pie",
      xAxisColumn: categoryCols[1],
      yAxisColumn: numberCols[0],
      yAggregation: "sum",
      description: `Distribuição percentual por ${categoryCols[1]}`,
    });
  }

  categoryCols.slice(0, 3).forEach((col) => {
    if (col !== "Aba_Origem") {
      filters.push({
        column_name: col,
        label: col,
        type: "select",
      });
    }
  });

  return { kpis, charts, filters };
}

export async function buildDashboardFromDataset(
  datasetId: string,
  workspaceId: string,
  primaryColor = "#4F46E5",
  secondaryColor = "#06B6D4",
) {
  const rows = await db
    .select({ row_data: datasetRows.rowData })
    .from(datasetRows)
    .where(eq(datasetRows.datasetId, datasetId))
    .limit(10000);

  if (rows.length === 0) {
    throw new Error("No data found for dataset");
  }

  const columnsSet = new Set<string>();
  const abasOrigem = new Set<string>();

  rows.forEach((r: any) => {
    if (r.row_data) {
      Object.keys(r.row_data).forEach((k) => columnsSet.add(k));
      if (r.row_data["Aba_Origem"]) {
        abasOrigem.add(r.row_data["Aba_Origem"]);
      }
    }
  });
  const columns = Array.from(columnsSet);
  const uniqueAbas = Array.from(abasOrigem);

  const sampleData = rows.map((r: any) => r.row_data).slice(0, 20);

  const columnAnalysis = columns.map((col) => {
    const type = detectColumnType(col, sampleData);
    return { name: col, type };
  });

  let parsedLayout: any;

  if (env.OLLAMA_API_KEY && env.OLLAMA_API_KEY !== "dummy") {
    try {
      const prompt = `Você é um Diretor de BI e Estrategista de Dados com 20+ anos de experiência. Sua missão é analisar dados brutos e construir dashboards executivos profissionais que gerem insights acionáveis.

Colunas: ${columns.join(", ")}
Classificação: ${columnAnalysis.map((c: any) => `${c.name}=${c.type}`).join(", ")}
Abas: ${uniqueAbas.join(", ") || "dados únicos"}

Regras:
1. Identifique o tipo de negócio e crie KPIs/gráficos RELEVANTES
2. Crie 6-8 KPIs que respondam às perguntas mais importantes
3. Crie 8-12 gráficos com variedade: line (temporal), bar (comparação), pie (proporção, máx 6 fatias), area (séries temporais), scatter (correlação)
4. Use APENAS colunas existentes
5. Até 3 filtros usando colunas categóricas. NUNCA use "Aba_Origem" como filtro
6. RETORNE APENAS JSON VÁLIDO. Sem markdown, sem explicações.

Formato JSON:
{
  "business_type": "tipo de negócio",
  "kpis": [
    { "title": "Título", "metric_column": "coluna", "aggregation": "sum|count|average|max|min", "format": "currency|number|percentage" }
  ],
  "charts": [
    { "title": "Título", "type": "line|bar|area|pie|scatter", "xAxisColumn": "coluna_x", "yAxisColumn": "coluna_y", "yAggregation": "sum|count|average", "description": "descrição" }
  ],
  "filters": [
    { "column_name": "coluna", "label": "Nome Amigável", "type": "select" }
  ]
}`;

      const { text } = await generateText({
        model: ollamaModel(),
        prompt: prompt,
        temperature: 0.15,
      });

      const cleanJsonString = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      parsedLayout = JSON.parse(cleanJsonString);
    } catch (aiError) {
      console.warn("AI generation failed, using smart fallback:", aiError);
      parsedLayout = generateSmartDashboard(
        columns,
        columnAnalysis,
        sampleData,
        uniqueAbas,
      );
    }
  } else {
    console.log(
      "OLLAMA_API_KEY not configured, using smart fallback dashboard generator",
    );
    parsedLayout = generateSmartDashboard(
      columns,
      columnAnalysis,
      sampleData,
      uniqueAbas,
    );
  }

  const object = {
    ...parsedLayout,
    brandColors: { primary: primaryColor, secondary: secondaryColor },
  };

  const existingDash = await db
    .select({ id: dashboards.id, layoutConfig: dashboards.layoutConfig })
    .from(dashboards)
    .where(eq(dashboards.name, datasetId))
    .limit(1);

  if (existingDash.length > 0) {
    const existing = existingDash[0];
    if (existing.layoutConfig) {
      const oldLayout = existing.layoutConfig as any;
      const { versions = [], shareSettings, ...oldConfig } = oldLayout;
      const snapshot = {
        timestamp: new Date().toISOString(),
        label: `Versão ${(versions as any[]).length + 1}`,
        kpisCount: (oldConfig.kpis ?? []).length,
        chartsCount: (oldConfig.charts ?? []).length,
        layoutSnapshot: oldConfig,
      };
      object.versions = [snapshot, ...(versions as any[])].slice(0, 5);
      object.shareSettings = shareSettings ?? {};
    }
    await db
      .update(dashboards)
      .set({ layoutConfig: object })
      .where(eq(dashboards.id, existing.id));
  } else {
    await db.insert(dashboards).values({
      workspaceId,
      name: datasetId,
      layoutConfig: object,
    });
  }
}
