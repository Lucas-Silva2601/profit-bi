import { z } from "zod";

export const dbConnectionSchema = z.object({
  connectionString: z.string(),
  tableName: z.string(),
});

export const uploadSchema = z.object({
  fileName: z.string(),
  rows: z.array(z.any()),
  mapping: z.any(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

export const chatSchema = z.object({
  datasetId: z.string(),
  question: z.string(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
  chartTitles: z.array(z.string()).optional(),
});

export const generateDashboardSchema = z.object({
  datasetId: z.string(),
  workspaceId: z.string(),
});

export const deleteDatasetSchema = z.object({
  datasetId: z.string(),
});

export const insightsSchema = z.object({
  totalVolume: z.number(),
  totalSales: z.number(),
  ticketMedio: z.number(),
  topCategory: z.string(),
});
