"use client";

import { useState } from "react";
import { plans, planPerks, whopUrl } from "@/lib/config";
import { Check } from "./Icons";

export function Pricing() {
  const [note, setNote] = useState<string | null>(null);

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose your plan</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink/60">
          One indicator, every model included. Cancel anytime. The longer you commit, the more you save.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const url = whopUrl(plan.id);
          const buttonClasses = `mt-8 block w-full rounded-full px-4 py-3 text-center text-sm font-semibold transition ${
            plan.highlight
              ? "bg-paper text-ink hover:bg-paper/90"
              : "bg-ink text-paper hover:bg-ink/85"
          }`;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                plan.highlight
                  ? "border-ink bg-ink text-paper card-shadow"
                  : "border-line bg-paper text-ink card-shadow"
              }`}
            >
              {plan.save && (
                <span
                  className={`absolute -top-3 right-7 rounded-full px-3 py-1 text-xs font-semibold ${
                    plan.highlight ? "bg-accent text-paper" : "bg-accent/10 text-accent-ink"
                  }`}
                >
                  {plan.save}
                </span>
              )}
              <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.monthly}</span>
                <span className={plan.highlight ? "text-paper/60" : "text-ink/50"}>/mo</span>
              </div>
              <p className={`mt-2 text-sm ${plan.highlight ? "text-paper/60" : "text-ink/55"}`}>
                {plan.billed}
              </p>

              <ul className="mt-6 space-y-3 text-sm">
                {planPerks.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? "text-accent-soft" : "text-accent"}`} />
                    <span className={plan.highlight ? "text-paper/80" : "text-ink/75"}>{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClasses}>
                    Get {plan.name}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setNote("Checkout opens soon — this plan isn't live on Whop yet.")}
                    className={buttonClasses}
                  >
                    Get {plan.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {note && (
        <p className="mx-auto mt-6 max-w-xl rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {note}
        </p>
      )}
      <p className="mt-8 text-center text-xs text-ink/40">
        Secure checkout &amp; access powered by Whop. Trading futures involves substantial risk of loss.
      </p>
    </section>
  );
}
