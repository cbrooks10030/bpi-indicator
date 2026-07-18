import { socials } from "@/lib/config";
import { XLogo, YouTube, Instagram, Telegram, Discord } from "./Icons";

const links = [
  { href: socials.x, label: "X", Icon: XLogo },
  { href: socials.youtube, label: "YouTube", Icon: YouTube },
  { href: socials.instagram, label: "Instagram", Icon: Instagram },
  { href: socials.telegram, label: "Telegram", Icon: Telegram },
  { href: socials.discord, label: "Discord", Icon: Discord },
];

export function Socials({ variant = "row" }: { variant?: "row" | "footer" }) {
  const base =
    variant === "footer"
      ? "text-ink/50 hover:text-ink"
      : "flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-ink/70 transition hover:border-ink hover:text-ink card-shadow";
  return (
    <div className="flex items-center gap-3">
      {links.map(({ href, label, Icon }) => (
        <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer" className={base}>
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}
