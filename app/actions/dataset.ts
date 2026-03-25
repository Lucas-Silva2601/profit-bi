"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { datasets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/utils/session";
import { userOwnsDataset } from "@/utils/workspace";

export async function updateDatasetName(datasetId: string, newName: string) {
  if (!datasetId || !newName || newName.trim() === "") {
    throw new Error("ID ou Nome inválido");
  }

  const user = await requireUser();

  // Verificar se o dataset pertence ao usuário (Workspace dele)
  if (!(await userOwnsDataset(user.id, datasetId))) {
    throw new Error("Dataset não encontrado ou sem permissão");
  }

  await db
    .update(datasets)
    .set({ name: newName.trim() })
    .where(eq(datasets.id, datasetId));

  // Revalidar rotas que listam datasets e dashboards
  revalidatePath("/");
  revalidatePath(`/bi/[id]`, "page");
  revalidatePath(`/share/[token]`, "page");

  return true;
}
