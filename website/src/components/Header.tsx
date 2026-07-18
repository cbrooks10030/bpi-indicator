import Link from "next/link";
import { site } from "@/lib/config";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-mono text-paper">B</span>
          <span>{site.name}</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 md:flex">
          <Link href="/#features" className="hover:text-ink">Indicator</Link>
          <Link href="/#pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/prop-firms" className="hover:text-ink">Prop Firms</Link>
          <Link href="/education" className="hover:text-ink">Education</Link>
          <Link href="/#faq" className="hover:text-ink">FAQ</Link>
        </nav>
        <Link
          href="/#pricing"
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition hover:bg-ink/85"
        >
          Get access
        </Link>
      </div>
    </header>
  );
}
