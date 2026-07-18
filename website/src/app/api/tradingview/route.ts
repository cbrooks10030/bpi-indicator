import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
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
  if (!body.session_id || !username) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }
  if (username.length > 60) {
    return NextResponse.json({ error: "Username too long." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(body.session_id);
    const paid = session.payment_status === "paid" || session.status === "complete";
    const customerId = session.customer as string | null;
    if (!paid || !customerId) {
      return NextResponse.json({ error: "Payment not verified." }, { status: 402 });
    }
    await stripe.customers.update(customerId, {
      metadata: { tradingview_username: username },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to save.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
