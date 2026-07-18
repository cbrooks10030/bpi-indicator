"use client";

import { useState } from "react";
import { plans } from "@/lib/config";
import { Check } from "./Icons";

const perks = [
  "Invite-only BPI Indicator on TradingView",
  "Private Discord members channel",
  "All future updates included",
  "Setup guide + alert templates",
];

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
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, trader-friendly pricing</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/60">
          One indicator, every model included. Cancel anytime — lifetime option available.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border p-7 ${
              plan.highlight
                ? "border-accent/60 bg-panel2 glow"
                : "border-white/10 bg-panel"
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-black">
                {plan.badge}
              </span>
            )}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-white/50">{plan.cadence}</span>
            </div>
            <p className="mt-3 text-sm text-white/60">{plan.blurb}</p>

            <ul className="mt-6 space-y-3 text-sm">
              {perks.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-white/75">{p}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => checkout(plan.id)}
              disabled={loading !== null}
              className={`mt-8 w-full rounded-lg px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                plan.highlight
                  ? "bg-accent text-black hover:bg-accent-soft"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {loading === plan.id ? "Redirecting…" : `Get ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="mx-auto mt-6 max-w-xl rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </p>
      )}
      <p className="mt-8 text-center text-xs text-white/40">
        Payments are securely processed by Stripe. Trading futures involves substantial risk of loss.
      </p>
    </section>
  );
}
