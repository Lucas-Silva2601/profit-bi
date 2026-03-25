import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, user, workspaces } from "@/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { auth } from "@/utils/auth";
import { getSessionUser } from "@/utils/session";

/** Garante que o perfil exista (fallback para contas criadas sem o hook). */
async function ensureProfile(u: { id: string; name: string; email: string }) {
  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, u.id))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(profiles)
    .values({ id: u.id, fullName: u.name || "Usuário", email: u.email })
    .returning();
  return created!;
}

/** Dados do perfil do usuário autenticado. */
export async function GET() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const profile = await ensureProfile(u);

  const [workspace] = await db
    .select({ name: workspaces.name })
    .from(workspaces)
    .where(and(eq(workspaces.ownerId, u.id), isNull(workspaces.deletedAt)))
    .orderBy(asc(workspaces.createdAt))
    .limit(1);

  return NextResponse.json({
    id: u.id,
    name: profile.fullName,
    email: u.email,
    emailVerified: !!u.emailVerified,
    dateOfBirth: profile.dateOfBirth ?? "",
    phone: profile.phone ?? "",
    gender: profile.gender ?? "",
    hasAvatar: !!profile.avatarData,
    workspaceName: workspace?.name ?? "Workspace",
  });
}

/** Atualiza dados do perfil (nome, nascimento, telefone, gênero). */
export async function PUT(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { fullName, dateOfBirth, phone, gender } = body ?? {};

  if (!fullName || typeof fullName !== "string" || fullName.trim() === "") {
    return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
  }

  await ensureProfile(u);

  await db
    .update(profiles)
    .set({
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth || null,
      phone: phone || null,
      gender: gender || null,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, u.id));

  // Mantém o nome do Better Auth em sincronia
  await db
    .update(user)
    .set({ name: fullName.trim(), updatedAt: new Date() })
    .where(eq(user.id, u.id));

  return NextResponse.json({ success: true });
}
