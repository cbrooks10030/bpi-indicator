import Link from "next/link";
import { Chart, Layers, Bell, Pulse, Arrow } from "./Icons";

const cards = [
  {
    title: "Indicator",
    body: "An automatic tool to spot high-probability setups.",
    href: "/#features",
    Icon: Chart,
  },
  {
    title: "Prop Firms",
    body: "Discover our trusted prop firm partners and discounts.",
    href: "/prop-firms",
    Icon: Layers,
  },
  {
    title: "Education",
    body: "Trading concepts, strategies, techniques and insights.",
    href: "/education",
    Icon: Pulse,
  },
  {
    title: "Newsletter",
    body: "Free breakdowns and setups straight to your inbox.",
    href: "#newsletter",
    Icon: Bell,
  },
];

export function Hub() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ title, body, href, Icon }) => (
          <Link
            key={title}
            href={href}
            className="group rounded-2xl border border-line bg-paper p-6 card-shadow transition hover:-translate-y-1"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-subtle text-accent-ink">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 flex items-center gap-1 font-semibold">
              {title}
              <Arrow className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
            </h3>
            <p className="mt-2 text-sm text-ink/60">{body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
