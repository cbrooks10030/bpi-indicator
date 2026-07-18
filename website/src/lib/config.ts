export const site = {
  name: "BPI Indicator",
  tagline: "Master the market with BPI.",
  description:
    "A complete ICT toolkit for TradingView — HTF fractal models, Unicorn, ATM, CISD, breaker blocks and FVGs — in one clean, automated overlay.",
  // Public site URL, used for OG tags + Stripe redirect fallbacks.
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@bpi-indicator.com",
};

export const socials = {
  x: process.env.NEXT_PUBLIC_SOCIAL_X || "#",
  youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "#",
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "#",
  telegram: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM || "#",
  discord: process.env.NEXT_PUBLIC_DISCORD_INVITE || "#",
};

export type Plan = {
  id: "monthly" | "quarterly" | "yearly";
  name: string;
  monthly: string; // monthly-equivalent price shown large
  billed: string; // e.g. "Billed monthly" / "Billed quarterly ($120)"
  save?: string;
  highlight?: boolean;
  priceEnvKey: string;
};

// Pricing mirrors the TTrades monthly-equivalent structure. All are recurring
// subscriptions; quarterly/yearly are billed up-front for the period.
export const plans: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    monthly: "$45",
    billed: "Billed monthly",
    priceEnvKey: "STRIPE_PRICE_MONTHLY",
  },
  {
    id: "quarterly",
    name: "Quarterly",
    monthly: "$40",
    billed: "Billed quarterly ($120)",
    save: "Save 12%",
    priceEnvKey: "STRIPE_PRICE_QUARTERLY",
  },
  {
    id: "yearly",
    name: "Yearly",
    monthly: "$36.50",
    billed: "Billed yearly ($438)",
    save: "Save 19%",
    highlight: true,
    priceEnvKey: "STRIPE_PRICE_YEARLY",
  },
];

export const planPerks = [
  "Access to TradingView indicator",
  "Customizable TradingView alerts",
  "Automated charting",
  "Automatic timeframe adjustment",
  "Private Discord community",
  "Tailored customer support",
];

export const whyChoose = [
  {
    title: "Adaptive to all assets & timeframes",
    body: "Works on futures, forex, crypto and equities, from the 1-minute to the monthly.",
  },
  {
    title: "Clear HTF → LTF framework",
    body: "Higher-timeframe context drawn directly on your execution chart.",
  },
  {
    title: "No repainting",
    body: "Levels are fixed once printed — what you backtest is what you trade.",
  },
  {
    title: "Streamlined for execution",
    body: "Only the signals that matter, so you act with confidence, not clutter.",
  },
];

// Feature-by-feature walkthrough (TTrades style). `image` points to an asset in
// /public — drop a GIF/screenshot there to replace the placeholder.
export const walkthrough = [
  {
    title: "Indicator Overview",
    body: "Every model on one chart — the full BPI toolkit working together.",
    image: "/features/overview.png",
  },
  {
    title: "Higher Timeframe Candles",
    body: "View HTF candles, FVGs and swings right on your entry timeframe.",
    image: "/features/htf-candles.png",
  },
  {
    title: "Unicorn Model",
    body: "Breaker block overlapping an FVG — high-confluence reversal spots, auto-detected.",
    image: "/features/unicorn.png",
  },
  {
    title: "ATM Model",
    body: "Time-restricted NY AM session model for precise intraday entries.",
    image: "/features/atm.png",
  },
  {
    title: "Fractal Model",
    body: "C2 / C3 / C4 fractal flow with bias filtering and XC2/XC4 invalidation.",
    image: "/features/fractal.png",
  },
  {
    title: "Trend Shift (CISD)",
    body: "Change-in-state-of-delivery with Pending / Faded / Confirmed / Hybrid states.",
    image: "/features/cisd.png",
  },
  {
    title: "Breaker Blocks",
    body: "Failed order blocks that swept liquidity, plotted with their zones automatically.",
    image: "/features/breakers.png",
  },
  {
    title: "Fair Value Gaps",
    body: "HTF FVGs, hidden FVGs and volume imbalances mapped across timeframes.",
    image: "/features/fvg.png",
  },
  {
    title: "Auto Bias",
    body: "Directional bias that only prints setups aligned with the higher-timeframe trend.",
    image: "/features/bias.png",
  },
];

export const propFirms = [
  { name: "Add your partner", blurb: "Best-in-class funding for futures traders.", discount: "Exclusive discount", href: "#" },
  { name: "Add your partner", blurb: "Fast payouts and trader-friendly rules.", discount: "Exclusive discount", href: "#" },
  { name: "Add your partner", blurb: "Scale to six figures in funded capital.", discount: "Exclusive discount", href: "#" },
];

export const faqs = [
  {
    q: "Which ICT models does BPI support?",
    a: "BPI implements a wide range of ICT concepts in one overlay — the Unicorn model, the ATM model, the Fractal model, CISD, breaker blocks, FVGs and many more. Most traders don't rely on a single model; they combine a few together to build confluence for their setups, and BPI is designed to make that easy.",
  },
  {
    q: "Do you own these models or concepts?",
    a: "No. The Unicorn, ATM, Fractal and other ICT models are publicly taught trading concepts — we do not claim to own or have invented any of them. BPI is an independent tool that implements these well-known concepts on TradingView so traders can apply them faster and more consistently. It is not affiliated with, endorsed by, or officially connected to ICT or any other educator.",
  },
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
    a: "Yes. Every plan can be cancelled anytime from the billing portal and you keep access until the end of the period you paid for.",
  },
  {
    q: "Is this financial advice?",
    a: "No. BPI is a charting tool — it does not place trades, give financial advice, or guarantee results. You are responsible for your own trading decisions, and trading futures involves substantial risk of loss.",
  },
];
