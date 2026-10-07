export const site = {
  name: "BPI Fractal Indicator",
  tagline: "The fractal model, automated.",
  description:
    "The fractal model for TradingView — Candle 2 setups, CISD / IC-CISD, projected higher-timeframe candles, key levels, SMT and FVGs — in one fast, automated overlay.",
  // Public site URL, used for OG tags + Stripe redirect fallbacks.
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@bpi-indicator.com",
};

export const socials = {
  x: process.env.NEXT_PUBLIC_SOCIAL_X || "#",
  youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "#",
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "#",
  telegram: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM || "#",
  discord: process.env.NEXT_PUBLIC_DISCORD_INVITE || "https://discord.gg/Tq4WZQxEQr",
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

// Whop is the checkout + membership platform. Each tier links to its Whop
// checkout URL (set these once you create the products in Whop). If a per-tier
// URL is missing we fall back to the store URL; if nothing is set the buttons
// show a friendly "not configured" note. Whop handles billing, Discord role
// gating and TradingView access automatically after purchase.
export const whop = {
  storeUrl: process.env.NEXT_PUBLIC_WHOP_URL || "https://whop.com/bpi-indicator",
  checkout: {
    monthly:
      process.env.NEXT_PUBLIC_WHOP_MONTHLY ||
      "https://whop.com/bpi-indicator/bpi-smart-money-indicator-monthly/",
    quarterly:
      process.env.NEXT_PUBLIC_WHOP_QUARTERLY ||
      "https://whop.com/bpi-indicator/bpi-smart-money-indicator-quarterly/",
    yearly:
      process.env.NEXT_PUBLIC_WHOP_YEARLY ||
      "https://whop.com/bpi-indicator/bpi-smart-money-indicator-yearly/",
  } as Record<Plan["id"], string>,
};

export function whopUrl(planId: Plan["id"]): string {
  return whop.checkout[planId] || whop.storeUrl || "";
}

export const planPerks = [
  "Invite-only TradingView indicator",
  "Candle 2, CISD, IC-CISD, FVG & OB alerts",
  "Automatic LTF → HTF pairing",
  "HTF 1/2/3, 4H & Daily candle blocks",
  "All future updates",
  "Private Discord community & support",
];

export const whyChoose = [
  {
    title: "Built for intraday futures",
    body: "Tuned for NQ, ES, YM, RTY and the micros, from the 1-minute to the daily. Runs on any TradingView symbol.",
  },
  {
    title: "Clear HTF → LTF framework",
    body: "Higher-timeframe context drawn directly on your execution chart.",
  },
  {
    title: "Confirmed-bar setups",
    body: "Candle 2 marks are evaluated once per HTF period and never repaint — what you backtest is what you trade.",
  },
  {
    title: "Fast by design",
    body: "Bounded drawings and three data requests per bar — no sluggish chart loads.",
  },
];

// Feature-by-feature walkthrough (TTrades style). `image` points to an asset in
// /public — drop a GIF/screenshot there to replace the placeholder.
export const walkthrough = [
  {
    title: "Indicator Overview",
    body: "The whole fractal model on one chart — setups, CISD, HTF candles, key levels and SMT working together.",
    image: "/features/overview.png",
  },
  {
    title: "Fractal Model Setups",
    body: "Candle 2 sweep-and-reclaim detection with C3/C4 expansion boxes, equilibrium and standard-deviation projections for the live setup.",
    image: "/features/fractal.png",
  },
  {
    title: "CISD, Early CISD & IC-CISD",
    body: "Change-in-state-of-delivery lines plus protected swing points that grey out once taken.",
    image: "/features/cisd.png",
  },
  {
    title: "Higher Timeframe Candles",
    body: "Up to three projected HTF blocks, 4H and Daily candles, with countdown, HTF open and O/C time lines.",
    image: "/features/htf-candles.png",
  },
  {
    title: "Key Levels & Sessions",
    body: "PDH/PDL, Midnight / 8:30 / 6PM opens, Asia and London highs and lows, and the Opening Range Gap with C.E. and quadrants.",
    image: "/features/key-levels.png",
  },
  {
    title: "FVG & Order Blocks",
    body: "Capped, mitigation-aware fair value gaps and order blocks that never slow the chart down.",
    image: "/features/fvg.png",
  },
  {
    title: "SMT Divergence & Alerts",
    body: "Auto-paired SMT for ES/NQ/YM/RTY, micros, BTC/ETH and GC/SI, with alerts for Candle 2, CISD, IC-CISD, FVG and OB.",
    image: "/features/smt.png",
  },
];

export const propFirms = [
  { name: "Add your partner", blurb: "Best-in-class funding for futures traders.", discount: "Exclusive discount", href: "#" },
  { name: "Add your partner", blurb: "Fast payouts and trader-friendly rules.", discount: "Exclusive discount", href: "#" },
  { name: "Add your partner", blurb: "Scale to six figures in funded capital.", discount: "Exclusive discount", href: "#" },
];

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
      "Plans are recurring subscriptions sold and billed through Whop (our checkout and membership platform) on a monthly, quarterly or yearly cycle. By subscribing you authorize charges to your payment method on each renewal until you cancel.",
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
      "The concepts implemented by BPI — the fractal model, CISD and related ICT concepts — are publicly-taught trading concepts that we do not own or claim to have invented. BPI is an independent tool and is not affiliated with, endorsed by, or connected to ICT, TTrades or any other educator. The BPI software, branding and content are our property.",
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
      "We collect the information you provide to deliver the service: your email address, your TradingView username, and your Discord identity (when you connect it). Payment details are collected and processed by Whop and its payment processors — we never see or store your full card number.",
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
      "We rely on trusted processors to run the service, including Whop (checkout, billing and membership access), Discord (community access), and TradingView (indicator delivery). Your data is shared with them only as needed to provide the service, and each has its own privacy policy.",
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
    q: "What does the indicator draw?",
    a: "The fractal model: Candle 2 sweep-and-reclaim setups with C3/C4 boxes, CISD / Early CISD / IC-CISD lines and protected swings, standard-deviation projections, projected higher-timeframe candles (HTF 1/2/3, 4H, Daily), key levels and sessions, the Opening Range Gap, FVG / order blocks and SMT divergence.",
  },
  {
    q: "Which markets and timeframes does it work on?",
    a: "It is built for intraday futures — NQ, ES, YM, RTY and the micros — on 1-minute to 1-hour charts, and the model also runs on 4H, Daily and Weekly. Key levels, sessions and the Opening Range Gap are intraday-only. SMT auto-pairing covers index futures, BTC/ETH and GC/SI; other symbols run with SMT off.",
  },
  {
    q: "Does it repaint?",
    a: "Candle 2 setups are evaluated once per higher-timeframe period from the completed previous candle and do not repaint. CISD confirmations use the live close and can update until the bar closes — the same way you would read them by hand.",
  },
  {
    q: "Do you own the fractal model?",
    a: "No. The fractal model, CISD and related ICT concepts are publicly taught. BPI is an independent tool that automates them on TradingView and is not affiliated with, endorsed by, or connected to ICT, TTrades or any other educator.",
  },
  {
    q: "How do I get access after I subscribe?",
    a: "Checkout is handled by Whop. After you subscribe you provide your TradingView username and we add the invite-only script to your account — usually within a few hours. Your Discord role is granted automatically. Everything is managed from your Whop account.",
  },
  {
    q: "How do alerts work?",
    a: "Create an alert on the indicator with the condition \"Any alert() function call\" for Candle 2 and IC-CISD events, or pick a named condition such as \"Bullish CISD Confirmed\". Alerts fire for bars after the alert is created.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Every plan can be cancelled anytime from your Whop account and you keep access until the end of the period you paid for.",
  },
  {
    q: "Is this financial advice?",
    a: "No. BPI is a charting tool — it does not place trades, give financial advice, or guarantee results. Trading futures involves substantial risk of loss and you are responsible for your own decisions.",
  },
];
