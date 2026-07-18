export const site = {
  name: "BPI Indicator",
  tagline: "Trade ICT with confidence.",
  description:
    "The BPI Indicator brings a complete ICT toolkit to TradingView — HTF fractal models, CISD, breaker blocks, unicorn FVGs and more — in one clean overlay.",
  // Public site URL, used for OG tags + Stripe redirect fallbacks.
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  discordInvite: process.env.NEXT_PUBLIC_DISCORD_INVITE || "#",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@bpi-indicator.com",
};

export type Plan = {
  id: "monthly" | "annual" | "lifetime";
  name: string;
  price: string;
  cadence: string;
  blurb: string;
  highlight?: boolean;
  badge?: string;
  // Stripe Price ID, provided via env. Falls back to empty (checkout disabled).
  priceEnvKey: string;
  mode: "subscription" | "payment";
};

export const plans: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$29",
    cadence: "/month",
    blurb: "Full access, billed monthly. Cancel anytime.",
    priceEnvKey: "STRIPE_PRICE_MONTHLY",
    mode: "subscription",
  },
  {
    id: "annual",
    name: "Annual",
    price: "$199",
    cadence: "/year",
    blurb: "Save 43% vs monthly. Best value for serious traders.",
    highlight: true,
    badge: "Most popular",
    priceEnvKey: "STRIPE_PRICE_ANNUAL",
    mode: "subscription",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "$399",
    cadence: "one-time",
    blurb: "Pay once, keep access forever. No recurring fees.",
    priceEnvKey: "STRIPE_PRICE_LIFETIME",
    mode: "payment",
  },
];

export const features = [
  {
    title: "HTF Fractal Models",
    body: "Auto higher-timeframe candles with C2/C3/C4 fractal flow, bias filtering and XC2/XC4 invalidation drawn right on your chart.",
    icon: "chart",
  },
  {
    title: "CISD neo",
    body: "Change-in-state-of-delivery tracking with Pending / Faded / Confirmed / Hybrid states so you never miss a shift.",
    icon: "pulse",
  },
  {
    title: "Breaker Blocks",
    body: "Automatic breaker block zones with unicorn FVG overlap detection to pinpoint high-probability reversals.",
    icon: "layers",
  },
  {
    title: "FVG & Volume Imbalance",
    body: "HTF fair value gaps, hidden FVGs, and volume imbalances mapped automatically across timeframes.",
    icon: "gap",
  },
  {
    title: "Liquidity & Sweeps",
    body: "Swing highs/lows, sweep markers, HH/HL/LH/LL structure labels and standard-deviation projections off each C2.",
    icon: "target",
  },
  {
    title: "Alerts Built In",
    body: "Custom-formatted alerts on your key models so you can step away and let BPI watch the tape for you.",
    icon: "bell",
  },
];

export const faqs = [
  {
    q: "What markets does BPI work on?",
    a: "BPI is built for ICT-style trading and works on any TradingView symbol — futures like NQ and ES, forex, crypto and equities. It shines on intraday futures.",
  },
  {
    q: "How do I get access after I subscribe?",
    a: "After checkout you'll connect your Discord and enter your TradingView username. We add the invite-only BPI script to your TradingView account and grant your Discord members role, usually within a few hours.",
  },
  {
    q: "Do I need anything besides TradingView?",
    a: "Just a TradingView account (a free plan works, though a paid plan unlocks more indicators per chart). BPI is a Pine Script indicator you add like any other.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Monthly and annual plans can be cancelled anytime from the billing portal and you keep access until the period ends. Lifetime is a one-time purchase with no recurring fees.",
  },
  {
    q: "Is this financial advice?",
    a: "No. BPI is a charting tool. It does not place trades or guarantee results. Trading futures involves substantial risk of loss.",
  },
];
