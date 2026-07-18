import { site } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-white/50 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 font-mono text-accent">B</span>
          <span>{site.name}</span>
        </div>
        <p className="max-w-md text-center text-xs sm:text-right">
          For educational and informational purposes only. Not financial advice.
          Trading futures carries a substantial risk of loss. © {new Date().getFullYear()} {site.name}.
        </p>
      </div>
    </footer>
  );
}
