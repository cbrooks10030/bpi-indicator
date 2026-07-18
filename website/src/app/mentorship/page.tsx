import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import { mentorship, site } from "@/lib/config";

export const metadata: Metadata = {
  title: `Mentorship — ${site.name}`,
  description: "One-to-one and group mentorship built around the BPI toolkit.",
};

export default function MentorshipPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="dot-bg">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-ink">
            {mentorship.tagline}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{mentorship.heading}</h1>
          <p className="mx-auto mt-4 max-w-xl text-ink/60">{mentorship.intro}</p>
          <span className="mt-6 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent-ink">
            Opening soon — join the waitlist below
          </span>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {mentorship.includes.map((item) => (
            <div key={item.title} className="rounded-2xl border border-line bg-paper p-6 card-shadow">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-ink/45">
          Mentorship is educational and does not guarantee trading results. Trading futures carries a
          substantial risk of loss.
        </p>
      </section>
      <div id="newsletter">
        <Newsletter />
      </div>
      <Footer />
    </div>
  );
}
