import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: `Education — ${site.name}`,
  description: "ICT trading concepts, strategies and breakdowns from BPI.",
};

const articles = [
  { title: "What is the Unicorn model?", tag: "Model", blurb: "Breaker block + FVG overlap and how BPI flags it." },
  { title: "Trading the ATM model", tag: "Session", blurb: "The NY AM session model, step by step." },
  { title: "Fractal flow: C2 / C3 / C4", tag: "Framework", blurb: "How the fractal model maps manipulation and expansion." },
  { title: "Reading CISD (trend shift)", tag: "Concept", blurb: "Change in state of delivery and confirmation states." },
  { title: "Combining models for confluence", tag: "Playbook", blurb: "Why traders stack several models instead of one." },
  { title: "FVGs & liquidity basics", tag: "Concept", blurb: "Fair value gaps, imbalances and sweeps explained." },
];

export default function EducationPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="dot-bg">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-ink">Education</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Trading education center</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/60">
            Concepts, strategies and breakdowns to help you get the most out of BPI. New articles
            coming soon — subscribe below to get them first.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <div key={a.title} className="rounded-2xl border border-line bg-paper p-6 card-shadow">
              <span className="inline-block rounded-full bg-subtle px-3 py-1 text-xs font-semibold text-ink/60">
                {a.tag}
              </span>
              <h3 className="mt-4 font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{a.blurb}</p>
              <span className="mt-4 inline-block text-xs font-medium text-ink/40">Coming soon</span>
            </div>
          ))}
        </div>
      </section>
      <div id="newsletter">
        <Newsletter />
      </div>
      <Footer />
    </div>
  );
}
