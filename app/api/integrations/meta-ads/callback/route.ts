import { env } from "@/env";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return Response.redirect(
      `${env.NEXT_PUBLIC_BASE_URL}/dashboard/upload?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return Response.redirect(
      `${env.NEXT_PUBLIC_BASE_URL}/dashboard/upload?error=no_code`
    );
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.META_APP_ID!,
          client_secret: env.META_APP_SECRET!,
          redirect_uri: env.META_REDIRECT_URI!,
          code,
        }).toString(),
      }
    );

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      throw new Error(tokenData.error?.message || "Failed to get access token");
    }

    // Get ad accounts
    const accountsRes = await fetch(
      `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status,currency&limit=25`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const accountsData = await accountsRes.json();
    const accounts = (accountsData.data || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      accountStatus: a.account_status,
      currency: a.currency,
    }));

    // Encode token for process step
    const encodedToken = Buffer.from(
      JSON.stringify(tokenData)
    ).toString("base64");

    const redirectUrl = new URL(`${env.NEXT_PUBLIC_BASE_URL}/dashboard/upload`);
    redirectUrl.searchParams.set("meta", "true");
    redirectUrl.searchParams.set("accounts", JSON.stringify(accounts));
    redirectUrl.searchParams.set("token", encodedToken);

    return Response.redirect(redirectUrl.toString());
  } catch (err: any) {
    console.error("Meta Ads callback error:", err);
    return Response.redirect(
      `${env.NEXT_PUBLIC_BASE_URL}/dashboard/upload?error=${encodeURIComponent(err.message)}`
    );
  }
}
