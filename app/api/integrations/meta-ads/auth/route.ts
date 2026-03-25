import { env } from "@/env";

export async function GET() {
  if (!env.META_APP_ID || !env.META_APP_SECRET) {
    return Response.json(
      { error: "Meta credentials not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: env.META_APP_ID!,
    redirect_uri: env.META_REDIRECT_URI!,
    scope: "ads_read,business_management,pages_read_engagement",
    response_type: "code",
  });

  return Response.redirect(
    `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`
  );
}
