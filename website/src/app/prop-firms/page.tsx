import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { propFirms, site } from "@/lib/config";

export const metadata: Metadata = {
  title: `Prop Firms — ${site.name}`,
  description: "Trusted prop firm partners and exclusive discounts for BPI traders.",
};

export default function PropFirmsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="dot-bg">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-ink">Partners</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Prop firm partners</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/60">
            Trade BPI with funded capital. These are the firms we trust — with exclusive discounts for
            our community. (Add your affiliate links in <code>src/lib/config.ts</code>.)
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {propFirms.map((p, i) => (
            <a
              key={i}
              href={p.href}
              className="rounded-2xl border border-line bg-paper p-7 card-shadow transition hover:-translate-y-1"
            >
              <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-ink">
                {p.discount}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{p.name}</h3>
              <p className="mt-2 text-sm text-ink/60">{p.blurb}</p>
            </a>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-ink/45">
          Prop firm partnerships may pay us a commission. Trading futures carries a substantial risk of loss.
        </p>
      </section>
      <Footer />
    </div>
  );
}
