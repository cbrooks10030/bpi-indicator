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

// Education articles. Each has a slug for /education/[slug] and body paragraphs.
// Content covers publicly-taught ICT concepts — educational, not financial advice.
export type Article = {
  slug: string;
  title: string;
  tag: string;
  blurb: string;
  readingTime: string;
  body: string[];
};

export const articles: Article[] = [
  {
    slug: "what-is-the-unicorn-model",
    title: "What is the Unicorn model?",
    tag: "Model",
    blurb: "Breaker block + FVG overlap and how BPI flags it.",
    readingTime: "4 min read",
    body: [
      "The Unicorn model is a high-confluence setup that forms when a breaker block overlaps a fair value gap (FVG). On its own, either element can mark a reaction zone — but where the two overlap, price is often delivered with more precision, which is why traders treat the overlap as a premium entry area.",
      "A breaker block is a failed order block: price attempts to hold a level, sweeps liquidity beyond it, and then reverses, leaving the origin candle as a zone price tends to respect on the retrace. An FVG is a three-candle imbalance where price moved so quickly it left an inefficiency. When a breaker and an FVG share the same price range, you get the Unicorn.",
      "BPI detects both structures automatically and highlights where they overlap, so you don't have to hand-draw them on every chart. The idea is to wait for price to return into that overlapping zone, look for a lower-timeframe shift in your favor, and manage risk against the far edge of the zone.",
      "As with every model here, the Unicorn is a framework for reading order flow — not a signal to blindly buy or sell. Most traders combine it with directional bias and a session filter before acting.",
    ],
  },
  {
    slug: "trading-the-atm-model",
    title: "Trading the ATM model",
    tag: "Session",
    blurb: "The NY AM session model, step by step.",
    readingTime: "5 min read",
    body: [
      "The ATM (AM) model is a time-restricted approach focused on the New York morning session, when index futures like NQ and ES tend to see their cleanest expansions. The premise is simple: define a window, wait for the session to take liquidity, and trade the reaction back into the day's likely range.",
      "A typical sequence is: an early-session sweep of a prior high or low, a shift in delivery back the other way, and a move into a fair value gap or breaker left behind. Restricting entries to the session window filters out much of the noise you get outside of it.",
      "BPI marks the session window and the structures that form inside it, so you can focus on execution rather than clock-watching. You still supply the bias and the risk plan — the tool organizes the context.",
      "The ATM model pairs naturally with the Fractal model and Auto Bias: use bias to pick a direction, the session window to time it, and structure to define your risk.",
    ],
  },
  {
    slug: "fractal-flow-c2-c3-c4",
    title: "Fractal flow: C2 / C3 / C4",
    tag: "Framework",
    blurb: "How the fractal model maps manipulation and expansion.",
    readingTime: "6 min read",
    body: [
      "The fractal model breaks a move into tiered phases — labelled C2, C3 and C4 — that repeat across timeframes. Each tier represents a step in how a move builds: an initial manipulation, a confirmation, and an expansion, with invalidation levels that tell you when the sequence has failed.",
      "C2 typically marks the manipulation leg, where liquidity is engineered. C3 is the confirmation that delivery has changed. C4 is the expansion you're trying to capture. XC2 and XC4 are the invalidation points — if price trades through them, the read is wrong and you stand aside.",
      "Because the model is fractal, the same structure you see on a 15-minute chart can appear on a 1-minute chart inside it. That nesting is what lets traders align higher-timeframe context with lower-timeframe entries.",
      "BPI plots the C2/C3/C4 flow and its invalidations automatically, with bias filtering so you only see setups aligned with the trend you've defined.",
    ],
  },
  {
    slug: "reading-cisd-trend-shift",
    title: "Reading CISD (trend shift)",
    tag: "Concept",
    blurb: "Change in state of delivery and confirmation states.",
    readingTime: "4 min read",
    body: [
      "CISD — change in state of delivery — is the moment order flow flips from one direction to the other. Instead of waiting for a full market-structure break, CISD looks for the earliest evidence that the prior delivery has stopped and a new one has begun.",
      "BPI tracks CISD with a set of states — Pending, Faded, Confirmed and Hybrid — so you can see how mature a shift is. A Pending shift is early and unconfirmed; a Confirmed shift has follow-through; Faded means the attempt failed; Hybrid captures the in-between.",
      "Reading these states helps you avoid two common mistakes: acting on a shift that never confirms, and missing one because you waited for a textbook structure break that came too late.",
      "CISD is most useful as a trigger inside a larger plan — combine it with bias and a defined zone (breaker, FVG or Unicorn) rather than trading every flip.",
    ],
  },
  {
    slug: "combining-models-for-confluence",
    title: "Combining models for confluence",
    tag: "Playbook",
    blurb: "Why traders stack several models instead of one.",
    readingTime: "5 min read",
    body: [
      "No single model wins every time. Experienced traders build confluence by stacking a few together: a directional bias, a location to act, and a trigger to time it. When several independent reads agree, the setup is stronger; when they disagree, you stand aside.",
      "A common stack looks like this — Auto Bias for direction, a session window (the ATM model) for timing, a zone (Unicorn, breaker or FVG) for location, and CISD for the trigger. Each piece answers a different question, and BPI shows them all on one chart.",
      "The goal isn't to add every indicator you can — it's to require a small, consistent set of conditions before you risk money. That consistency is what makes a strategy testable and repeatable.",
      "Pick two or three models that make sense to you, define exactly what has to line up, and journal the results. Confluence is a discipline, not a guarantee.",
    ],
  },
  {
    slug: "fvgs-and-liquidity-basics",
    title: "FVGs & liquidity basics",
    tag: "Concept",
    blurb: "Fair value gaps, imbalances and sweeps explained.",
    readingTime: "4 min read",
    body: [
      "A fair value gap (FVG) is a three-candle imbalance: price moves so quickly in one direction that the middle candle leaves a gap between the wicks of the candles on either side. That gap represents inefficient delivery, and price often returns to rebalance it before continuing.",
      "Liquidity refers to the resting orders that sit above old highs and below old lows — stops and pending orders. Price is frequently drawn to these pools, sweeps them, and then reverses, which is why a sweep followed by a shift is such a common setup.",
      "BPI maps standard FVGs, hidden FVGs and volume imbalances across timeframes, and highlights liquidity sweeps, so you can see where price is likely to be drawn and where it's likely to react.",
      "Understanding these two ideas — imbalance and liquidity — is the foundation for every other model on this site. Master them first, then layer the models on top.",
    ],
  },
];

export const mentorship = {
  tagline: "Mentorship",
  heading: "Learn to trade BPI with guidance",
  intro:
    "One-to-one and group mentorship built around the BPI toolkit — how to read the models, build a plan, and stay disciplined. Mentorship is opening soon; join the waitlist to be first in line.",
  includes: [
    { title: "Live sessions", body: "Walk through real charts and setups together in the NY session." },
    { title: "Your trading plan", body: "Build a repeatable plan around the models that fit your style." },
    { title: "Reviews & accountability", body: "Trade reviews and feedback to tighten your execution." },
    { title: "Private mentorship channel", body: "Direct access for questions between sessions." },
  ],
};

// Effective date shown on legal pages. Update when policies change.
export const legalUpdated = "July 2026";

export const termsSections = [
  {
    heading: "1. Acceptance of terms",
    body: [
      `By accessing ${site.name} or subscribing to the BPI Indicator, you agree to these Terms of Service. If you do not agree, do not use the service.`,
    ],
  },
  {
    heading: "2. What we provide",
    body: [
      "BPI is a technical-analysis indicator for TradingView. It is a charting tool that visualizes publicly-taught trading concepts. It does not execute trades, provide personalized financial advice, or guarantee any result.",
      "Access is granted as an invite-only TradingView script plus a role in our Discord community. TradingView access is added manually to the username you provide, usually within a few hours of subscribing.",
    ],
  },
  {
    heading: "3. Subscriptions and billing",
    body: [
      "Plans are recurring subscriptions billed through Stripe on a monthly, quarterly or yearly cycle. By subscribing you authorize us to charge your payment method on each renewal until you cancel.",
      "You can cancel at any time; access continues until the end of the period you have already paid for. Prices may change with notice; changes do not affect the period you have already paid for.",
    ],
  },
  {
    heading: "4. Acceptable use",
    body: [
      "You may not share, resell, redistribute or reverse-engineer the indicator or its source, and you may not share your TradingView or Discord access with others. Access is for a single user.",
      "We may suspend or terminate access for violations, chargeback abuse, or attempts to disrupt the service or its community.",
    ],
  },
  {
    heading: "5. No investment advice",
    body: [
      "Nothing on this site or in the tool is financial, investment, or trading advice. Trading futures and other leveraged products involves a substantial risk of loss and is not suitable for everyone. You are solely responsible for your own trading decisions.",
    ],
  },
  {
    heading: "6. Intellectual property",
    body: [
      "The ICT concepts implemented by BPI — including the Unicorn, ATM and Fractal models — are publicly-taught trading concepts that we do not own or claim to have invented. BPI is an independent tool and is not affiliated with, endorsed by, or connected to ICT or any other educator. The BPI software, branding and content are our property.",
    ],
  },
  {
    heading: "7. Limitation of liability",
    body: [
      `To the maximum extent permitted by law, ${site.name} is not liable for any trading losses or for any indirect, incidental, or consequential damages arising from your use of the tool. The service is provided "as is" without warranties of any kind.`,
    ],
  },
  {
    heading: "8. Contact",
    body: [`Questions about these terms can be sent to ${site.supportEmail}.`],
  },
];

export const privacySections = [
  {
    heading: "1. Information we collect",
    body: [
      "We collect the information you provide to deliver the service: your email address, your TradingView username, and your Discord identity (when you connect it). Payment details are collected and processed by Stripe — we never see or store your full card number.",
      "We may also collect basic technical data such as IP address and request metadata for security and rate-limiting.",
    ],
  },
  {
    heading: "2. How we use it",
    body: [
      "We use your information to grant and manage indicator access, assign your Discord role, process billing, provide support, and send product and newsletter updates you have opted into. We do not sell your personal information.",
    ],
  },
  {
    heading: "3. Third-party processors",
    body: [
      "We rely on trusted processors to run the service, including Stripe (payments), Discord (community access and OAuth), and TradingView (indicator delivery). Your data is shared with them only as needed to provide the service, and each has its own privacy policy.",
    ],
  },
  {
    heading: "4. Cookies",
    body: [
      "We use a small number of strictly-necessary cookies to keep you signed in during checkout and activation and to protect against cross-site request forgery. We do not use them for advertising.",
    ],
  },
  {
    heading: "5. Data retention and your rights",
    body: [
      "We keep your information for as long as your account is active and as needed to comply with legal obligations. You can request access to, correction of, or deletion of your personal data by emailing us.",
    ],
  },
  {
    heading: "6. Contact",
    body: [`For any privacy request, contact ${site.supportEmail}.`],
  },
];

export const refundSections = [
  {
    heading: "Risk disclaimer",
    body: [
      "BPI is an educational and informational charting tool. It is not financial advice and does not guarantee profits. Trading futures, forex, crypto and equities involves a substantial risk of loss, and past performance does not indicate future results. Only trade with capital you can afford to lose.",
    ],
  },
  {
    heading: "Refund policy",
    body: [
      "Because access to an invite-only indicator is granted digitally and cannot be returned, subscription payments are generally non-refundable once access has been provisioned.",
      "If you were charged in error, experienced a technical problem that prevented access, or were billed after cancelling, contact us and we will make it right — including a refund where appropriate.",
      "You can cancel any plan at any time to stop future renewals; you keep access until the end of the current billing period.",
    ],
  },
  {
    heading: "How to cancel or request help",
    body: [
      `Email ${site.supportEmail} with your account email and we will help you cancel, resolve a billing issue, or review a refund request.`,
    ],
  },
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
