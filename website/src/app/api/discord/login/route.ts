import { NextRequest, NextResponse } from "next/server";
import { randomToken, rateLimit, clientIp } from "@/lib/security";

export function GET(req: NextRequest) {
  const rl = rateLimit(`discord-login:${clientIp(req.headers)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Discord is not configured yet." },
      { status: 503 }
    );
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.json({ error: "Missing or invalid session." }, { status: 400 });
  }

  // CSRF protection: bind the OAuth flow to a nonce stored in an httpOnly
  // cookie. The callback rejects the request unless the returned state carries
  // the same nonce, preventing login-CSRF / account-fixation.
  const nonce = randomToken(24);
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/discord/callback`;
  const url = new URL("https://discord.com/api/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "identify guilds.join");
  url.searchParams.set("state", `${sessionId}.${nonce}`);
  url.searchParams.set("prompt", "consent");

  const res = NextResponse.redirect(url.toString());
  res.cookies.set("discord_oauth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
