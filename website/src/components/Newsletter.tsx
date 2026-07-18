"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("ok");
      setMessage("You're in — check your inbox for what's next.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="rounded-3xl bg-ink px-8 py-14 text-center text-paper card-shadow">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Join the BPI newsletter</h2>
        <p className="mx-auto mt-3 max-w-xl text-paper/60">
          Free ICT breakdowns, setups and product updates. No spam — unsubscribe anytime.
        </p>
        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-paper placeholder-paper/40 outline-none focus:border-accent-soft"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-paper px-6 py-3 text-sm font-semibold text-ink transition hover:bg-paper/90 disabled:opacity-60"
          >
            {status === "loading" ? "…" : "Subscribe"}
          </button>
        </form>
        {message && (
          <p className={`mt-4 text-sm ${status === "ok" ? "text-accent-soft" : "text-red-300"}`}>{message}</p>
        )}
      </div>
    </section>
  );
}
