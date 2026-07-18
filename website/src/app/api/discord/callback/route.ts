import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { exchangeCode, addMemberWithRole } from "@/lib/discord";
import { timingSafeEqualStr, randomToken } from "@/lib/security";

export const runtime = "nodejs";

function fail(origin: string, sessionId: string) {
  const res = NextResponse.redirect(
    `${origin}/success?session_id=${encodeURIComponent(sessionId)}&discord=error`
  );
  res.cookies.delete("discord_oauth_nonce");
  return res;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state") ?? "";
  const origin = req.nextUrl.origin;

  // state is `${sessionId}.${nonce}` — split on the last dot.
  const dot = state.lastIndexOf(".");
  const sessionId = dot > 0 ? state.slice(0, dot) : "";
  const nonce = dot > 0 ? state.slice(dot + 1) : "";
  const cookieNonce = req.cookies.get("discord_oauth_nonce")?.value ?? "";

  if (!code || !sessionId) return fail(origin, sessionId);

  // CSRF check: the nonce in state must match the httpOnly cookie we set.
  if (!nonce || !cookieNonce || !timingSafeEqualStr(nonce, cookieNonce)) {
    return fail(origin, sessionId);
  }

  const stripe = getStripe();
  if (!stripe) return fail(origin, sessionId);

  try {
    // Verify the Stripe session is genuinely paid before granting access.
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";
    const customerId = session.customer as string | null;
    if (!paid || !customerId) return fail(origin, sessionId);

    const customer = await stripe.customers.retrieve(customerId);
    if ("deleted" in customer && customer.deleted) return fail(origin, sessionId);
    const meta = "metadata" in customer ? customer.metadata ?? {} : {};

    // First-come ownership: once this purchase has been claimed by a browser,
    // only that browser (holding the activation cookie) may re-link, so a
    // leaked session_id can't hijack an already-activated buyer.
    const existingSecret = meta.activation_secret;
    const cookieSecret = req.cookies.get("bpi_activation")?.value ?? "";
    if (
      meta.discord_id &&
      existingSecret &&
      !timingSafeEqualStr(existingSecret, cookieSecret)
    ) {
      return fail(origin, sessionId);
    }

    const redirectUri = `${origin}/api/discord/callback`;
    const { accessToken, user } = await exchangeCode(code, redirectUri);
    await addMemberWithRole(user.id, accessToken);

    const activationSecret = existingSecret || randomToken();
    await stripe.customers.update(customerId, {
      metadata: {
        discord_id: user.id,
        discord_username: user.username,
        activation_secret: activationSecret,
      },
    });

    const res = NextResponse.redirect(
      `${origin}/success?session_id=${encodeURIComponent(sessionId)}&discord=ok`
    );
    res.cookies.delete("discord_oauth_nonce");
    res.cookies.set("bpi_activation", activationSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e) {
    console.error("Discord callback error:", e);
    return fail(origin, sessionId);
  }
}
