import { google } from "googleapis";
import { env } from "@/env";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_ANALYTICS_REDIRECT_URI || env.GOOGLE_REDIRECT_URI
);

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
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Use Analytics Admin API to list properties
    const analyticsadmin = google.analyticsadmin({
      version: "v1beta",
      auth: oauth2Client,
    });

    const accountsRes = await analyticsadmin.accounts.list();
    const accounts = accountsRes.data.accounts || [];

    // For each account, list properties
    const allProperties: any[] = [];
    for (const account of accounts) {
      try {
        const propsRes = await analyticsadmin.properties.list({
          pageSize: 50,
        });
        const props = propsRes.data.properties || [];
        allProperties.push(
          ...props.map((p) => ({
            id: p.name?.replace("properties/", ""),
            displayName: p.displayName,
            accountName: account.displayName,
          }))
        );
      } catch {
        // Skip accounts without access
      }
    }

    // Encode token for process step
    const encodedToken = Buffer.from(JSON.stringify(tokens)).toString("base64");

    const redirectUrl = new URL(`${env.NEXT_PUBLIC_BASE_URL}/dashboard/upload`);
    redirectUrl.searchParams.set("analytics", "true");
    redirectUrl.searchParams.set(
      "properties",
      JSON.stringify(allProperties)
    );
    redirectUrl.searchParams.set("token", encodedToken);

    return Response.redirect(redirectUrl.toString());
  } catch (err: any) {
    console.error("Google Analytics callback error:", err);
    return Response.redirect(
      `${env.NEXT_PUBLIC_BASE_URL}/dashboard/upload?error=${encodeURIComponent(err.message)}`
    );
  }
}
