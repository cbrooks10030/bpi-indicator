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
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-ink/60">
            <Link href="/#features" className="hover:text-ink">Indicator</Link>
            <Link href="/prop-firms" className="hover:text-ink">Prop Firms</Link>
            <Link href="/#pricing" className="hover:text-ink">Pricing</Link>
            <Link href="/education" className="hover:text-ink">Education</Link>
            <Link href="/#faq" className="hover:text-ink">FAQ</Link>
            <a href={`mailto:${site.supportEmail}`} className="hover:text-ink">Support</a>
          </nav>
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
