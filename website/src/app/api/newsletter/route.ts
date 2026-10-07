import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/security";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Captures newsletter signups. By default it just validates + accepts the email
// (logged server-side). To actually store subscribers, wire this to your email
// provider (Mailchimp/ConvertKit/Beehiiv/Resend) using a server-only API key.
export async function POST(req: NextRequest) {
  const rl = rateLimit(`newsletter:${clientIp(req.headers)}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // TODO: forward `email` to your email service provider here.
  console.log(`[newsletter] signup: ${email}`);

  return NextResponse.json({ ok: true });
}
