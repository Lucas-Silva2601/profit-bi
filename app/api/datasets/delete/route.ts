import { NextResponse } from "next/server";
import { db } from "@/db";
import { dashboards, datasets, workspaces } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { rateLimit } from "@/utils/rate-limit";
import { deleteDatasetSchema } from "@/utils/validation";
import { getSessionUser } from "@/utils/session";
import { getUserWorkspaceIds } from "@/utils/workspace";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limit = rateLimit(`delete:${user.id}`, 10, 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Muitas requisições. Aguarde um momento." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = deleteDatasetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { datasetId } = parsed.data;

    // Verificação atômica de posse em uma única query
    const workspaceIds = await getUserWorkspaceIds(user.id);
    const [dataset] = await db
      .select({ id: datasets.id, workspaceId: datasets.workspaceId })
      .from(datasets)
      .where(
        and(
          eq(datasets.id, datasetId),
          workspaceIds.length > 0
            ? inArray(datasets.workspaceId, workspaceIds)
            : undefined
        )
      )
      .limit(1);

    if (!dataset || !dataset.workspaceId)
      return NextResponse.json(
        { error: "Dataset não localizado." },
        { status: 404 }
      );

    const [workspace] = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(and(eq(workspaces.id, dataset.workspaceId), eq(workspaces.ownerId, user.id)))
      .limit(1);

    if (!workspace)
      return NextResponse.json(
        { error: "Sem permissão." },
        { status: 401 }
      );

    // Excluir metadados da IA
    await db.delete(dashboards).where(eq(dashboards.name, datasetId));

    // O Postgres cuida da limpeza das dataset_rows (ON DELETE CASCADE)
    await db.delete(datasets).where(eq(datasets.id, datasetId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro deletando BI:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
