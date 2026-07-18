import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { exchangeCode, addMemberWithRole } from "@/lib/discord";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const sessionId = req.nextUrl.searchParams.get("state");
  const origin = req.nextUrl.origin;

  if (!code || !sessionId) {
    return NextResponse.redirect(`${origin}/success?session_id=${sessionId ?? ""}&discord=error`);
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.redirect(`${origin}/success?session_id=${sessionId}&discord=error`);
  }

  try {
    // Verify the Stripe session is genuinely paid before granting access.
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";
    const customerId = session.customer as string | null;
    if (!paid || !customerId) {
      return NextResponse.redirect(`${origin}/success?session_id=${sessionId}&discord=error`);
    }

    const redirectUri = `${origin}/api/discord/callback`;
    const { accessToken, user } = await exchangeCode(code, redirectUri);
    await addMemberWithRole(user.id, accessToken);

    await stripe.customers.update(customerId, {
      metadata: { discord_id: user.id, discord_username: user.username },
    });

    return NextResponse.redirect(`${origin}/success?session_id=${sessionId}&discord=ok`);
  } catch (e) {
    console.error("Discord callback error:", e);
    return NextResponse.redirect(`${origin}/success?session_id=${sessionId}&discord=error`);
  }
}
