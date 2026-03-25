import { google } from "googleapis";
import { env } from "@/env";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_ANALYTICS_REDIRECT_URI || env.GOOGLE_REDIRECT_URI
);

export async function GET() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return Response.json(
      { error: "Google credentials not configured" },
      { status: 500 }
    );
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/analytics",
    ],
    prompt: "consent",
  });

  return Response.redirect(url);
}
