import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export type LegalSection = { heading: string; body: string[] };

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen">
      <Header />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-ink/45">Last updated: {updated}</p>
        {intro ? <p className="mt-6 text-[15px] leading-relaxed text-ink/75">{intro}</p> : null}
        <div className="mt-10 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-semibold">{s.heading}</h2>
              <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-ink/75">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
      <Footer />
    </div>
  );
}
