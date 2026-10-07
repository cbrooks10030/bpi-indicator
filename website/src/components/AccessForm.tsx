"use client";

import { useState } from "react";
import { Check, Discord } from "./Icons";

export function AccessForm({
  sessionId,
  discordConnected,
  tradingview,
}: {
  sessionId: string;
  discordConnected: boolean;
  tradingview: string | null;
}) {
  const [tv, setTv] = useState(tradingview ?? "");
  const [saved, setSaved] = useState(Boolean(tradingview));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveTv(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/tradingview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, username: tv.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 space-y-5">
      {/* Step 1: Discord */}
      <div className="rounded-2xl border border-line bg-paper p-6 card-shadow">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-subtle text-xs">1</span>
              Connect your Discord
            </h2>
            <p className="mt-1 text-sm text-ink/60">
              Join the members server and unlock the private channels.
            </p>
          </div>
          {discordConnected ? (
            <span className="flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-2 text-sm font-medium text-accent-ink">
              <Check className="h-4 w-4" /> Connected
            </span>
          ) : (
            <a
              href={`/api/discord/login?session_id=${encodeURIComponent(sessionId)}`}
              className="flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Discord className="h-4 w-4" /> Connect Discord
            </a>
          )}
        </div>
      </div>

      {/* Step 2: TradingView */}
      <div className="rounded-2xl border border-line bg-paper p-6 card-shadow">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-subtle text-xs">2</span>
          Enter your TradingView username
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          We add the invite-only BPI Indicator to this account.
        </p>
        <form onSubmit={saveTv} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={tv}
            onChange={(e) => setTv(e.target.value)}
            placeholder="your_tradingview_username"
            required
            className="flex-1 rounded-lg border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={saving || !tv.trim()}
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink/85 disabled:opacity-60"
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </button>
        </form>
        {saved && !saving && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-accent-ink">
            <Check className="h-4 w-4" /> Got it — access will be granted shortly.
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
