"use client";

import { useState } from "react";
import { plans, planPerks } from "@/lib/config";
import { Check } from "./Icons";

export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(planId: string) {
    setError(null);
    setLoading(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout is not configured yet.");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(null);
    }
  }

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose your plan</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink/60">
          One indicator, every model included. Cancel anytime. The longer you commit, the more you save.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
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

            <button
              onClick={() => checkout(plan.id)}
              disabled={loading !== null}
              className={`mt-8 w-full rounded-full px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                plan.highlight
                  ? "bg-paper text-ink hover:bg-paper/90"
                  : "bg-ink text-paper hover:bg-ink/85"
              }`}
            >
              {loading === plan.id ? "Redirecting…" : `Get ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="mx-auto mt-6 max-w-xl rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}
      <p className="mt-8 text-center text-xs text-ink/40">
        Payments are securely processed by Stripe. Trading futures involves substantial risk of loss.
      </p>
    </section>
  );
}
