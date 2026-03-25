import { NextResponse } from "next/server";
import { db } from "@/db";
import { dashboards, datasets, workspaces } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { buildDashboardFromDataset } from "@/utils/ai/generateDashboard";
import { rateLimit } from "@/utils/rate-limit";
import { generateDashboardSchema } from "@/utils/validation";
import { getSessionUser } from "@/utils/session";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`ai-retry:${user.id}`, 5, 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Limite de tentativas excedido. Aguarde um momento." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = generateDashboardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { datasetId, workspaceId } = parsed.data;

    // Ownership verification
    const [dataset] = await db
      .select({ id: datasets.id })
      .from(datasets)
      .innerJoin(workspaces, eq(datasets.workspaceId, workspaces.id))
      .where(and(eq(datasets.id, datasetId), eq(workspaces.ownerId, user.id)))
      .limit(1);

    if (!dataset) {
      return NextResponse.json(
        { error: "Sem permissão para acessar este dataset" },
        { status: 404 },
      );
    }

    await buildDashboardFromDataset(datasetId, workspaceId);

    const check = await db
      .select({ id: dashboards.id })
      .from(dashboards)
      .where(eq(dashboards.name, datasetId))
      .limit(1);

    if (check.length > 0) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error(
        "A IA falhou em estruturar o JSON corretamente nesta tentativa.",
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
