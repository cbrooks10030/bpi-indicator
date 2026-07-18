# BPI Indicator — Sales Site & Membership

Marketing site + subscription checkout + Discord auto-gating for the BPI
Indicator. Built with Next.js (App Router), TypeScript, Tailwind and Stripe.

## What it does

- **Landing page** — hero, feature showcase, pricing and FAQ.
- **Stripe Checkout** — monthly, annual and lifetime plans.
- **Post-purchase flow** (`/success`) — the buyer connects Discord (OAuth) and
  enters their TradingView username.
- **Discord bot** — automatically adds the buyer to your server and assigns the
  members role. When a subscription is cancelled, the role is removed via a
  Stripe webhook.
- **Admin endpoint** (`/api/admin/members`) — lists paying members and who still
  needs TradingView access granted.

> **Note:** TradingView has no public API to grant invite-only script access, so
> that one step is manual: use the admin endpoint to see each member's
> TradingView username, then add them from TradingView's "invite-only" list.

## Local development

```bash
cd website
cp .env.example .env.local   # fill in what you have; the site runs without keys
npm install
npm run dev                  # http://localhost:3000
```

The site renders fully without any keys — checkout buttons just show a friendly
"not configured yet" message until Stripe keys are added.

## Setup checklist

### 1. Stripe
1. Create three Products/Prices in the Stripe Dashboard (monthly, annual,
   lifetime) and copy their `price_...` ids into `STRIPE_PRICE_*`.
2. Copy a **Restricted** secret key into `STRIPE_SECRET_KEY`.
3. Create a webhook endpoint at `https://YOUR_DOMAIN/api/stripe/webhook`,
   subscribe to `customer.subscription.deleted` **and** `checkout.session.completed`
   (the latter tags lifetime buyers so they show up in the admin list), and copy
   the signing secret into `STRIPE_WEBHOOK_SECRET`.

### 2. Discord
1. Create an application at the Discord Developer Portal.
2. Add a **Bot**, copy its token into `DISCORD_BOT_TOKEN`, and invite it to your
   server with the **Manage Roles** permission. Make sure the bot's role is
   **above** the members role in the role list.
3. Under OAuth2, add redirect `https://YOUR_DOMAIN/api/discord/callback` and copy
   the Client ID/Secret.
4. Enable Developer Mode in Discord, then right-click your server and the members
   role to copy `DISCORD_GUILD_ID` and `DISCORD_MEMBER_ROLE_ID`.

### 3. Admin
Set `ADMIN_TOKEN` to a long random string. Fetch members with:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://YOUR_DOMAIN/api/admin/members
```

## Deploy (Vercel)

1. Push this repo and import the `website` folder as the project root in Vercel.
2. Add every variable from `.env.example` in Vercel's Environment Variables.
3. Deploy, then point the Stripe webhook and Discord redirect URLs at the live
   domain.

## Security

Hardening applied (see `src/lib/security.ts`):

- **Security headers** on every response (`next.config.mjs`): strict CSP,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, HSTS,
  `Referrer-Policy`, `Permissions-Policy`, and `poweredByHeader` disabled.
- **Stripe webhook** verifies the signature against `STRIPE_WEBHOOK_SECRET`; the
  raw body is used so verification can't be bypassed.
- **Admin endpoint** uses a constant-time token comparison and is rate-limited.
- **OAuth CSRF**: the Discord flow binds an httpOnly nonce cookie to the `state`
  parameter and rejects mismatches (prevents login-CSRF / account fixation).
- **Activation ownership**: the first browser to link a purchase gets an httpOnly
  activation cookie; a leaked Stripe `session_id` cannot overwrite an already
  linked buyer's Discord/TradingView from a different browser.
- **Input validation** + **rate limiting** on all API routes; `session_id` and
  TradingView usernames are format-checked.
- **No secrets in the client** — all keys are server-only env vars; access is
  granted only after server-side verification that the Stripe session is paid.

> The rate limiter is in-memory (per serverless instance) — a first line of
> defence. For production, also enable your platform's WAF / edge rate limiting
> (e.g. Vercel) and use a **Restricted** Stripe key. No system is unhackable;
> this follows current best practice to make the site a hard target.

## Customising

- Copy, pricing and features live in `src/lib/config.ts`.
- Swap the mock chart in `src/components/ChartMock.tsx` for a real screenshot
  (drop an image in `public/` and render it).
