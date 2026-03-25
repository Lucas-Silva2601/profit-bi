import { auth } from "@/utils/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Rotas da Better Auth: /api/auth/sign-in, /api/auth/sign-out, /api/auth/callback/google, etc.
export const { GET, POST } = toNextJsHandler(auth);
