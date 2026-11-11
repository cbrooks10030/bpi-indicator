import Link from "next/link";
import { propFirms } from "@/lib/config";
import { Arrow } from "./Icons";

export function PropFirmsPreview() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-ink">Partners</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Trusted prop firms</h2>
          <p className="mt-3 max-w-xl text-ink/60">
            Get funded and trade BPI with a bigger account. Exclusive discounts with our partners.
          </p>
        </div>
        <Link href="/prop-firms" className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-accent-ink">
          View all <Arrow className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {propFirms.map((p, i) => (
          <a
            key={i}
            href={p.href}
            className="rounded-2xl border border-line bg-paper p-6 card-shadow transition hover:-translate-y-1"
          >
            <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-ink">
              {p.discount}
            </span>
            <h3 className="mt-4 font-semibold">{p.name}</h3>
            <p className="mt-2 text-sm text-ink/60">{p.blurb}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
