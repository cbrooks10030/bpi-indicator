import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { ChartMock } from "@/components/ChartMock";
import { Hub } from "@/components/Hub";
import { Walkthrough } from "@/components/Walkthrough";
import { Newsletter } from "@/components/Newsletter";
import { Socials } from "@/components/Socials";
import { PropFirmsPreview } from "@/components/PropFirmsPreview";
import { site } from "@/lib/config";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden dot-bg">
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-subtle px-3 py-1 text-xs font-medium text-ink/70">
              Built for ICT traders · TradingView
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Master the market with <span className="text-accent-ink">BPI.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink/60">{site.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#pricing"
                className="rounded-full bg-ink px-6 py-3 font-semibold text-paper transition hover:bg-ink/85"
              >
                Get access
              </a>
              <a
                href="#features"
                className="rounded-full border border-line px-6 py-3 font-semibold text-ink/80 transition hover:bg-subtle"
              >
                See what&apos;s inside
              </a>
            </div>
            <div className="mt-8">
              <Socials />
            </div>
          </div>
          <div className="animate-float">
            <ChartMock />
          </div>
        </div>
      </section>

      {/* Hub cards */}
      <Hub />

      {/* Indicator walkthrough */}
      <Walkthrough />

      {/* Prop firms preview */}
      <PropFirmsPreview />

      <Pricing />

      {/* Newsletter */}
      <div id="newsletter">
        <Newsletter />
      </div>

      <FAQ />
      <Footer />
    </div>
  );
}
