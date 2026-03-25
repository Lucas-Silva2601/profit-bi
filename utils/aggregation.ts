import { KPI } from "@/components/dashboard/KPICards";
import { ChartConfig } from "@/components/dashboard/DynamicChart";

export function aggregateKPI(
  rows: { row_data: Record<string, unknown> }[],
  kpiConfig: {
    metric_column: string;
    aggregation: string;
    format?: string;
    title: string;
  }
): KPI {
  let total = 0;
  let max = -Infinity;
  let min = Infinity;
  const count = rows.length;

  rows.forEach(({ row_data }) => {
    const val = Number(row_data[kpiConfig.metric_column]) || 0;
    total += val;
    if (val > max) max = val;
    if (val < min) min = val;
  });

  let result = 0;
  if (kpiConfig.aggregation === "sum") result = total;
  if (kpiConfig.aggregation === "average")
    result = count > 0 ? total / count : 0;
  if (kpiConfig.aggregation === "count") result = count;
  if (kpiConfig.aggregation === "max") result = max;
  if (kpiConfig.aggregation === "min") result = min;

  const formattedValue =
    kpiConfig.format === "currency"
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(result)
      : kpiConfig.format === "percentage"
        ? `${result.toFixed(2)}%`
        : new Intl.NumberFormat("pt-BR").format(result);

  return {
    title: kpiConfig.title,
    value: formattedValue,
    numericValue: result,
    change: "--",
    trend: "up",
    iconName: kpiConfig.format === "currency" ? "dollar" : "cart",
  };
}

export function aggregateChartData(
  rows: { row_data: Record<string, unknown> }[],
  chartConfig: { xAxisColumn: string; yAxisColumn: string; type?: string; title?: string }
) {
  const aggMap: Record<string, number> = {};
  let validCount = 0;
  let invalidCount = 0;

  rows.forEach(({ row_data }) => {
    const rawX = row_data[chartConfig.xAxisColumn];
    const rowY = Number(row_data[chartConfig.yAxisColumn]) || 0;

    // Filtra valores nulos, undefined, vazios ou apenas espaços
    if (rawX === null || rawX === undefined) {
      invalidCount++;
      return;
    }
    const rowX = String(rawX).trim();
    if (rowX === "" || rowX.toLowerCase() === "desconhecido" || rowX.toLowerCase() === "unknown" || rowX.toLowerCase() === "n/a" || rowX.toLowerCase() === "null") {
      invalidCount++;
      return;
    }

    validCount++;
    const cleanX =
      rowX.length >= 5 && rowX.includes("/")
        ? rowX.substring(0, 5)
        : rowX.substring(0, 20);

    if (!aggMap[cleanX]) aggMap[cleanX] = 0;
    aggMap[cleanX] += rowY;
  });

  // Se mais de 40% dos dados são inválidos, o gráfico não é confiável
  const totalRows = validCount + invalidCount;
  const invalidRatio = totalRows > 0 ? invalidCount / totalRows : 0;

  let parsedData = Object.keys(aggMap)
    .map((k) => ({ xValue: k, yValue: aggMap[k] }))
    .sort((a, b) => b.yValue - a.yValue);

  // Para gráficos de pizza, limita a 8 fatias e agrupa o resto como "Outros"
  if (chartConfig.type === "pie" && parsedData.length > 8) {
    const top = parsedData.slice(0, 7);
    const others = parsedData.slice(7).reduce((sum, d) => sum + d.yValue, 0);
    if (others > 0) {
      top.push({ xValue: "Outros", yValue: others });
    }
    parsedData = top;
  } else {
    // Para outros gráficos, limita a 15 itens mais relevantes
    parsedData = parsedData.slice(0, 15);
  }

  return {
    config: chartConfig as ChartConfig,
    data: parsedData,
    dataQuality: {
      validRows: validCount,
      invalidRows: invalidCount,
      invalidRatio: Math.round(invalidRatio * 100),
    },
  };
}

export function getAvailableFilters(
  rows: { row_data: Record<string, unknown> }[],
  filterConfig: { column_name: string; label: string }[]
) {
  return filterConfig.map((f) => {
    const uniqueVals = new Set<string>();
    rows.forEach((r) => {
      const v = r.row_data[f.column_name];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        uniqueVals.add(String(v).trim());
      }
    });
    return {
      column_name: f.column_name,
      label: f.label,
      options: Array.from(uniqueVals).sort(),
    };
  });
}

export function applyFilters(
  rows: { row_data: Record<string, unknown> }[],
  filterConfig: { column_name: string }[],
  searchParams: Record<string, string | string[] | undefined>
) {
  let filteredRows = rows;
  const activeFilters: Record<string, string> = {};

  filterConfig.forEach((f) => {
    const colParams = searchParams[f.column_name];
    if (colParams && typeof colParams === "string" && colParams !== "all") {
      activeFilters[f.column_name] = colParams;
      filteredRows = filteredRows.filter(
        (r) => String(r.row_data[f.column_name] || "").trim() === colParams
      );
    }
  });

  return { filteredRows, activeFilters };
}
