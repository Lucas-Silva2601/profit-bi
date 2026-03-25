import { NextResponse } from "next/server";
import { db } from "@/db";
import { datasets } from "@/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getSessionUser } from "@/utils/session";
import { getUserWorkspaceIds } from "@/utils/workspace";

/** Lista os datasets do primeiro workspace do usuário (usado pelo lobby). */
export async function GET() {
  const user = await getSessionUser();
  if (!user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const workspaceIds = await getUserWorkspaceIds(user.id);
  if (workspaceIds.length === 0) {
    return NextResponse.json({ datasets: [] });
  }

  const rows = await db
    .select({
      id: datasets.id,
      name: datasets.name,
      status: datasets.status,
      created_at: datasets.createdAt,
    })
    .from(datasets)
    .where(and(inArray(datasets.workspaceId, workspaceIds)))
    .orderBy(desc(datasets.createdAt));

  return NextResponse.json({ datasets: rows });
}
