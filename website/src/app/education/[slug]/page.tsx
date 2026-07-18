import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import { articles, site } from "@/lib/config";

type Params = { params: { slug: string } };

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) return { title: `Education — ${site.name}` };
  return {
    title: `${article.title} — ${site.name}`,
    description: article.blurb,
  };
}

export default function ArticlePage({ params }: Params) {
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen">
      <Header />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/education" className="text-sm font-medium text-accent-ink hover:underline">
          ← All articles
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <span className="inline-block rounded-full bg-subtle px-3 py-1 text-xs font-semibold text-ink/60">
            {article.tag}
          </span>
          <span className="text-xs text-ink/40">{article.readingTime}</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>
        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink/75">
          {article.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-line bg-subtle p-6 text-sm text-ink/60">
          <p className="font-semibold text-ink">See it on your charts</p>
          <p className="mt-1">
            BPI auto-detects the structures described above so you don&apos;t have to draw them by hand.
          </p>
          <Link
            href="/#pricing"
            className="mt-4 inline-block rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition hover:bg-ink/85"
          >
            Get access
          </Link>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-ink/45">
          For educational purposes only. Not financial advice. Trading futures carries a substantial
          risk of loss.
        </p>
      </article>
      <div id="newsletter">
        <Newsletter />
      </div>
      <Footer />
    </div>
  );
}
