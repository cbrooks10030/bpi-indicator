import Link from "next/link";
import { site } from "@/lib/config";
import { Socials } from "./Socials";

export function Footer() {
  return (
    <footer className="border-t border-line bg-subtle">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-mono text-paper">B</span>
              <span>{site.name}</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-ink/55">
              A complete ICT toolkit for TradingView, in one clean overlay.
            </p>
            <div className="mt-5">
              <Socials variant="footer" />
            </div>
          </div>
          <div className="flex gap-16">
            <nav className="grid gap-2 text-sm text-ink/60">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink/40">Explore</span>
              <Link href="/#features" className="hover:text-ink">Indicator</Link>
              <Link href="/mentorship" className="hover:text-ink">Mentorship</Link>
              <Link href="/prop-firms" className="hover:text-ink">Prop Firms</Link>
              <Link href="/education" className="hover:text-ink">Education</Link>
              <Link href="/#pricing" className="hover:text-ink">Pricing</Link>
              <Link href="/#faq" className="hover:text-ink">FAQ</Link>
            </nav>
            <nav className="grid gap-2 text-sm text-ink/60">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink/40">Legal</span>
              <Link href="/terms" className="hover:text-ink">Terms</Link>
              <Link href="/privacy" className="hover:text-ink">Privacy</Link>
              <Link href="/refunds" className="hover:text-ink">Refunds</Link>
              <a href={`mailto:${site.supportEmail}`} className="hover:text-ink">Support</a>
            </nav>
          </div>
        </div>

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-ink/45">
          For educational and informational purposes only. Not financial advice. BPI implements
          publicly-taught ICT concepts and is an independent tool — not affiliated with or endorsed by
          ICT or any educator. Trading futures carries a substantial risk of loss. © {new Date().getFullYear()} {site.name}.
        </p>
      </div>
    </footer>
  );
}
