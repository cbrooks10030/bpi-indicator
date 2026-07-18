import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// Lists paying members with their TradingView username + Discord status so you
// know who to grant invite-only script access to. Protect with ADMIN_TOKEN:
//   GET /api/admin/members  (header: Authorization: Bearer <ADMIN_TOKEN>)
export async function GET(req: NextRequest) {
  const stripe = getStripe();
  const adminToken = process.env.ADMIN_TOKEN;
  if (!stripe || !adminToken) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const subs = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.customer"],
    });

    const members = subs.data.map((s) => {
      const c = s.customer as Stripe.Customer;
      return {
        email: c.email,
        tradingview_username: c.metadata?.tradingview_username ?? null,
        discord_username: c.metadata?.discord_username ?? null,
        discord_connected: Boolean(c.metadata?.discord_id),
        plan: s.metadata?.plan ?? null,
        current_period_end: new Date(s.current_period_end * 1000).toISOString(),
      };
    });

    const pendingTradingView = members.filter((m) => !m.tradingview_username);
    return NextResponse.json({ count: members.length, pendingTradingView, members });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
