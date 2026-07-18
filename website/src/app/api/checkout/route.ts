import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { plans, site } from "@/lib/config";
import { rateLimit, clientIp } from "@/lib/security";

export async function POST(req: NextRequest) {
  const limit = rateLimit(`checkout:${clientIp(req.headers)}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Check back soon." },
      { status: 503 }
    );
  }

  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const plan = plans.find((p) => p.id === body.plan);
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const priceId = process.env[plan.priceEnvKey];
  if (!priceId) {
    return NextResponse.json(
      { error: `This plan is not available yet (${plan.name}).` },
      { status: 503 }
    );
  }

  const origin = req.headers.get("origin") || site.url;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      metadata: { plan: plan.id },
      subscription_data: { metadata: { plan: plan.id } },
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
