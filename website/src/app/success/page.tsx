import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import { site } from "@/lib/config";
import { AccessForm } from "@/components/AccessForm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { session_id?: string; discord?: string };
};

export default async function SuccessPage({ searchParams }: Props) {
  const sessionId = searchParams.session_id;
  const stripe = getStripe();

  let paid = false;
  let email: string | null = null;
  let discordConnected = false;
  let tradingview: string | null = null;

  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid" || session.status === "complete";
      email = session.customer_details?.email ?? null;
      const customerId = session.customer as string | null;
      if (customerId) {
        const customer = await stripe.customers.retrieve(customerId);
        if (!("deleted" in customer)) {
          discordConnected = Boolean(customer.metadata?.discord_id);
          tradingview = customer.metadata?.tradingview_username ?? null;
        }
      }
    } catch {
      paid = false;
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16">
      <Link href="/" className="mb-10 flex items-center gap-2 font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 font-mono text-accent">B</span>
        {site.name}
      </Link>

      {!paid ? (
        <div className="rounded-2xl border border-white/10 bg-panel p-8">
          <h1 className="text-2xl font-bold">We couldn&apos;t confirm your payment</h1>
          <p className="mt-3 text-white/60">
            If you just paid, give it a moment and refresh. Otherwise head back and
            try again, or email{" "}
            <a className="text-accent" href={`mailto:${site.supportEmail}`}>
              {site.supportEmail}
            </a>
            .
          </p>
          <Link href="/#pricing" className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 font-semibold text-black">
            Back to pricing
          </Link>
        </div>
      ) : (
        <div>
          <div className="rounded-2xl border border-accent/30 bg-accent/10 p-6">
            <h1 className="text-2xl font-bold text-accent">You&apos;re in. 🎉</h1>
            <p className="mt-2 text-white/70">
              Payment confirmed{email ? ` for ${email}` : ""}. Two quick steps to
              activate your access.
            </p>
          </div>

          <AccessForm
            sessionId={sessionId!}
            discordConnected={discordConnected || searchParams.discord === "ok"}
            tradingview={tradingview}
          />

          <p className="mt-8 text-center text-xs text-white/40">
            TradingView access is granted manually, usually within a few hours.
            Questions? {""}
            <a className="text-accent" href={`mailto:${site.supportEmail}`}>
              {site.supportEmail}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
