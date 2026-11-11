import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { timingSafeEqualStr, rateLimit, clientIp } from "@/lib/security";

export const runtime = "nodejs";

type Member = {
  email: string | null;
  tradingview_username: string | null;
  discord_username: string | null;
  discord_connected: boolean;
  plan: string | null;
  status: string;
  renews_or_expires: string | null;
};

// Lists active paying members with their TradingView username + Discord status
// so you know who to grant invite-only script access to. Protect with
// ADMIN_TOKEN:
//   GET /api/admin/members  (header: Authorization: Bearer <ADMIN_TOKEN>)
export async function GET(req: NextRequest) {
  const rl = rateLimit(`admin:${clientIp(req.headers)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const stripe = getStripe();
  const adminToken = process.env.ADMIN_TOKEN;
  if (!stripe || !adminToken) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (!timingSafeEqualStr(auth, `Bearer ${adminToken}`)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const byId = new Map<string, Member>();

    // Active subscriptions (monthly / annual).
    const subs = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      expand: ["data.customer"],
    });
    for (const s of subs.data) {
      const c = s.customer as Stripe.Customer;
      if ("deleted" in c && c.deleted) continue;
      byId.set(c.id, {
        email: c.email,
        tradingview_username: c.metadata?.tradingview_username ?? null,
        discord_username: c.metadata?.discord_username ?? null,
        discord_connected: Boolean(c.metadata?.discord_id),
        plan: s.metadata?.plan ?? "subscription",
        status: "active",
        renews_or_expires: new Date(s.current_period_end * 1000).toISOString(),
      });
    }

    const members = Array.from(byId.values());
    const pendingTradingView = members.filter((m) => !m.tradingview_username);
    return NextResponse.json({ count: members.length, pendingTradingView, members });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
