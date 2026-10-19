import { whyChoose, walkthrough } from "@/lib/config";
import { Check } from "./Icons";
import { MediaPanel } from "./MediaPanel";
import { Reveal } from "./Reveal";

export function Walkthrough() {
  return (
    <section id="features" className="bg-paper">
      {/* Big statement */}
      <div className="mx-auto max-w-6xl px-6 pt-28 pb-16 text-center">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-ink">The indicator</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Everything you need.
            <br />
            <span className="text-ink/40">Fully automated.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink/60">
            BPI marks the fractal model for you — Candle 2 sweeps, CISD confirmations, protected swings,
            higher-timeframe candles and key levels — so you focus on execution instead of drawing.
          </p>
        </Reveal>
      </div>

      {/* Why choose — glass tiles */}
      <div className="mx-auto grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {whyChoose.map((w, i) => (
          <Reveal key={w.title} delay={i * 80}>
            <div className="h-full rounded-3xl bg-subtle p-7 transition duration-500 hover:-translate-y-1 hover:bg-[#eef0f3]">
              <Check className="h-5 w-5 text-accent" />
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{w.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Feature stories */}
      <div className="mx-auto max-w-6xl space-y-28 px-6 py-28">
        {walkthrough.map((f, i) => {
          const flip = i % 2 === 1;
          return (
            <Reveal key={f.title}>
              <div className={`grid items-center gap-10 lg:grid-cols-12 ${flip ? "lg:[&>div:first-child]:order-2" : ""}`}>
                <div className="lg:col-span-7">
                  <MediaPanel media={f.media} tone={i % 3 === 2 ? "light" : "dark"} />
                </div>
                <div className="lg:col-span-5">
                  <p className="text-sm font-semibold uppercase tracking-widest text-accent-ink">{f.eyebrow}</p>
                  <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{f.title}</h3>
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-ink/60">{f.body}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
