import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { ChartMock } from "@/components/ChartMock";
import { Icon } from "@/components/Icons";
import { features, site } from "@/lib/config";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Built for ICT traders · TradingView
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Trade ICT with <span className="text-accent">confidence.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/65">{site.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="rounded-lg bg-accent px-6 py-3 font-semibold text-black transition hover:bg-accent-soft"
              >
                Get access
              </a>
              <a
                href="#features"
                className="rounded-lg border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:bg-white/5"
              >
                See what&apos;s inside
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-white/50">
              <span>NQ · ES · Forex · Crypto</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>Works on any TradingView plan</span>
            </div>
          </div>
          <div className="animate-float">
            <ChartMock />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Every ICT model, one clean overlay
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Stop stacking a dozen scripts. BPI packages the models that actually
            matter into a single, configurable indicator.
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-panel p-6 transition hover:border-accent/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon name={f.icon} className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="border-y border-white/5 bg-panel/40">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-14 text-center sm:grid-cols-4">
          {[
            ["6+", "ICT models built in"],
            ["1", "clean overlay"],
            ["∞", "chart alerts"],
            ["24/7", "Discord community"],
          ].map(([stat, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold text-accent">{stat}</div>
              <div className="mt-1 text-sm text-white/55">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
