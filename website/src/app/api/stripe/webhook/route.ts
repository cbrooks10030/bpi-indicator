import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { removeRole } from "@/lib/discord";

// Stripe requires the raw request body to verify the signature.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid signature.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      // A member cancelled / their subscription lapsed — revoke Discord access.
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        if (!("deleted" in customer)) {
          const discordId = customer.metadata?.discord_id;
          if (discordId) await removeRole(discordId);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    // Log but return 200 so Stripe doesn't hammer retries for a Discord hiccup.
    console.error("Webhook handler error:", e);
  }

  return NextResponse.json({ received: true });
}
