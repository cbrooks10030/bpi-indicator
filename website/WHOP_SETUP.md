# Whop setup guide — BPI Indicator

The site funnels all "Get {plan}" buttons to Whop. Whop handles checkout, billing,
Discord role gating and TradingView invite-only access. Follow these steps once and
paste the resulting links into your environment variables.

## 1. Create your Whop account & store
1. Go to https://whop.com and sign up (free — no monthly fee, no KYC to start).
2. Create a **Whop** (your store/company).
3. Add your branding: logo, name (BPI Indicator), description, and cover image.

## 2. Create the three products (tiers)
Create one product per plan with these recurring prices (matching the site):

| Plan | Price | Billing period |
|------|-------|----------------|
| Monthly | $45 | every 1 month |
| Quarterly | $120 | every 3 months |
| Yearly | $438 | every 12 months |

For each: **Products → Add product → Subscription**, set the price and period, and
enable "cancel anytime".

## 3. Attach access passes (this is the automation)
On each product, add the access the buyer should receive:
- **Discord**: connect your Discord server and select the members role Whop should
  assign on purchase (and remove on cancellation/refund). Whop installs its bot for you.
- **TradingView**: add a TradingView access pass. Whop collects the buyer's TradingView
  username at checkout and shows it to you so you can grant the invite-only script.
  (TradingView has no public API, so the actual grant is still a manual ~15-second step
  in TradingView's *Invite-only scripts* list — Whop just collects and tracks it.)

## 4. Grab the checkout links
For each product, open it and copy its **checkout URL** (looks like
`https://whop.com/checkout/plan_xxxxx` or your store URL `https://whop.com/your-store`).

## 5. Paste links into the site's env vars
Set these (locally in `.env.local`, and in Vercel → Project → Settings → Environment
Variables for production):

```
NEXT_PUBLIC_WHOP_URL=https://whop.com/your-store
NEXT_PUBLIC_WHOP_MONTHLY=https://whop.com/checkout/plan_monthly
NEXT_PUBLIC_WHOP_QUARTERLY=https://whop.com/checkout/plan_quarterly
NEXT_PUBLIC_WHOP_YEARLY=https://whop.com/checkout/plan_yearly
```

Redeploy. The pricing buttons now open Whop checkout in a new tab.

## 6. (Recommended) Turn on the affiliate program
In Whop, enable **Affiliates** and set a commission % (e.g. 20–30%). This lets other
people — including members of the trading Discords you're in — promote your indicator
for a cut, and Whop tracks referrals and pays them automatically. This is your main
distribution lever since you don't own the communities.

## 7. Fees to expect
- Payment processing: **2.7% + $0.30** per charge (domestic card).
- Platform fee on gated products: **~3%**.
- **All-in ≈ 5.7% + $0.30 per transaction** (applies on every renewal).
- Optional: international cards +1.5%, FX +1%, and payout fees for instant/crypto/wire.

Approx. take-home per plan: Monthly ~$42.13 · Quarterly ~$112.86 · Yearly ~$412.73.

## Notes
- The self-hosted Stripe + Discord backend under `src/app/api/**` is left in the repo
  as an alternative but is **not used** while you're on Whop (nothing on the site links
  to it). You can ignore those env vars.
- Keep the marketing site as your front-end: content, education, social proof, SEO — all
  driving traffic to the Whop checkout.
