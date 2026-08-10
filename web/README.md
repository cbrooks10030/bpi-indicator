# Trading Entry Decision Game

An interactive, mobile-friendly checklist that turns the ICT + TT Trades Fractal Model + Charmaine Trades ATM framework
into a weighted scoring game. Work top-down from the daily, watch the live percentage, and get a hard EXECUTE / WATCH /
WAIT verdict with auto-generated reasoning.

- React + Vite + Tailwind, Framer Motion animations, confetti when crossing 50% and 80%
- 100% client-side: no backend, no accounts, no tracking. Everything lives in `localStorage` on your device
- Installable and offline-capable (service worker + web manifest)
- Free hosting on GitHub Pages via GitHub Actions
- Symbol tabs for **MNQ, NQ, MES, ES**

## How the checklist flows

**1. Daily prep — a gate, not a score.** Unskippable and worth 0%. The checklist stays locked until all of it is marked
on your chart, because every later question refers back to these levels:

- external and internal liquidity identified
- previous day high and low marked
- next FVGs mapped (swing → FVG or FVG → swing)
- volume imbalances marked
- coming from an **external swing** or an **internal FVG** (the thesis for the next high/low it delivers to)
- daily bias **bullish or bearish** — everything downstream is judged against it

**2. 4H power of three (25%).** C2 formed or forming (8, required), C2 in the direction of the daily bias (9, required),
and C2 swept (8, required) — the sweep is needed whether the candle is still building or already closed.

**3. CISD and closure scan (20%).** Is the last change in state of delivery in our direction (12, required — **answering
NO hard stops the checklist at 25%**, there is nothing to trade until delivery turns), then which of **1H / 30M / 15M**
have a candle closure (8, required, multi-select — several can be true at once).

**4. Entry function (35%).** The highest closure you ticked picks the confirmation timeframe automatically: 1H or 30M
closure → C3 continuation confirmed on the **5M**, 15M closure → **3M**. Questions: CISD on that timeframe (10,
required), MSS (4), FVG near the latest CISD (4), which PD arrays are present after the CISD (4, multi-select), OTE
sitting at those arrays (8, required), R:R ≥ 2R (5, required). Breaker block marked is a +3% bonus; a wick-only CISD is
a −20% penalty.

**5. Time and liquidity (20%).** 7AM hour high/low (4), 8AM hour high/low (4), Asia high/low (3), London high/low (3)
taken out, and premium/equilibrium/discount (6 — only scores when the tier agrees with your bias). Entering before 9:30
AM is a −20% penalty.

**6. Correlation — confluence only, never a gate.** NQ and ES showing the same 3M/5M CISD is +5%; the dollar printing
the *inverse* CISD at the same moment is +6% (the full triple-confirmation stack); the dollar moving *with* NQ/ES docks
−10% but never blocks the trade. 4H C2 at a daily POI is +5%; explicitly fighting the daily bias is −20%.

### Score maths

Base weights total **100%**. Bonuses are capped at **+15%**, penalties at **−50%**, then:

```
score = clamp(base + bonus − penalty, 0, 100)
if any mandatory question failed   → score = min(score, 50)
if the last CISD is against us     → score = min(score, 25)
```

Bands: red 0–49 (WAIT), yellow 50–79 (WATCH CLOSELY), green 80–100 (EXECUTE).

The engine is a standalone module — `src/lib/scoring.js`, with the question model in `src/lib/model.js` — that takes the
answers object and returns the final score, applied bonuses, applied penalties, generated reason bullets, and the
suggested entry zone. Unit tests: `src/lib/scoring.test.js`.

## Journal and dashboard

Finished checklists save with timestamp, symbol, every answer, score, decision, and notes. The dashboard shows the last
10, total completed, average score, win rate and net P&L, lets you fill in **WIN / LOSS / BREAK** and P&L after the
trade closes, exports everything to CSV, and can clear all data behind a confirmation. Nothing leaves the device.

## Local development

```bash
cd web
npm install
npm run dev      # http://localhost:5173/bpi-indicator/
npm run lint
npm test
npm run build    # production bundle in web/dist
npm run preview  # serve the production build locally
```

Node 20.19+ or 22.12+ (Vite 7 warns on older 20.x patches).

## Deploy to GitHub Pages (free, one click after the first push)

The app lives in `web/` inside this repo and `.github/workflows/deploy.yml` builds and publishes it on every push to
`main` that touches `web/`.

1. Merge this branch to `main`.
2. Repo → **Settings** → **Pages** → under **Build and deployment → Source** choose **GitHub Actions**.
3. Repo → **Actions** → **Deploy to GitHub Pages** → wait for the green check (~1 minute). Re-run it from there if you
   set the Pages source after the first push.
4. Open it on your phone: **https://cbrooks10030.github.io/bpi-indicator/**

`vite.config.js` sets `base: '/bpi-indicator/'` to match that sub-path. If the repo is ever renamed, update that string
or the page loads blank with 404s on the JS/CSS.

### Alternative hosts

```bash
cd web
BASE_PATH=/ npm run build     # Vercel / Netlify / custom domain serve from the root
npx vercel --prod             # or: npx netlify deploy --prod --dir=dist
```

Set `BASE_PATH=/` in the host's environment variables if it runs the build for you.

## Environment variables

None required — no backend, no API keys. `BASE_PATH` is the only optional (build-time) variable.

## Custom domain (optional, e.g. ttrades-game.com)

1. Buy the domain (Cloudflare, Namecheap, Porkbun...).
2. Repo → **Settings → Pages → Custom domain** → enter it → **Save** (this commits a `CNAME` file).
3. DNS: four apex `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, plus a
   `www` `CNAME` to `cbrooks10030.github.io`.
4. Wait for propagation, then tick **Enforce HTTPS**.
5. Build with `BASE_PATH=/` since the site now sits at the domain root.

## Pre-deployment checklist

- [ ] `npm run lint`, `npm test`, `npm run build` all pass
- [ ] Daily prep stays locked until every item plus origin and bias are set
- [ ] Live score updates on every tap; progress bar animates; confetti fires at 50% and 80%
- [ ] Multi-selects (closures, PD arrays) let you tick several without jumping to the next card
- [ ] Ticking a 1H closure shows "entry 5M" in the header and rewrites the entry questions to the 5M
- [ ] Answering NO to the last-CISD question caps the score at 25% and shows the hard-stop banner
- [ ] Any other mandatory NO caps at exactly 50%
- [ ] Final modal shows the right colour/emoji/verdict, reasons, and suggested entry zone
- [ ] Save → appears in Dashboard → reload the page and it's still there
- [ ] Outcome + P&L edit updates stats and win rate; CSV export downloads; clear-all asks first

## Post-deployment tests

- [ ] Desktop Chrome, Safari, Edge load the public URL
- [ ] iPhone Safari and Android Chrome load it; toggles respond to touch without double-firing
- [ ] Add to Home Screen, then airplane mode → the app still opens (service worker)
- [ ] Saved checklists survive closing and reopening the tab / PWA
- [ ] CSV export works on mobile (iOS saves to Files, Android to Downloads)
- [ ] DevTools → Network → Slow 3G: animations stay smooth after first load

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Blank page, 404s for `/assets/*.js` | `base` in `vite.config.js` doesn't match the host path. `/bpi-indicator/` for Pages, `/` elsewhere. |
| Workflow fails with "Pages site not found" | Settings → Pages → Source isn't set to **GitHub Actions**. Set it, then re-run the workflow. |
| Deploy fails on permissions | Settings → Actions → General → Workflow permissions must allow read/write; the workflow already requests `pages: write` and `id-token: write`. |
| Old version keeps loading | Service worker cached the previous build. Hard-reload, or DevTools → Application → Service Workers → Unregister. |
| Saved checklists disappeared | Site data was cleared, or you're in private mode. Storage is per-device and per-browser and never syncs — export CSV regularly. |
| Dashboard warns storage is blocked | Private/incognito mode. Data stays in memory for that session only. |
| CSV does nothing on iOS | Run it in Safari, not an in-app browser. |
| Build warns about Node | Upgrade to Node 20.19+ / 22.12+ (`nvm install 22`). |

## Privacy

Everything is local: no analytics, no cloud sync, no account. Clearing browser data deletes the journal, so export a CSV
before wiping the browser or switching devices.
