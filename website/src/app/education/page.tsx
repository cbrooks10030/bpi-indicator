import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import { articles, site } from "@/lib/config";

export const metadata: Metadata = {
  title: `Education — ${site.name}`,
  description: "ICT trading concepts, strategies and breakdowns from BPI.",
};

export default function EducationPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="dot-bg">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-ink">Education</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Trading education center</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/60">
            Plain-English breakdowns of the ICT concepts BPI is built around — so you understand what
            the tool is showing you and why it matters. For education only, not financial advice.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/education/${a.slug}`}
              className="group flex flex-col rounded-2xl border border-line bg-paper p-6 card-shadow transition hover:-translate-y-1"
            >
              <span className="inline-block w-fit rounded-full bg-subtle px-3 py-1 text-xs font-semibold text-ink/60">
                {a.tag}
              </span>
              <h3 className="mt-4 font-semibold group-hover:text-accent-ink">{a.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{a.blurb}</p>
              <span className="mt-4 inline-block text-xs font-medium text-ink/40">
                {a.readingTime} · Read →
              </span>
            </Link>
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
