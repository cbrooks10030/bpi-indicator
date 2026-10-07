import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { timingSafeEqualStr, randomToken, rateLimit, clientIp } from "@/lib/security";

export const runtime = "nodejs";

// TradingView usernames: letters, digits and underscores only.
const TV_RE = /^[A-Za-z0-9_]{2,30}$/;

export async function POST(req: NextRequest) {
  const rl = rateLimit(`tv:${clientIp(req.headers)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  let body: { session_id?: string; username?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const username = (body.username || "").trim();
  const sessionId = (body.session_id || "").trim();
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }
  if (!TV_RE.test(username)) {
    return NextResponse.json(
      { error: "Enter a valid TradingView username (letters, numbers, underscore)." },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";
    const customerId = session.customer as string | null;
    if (!paid || !customerId) {
      return NextResponse.json({ error: "Payment not verified." }, { status: 402 });
    }

    const customer = await stripe.customers.retrieve(customerId);
    if ("deleted" in customer && customer.deleted) {
      return NextResponse.json({ error: "Payment not verified." }, { status: 402 });
    }
    const meta = "metadata" in customer ? customer.metadata ?? {} : {};

    // First-come ownership: block a leaked session_id from overwriting an
    // already-set username from a different browser.
    const existingSecret = meta.activation_secret;
    const cookieSecret = req.cookies.get("bpi_activation")?.value ?? "";
    if (
      meta.tradingview_username &&
      existingSecret &&
      !timingSafeEqualStr(existingSecret, cookieSecret)
    ) {
      return NextResponse.json(
        { error: "This purchase is already linked. Contact support to change it." },
        { status: 409 }
      );
    }

    const activationSecret = existingSecret || randomToken();
    await stripe.customers.update(customerId, {
      metadata: {
        tradingview_username: username,
        activation_secret: activationSecret,
      },
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("bpi_activation", activationSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to save.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
