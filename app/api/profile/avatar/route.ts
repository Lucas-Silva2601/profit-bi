import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/utils/session";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"];

/** Serve a foto de perfil (bytes armazenados no próprio Postgres). */
export async function GET() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const [profile] = await db
    .select({ avatarData: profiles.avatarData, avatarMime: profiles.avatarMime })
    .from(profiles)
    .where(eq(profiles.id, u.id))
    .limit(1);

  if (!profile?.avatarData) {
    return NextResponse.json({ error: "Avatar não encontrado" }, { status: 404 });
  }

  return new NextResponse(Buffer.from(profile.avatarData), {
    headers: {
      "Content-Type": profile.avatarMime || "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

/** Upload da foto de perfil (FormData com o campo "file"). */
export async function POST(req: Request) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nenhum arquivo recebido" }, { status: 400 });
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use JPG, PNG, GIF ou WebP." },
        { status: 400 }
      );
    }
    if (file.size > MAX_AVATAR_BYTES) {
      return NextResponse.json(
        { error: "A imagem deve ter no máximo 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await db
      .update(profiles)
      .set({ avatarData: buffer, avatarMime: file.type, updatedAt: new Date() })
      .where(eq(profiles.id, u.id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erro no upload: " + (err.message || "desconhecido") },
      { status: 500 }
    );
  }
}

/** Remove a foto de perfil. */
export async function DELETE() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  await db
    .update(profiles)
    .set({ avatarData: null, avatarMime: null, updatedAt: new Date() })
    .where(eq(profiles.id, u.id));

  return NextResponse.json({ success: true });
}
