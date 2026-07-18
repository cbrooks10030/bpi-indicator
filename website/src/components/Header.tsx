import Link from "next/link";
import { site } from "@/lib/config";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 font-mono text-accent">B</span>
          <span>{site.name}</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
        <a
          href="#pricing"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent-soft"
        >
          Get access
        </a>
      </div>
    </header>
  );
}
