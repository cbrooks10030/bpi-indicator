import { whyChoose, walkthrough } from "@/lib/config";
import { Check } from "./Icons";

export function Walkthrough() {
  return (
    <section id="features" className="border-y border-line bg-subtle">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-ink">The indicator</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need. Fully automated.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-ink/60">
            BPI anticipates momentum shifts, swing formations and orderflow continuations — highlighting
            where price is most likely to deliver, so you stay ahead of the curve.
          </p>
        </div>

        {/* Why choose */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyChoose.map((w) => (
            <div key={w.title} className="rounded-2xl border border-line bg-paper p-6 card-shadow">
              <Check className="h-5 w-5 text-accent" />
              <h3 className="mt-3 font-semibold">{w.title}</h3>
              <p className="mt-2 text-sm text-ink/60">{w.body}</p>
            </div>
          ))}
        </div>

        {/* Feature-by-feature walkthrough */}
        <div className="mt-16 space-y-16">
          {walkthrough.map((f, i) => (
            <div
              key={f.title}
              className={`grid items-center gap-8 lg:grid-cols-2 ${i % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""}`}
            >
              <div>
                <h3 className="text-2xl font-bold tracking-tight">{f.title}</h3>
                <p className="mt-3 max-w-md text-ink/60">{f.body}</p>
              </div>
              {/* Image slot — drop a GIF/screenshot at public{f.image} to replace. */}
              <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-line bg-[#0c0e14] card-shadow">
                <span className="font-mono text-xs text-white/30">{f.image}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
