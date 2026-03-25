import { google } from "googleapis";
import { env } from "@/env";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return Response.redirect(`${env.NEXT_PUBLIC_BASE_URL}/dashboard/upload?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return Response.redirect(`${env.NEXT_PUBLIC_BASE_URL}/dashboard/upload?error=no_code`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // List spreadsheets from Google Drive
    const filesRes = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "files(id, name, modifiedTime)",
      orderBy: "modifiedTime desc",
      pageSize: 50,
    });

    const files = (filesRes.data.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      modifiedTime: f.modifiedTime,
    }));

    // Store tokens in a cookie for the process step
    const tokenCookie = JSON.stringify(tokens);
    const encodedToken = Buffer.from(tokenCookie).toString("base64");

    const redirectUrl = new URL(`${env.NEXT_PUBLIC_BASE_URL}/dashboard/upload`);
    redirectUrl.searchParams.set("sheets", "true");
    redirectUrl.searchParams.set("files", JSON.stringify(files));
    redirectUrl.searchParams.set("token", encodedToken);

    return Response.redirect(redirectUrl.toString());
  } catch (err: any) {
    console.error("Google Sheets callback error:", err);
    return Response.redirect(
      `${env.NEXT_PUBLIC_BASE_URL}/dashboard/upload?error=${encodeURIComponent(err.message)}`
    );
  }
}
