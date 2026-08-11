# Trading Entry Decision Game

An interactive, mobile-friendly checklist that turns the ICT + TT Trades Fractal Model + Charmaine Trades ATM framework
into a weighted scoring game. Work top-down from the daily, watch the live percentage, and get a hard EXECUTE / WATCH /
WAIT verdict with auto-generated reasoning.

- One timeframe on screen at a time: answer the last question on a page and the next timeframe animates in
- Sticky rail with the live probability, the New York clock to the second, active cautions, and what is still in your favour
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

**2. 4H power of three (20%).** C2 formed or forming (10, required) and C2 in the direction of the daily bias (10,
required). That is all it takes — a forming C2 counts, and the CISD plus candle closure on the timeframe below is what
tells you one is coming before the candle is done. Everything else here only adds: C2 sweeping liquidity as it builds
+8%, sweeping into an FVG on the same candle +5% (the most powerful version), C2 at a daily POI +5%. A NO on any of
those costs nothing.

**3. 1H delivery check (16%).** Is the last change in state of delivery in our direction (10, required — **answering NO
hard stops the checklist at 25%**), 1H candle closure (3), 1H delivered into a POI (3). A closure that swept liquidity
is +4% — on every timeframe, a sweeping closure is always an extra plus and never a requirement.

**4. 30M and 15M continuation (8% each).** Candle closure and a CISD in our direction on each, plus the same +4% sweep
bonus. The highest closure ticked picks the confirmation timeframe: 1H or 30M → **5M**, 15M → **3M**.

**5. 5M + 3M — time, liquidity and the entry function (40%).** 7AM (2) and 8AM (2) hour high/low, Asia (1) and London
(1) high/low taken out, price against the midnight and 8:30 opens (4) and premium/equilibrium/discount (4) — both only
score when they agree with the bias. Then the C3 trigger: current CISD direction (4), CISD on the entry timeframe (8,
required), MSS (2), FVG near the latest CISD (2), which PD arrays are present (2, multi-select), OTE at those arrays (4,
required), R:R ≥ 2R (4, required). Breaker marked +3%, wick-only CISD −20%.

**6. Entry timeframe picker.** At the bottom of the 5M + 3M page you choose where you actually pull the trigger. Pick
**3M** and the 1M page disappears and stops counting; the remaining weights are re-normalised so the ceiling is still
100%.

**7. 1M precision (8%).** Only shown when you enter on the 1M: CISD confirmed on the 1M (4) and a tighter entry inside
the same PD array (4).

**8. Correlation — confluence only, never a gate.** NQ and ES showing the same LTF CISD is +5%; the dollar printing the
*inverse* CISD at the same moment is +6% (the full triple-confirmation stack); the dollar moving *with* NQ/ES docks
−10% but never blocks the trade.

**9. Live management.** While the trade runs, flag delivery turning against you on any timeframe, your protected swing
being taken, or the draw already delivering. Each one subtracts immediately, raises a caution, and the rail keeps
listing which PD arrays and confluences are still on your side.

### Score maths

Base weights total **100%**. Bonuses are capped at **+15%**, penalties at **−50%**, then:

```
base  = 100 × earned / weight of the timeframes still in play
score = clamp(base + bonus − penalty, 0, 100)
if any mandatory question failed   → score = min(score, 50)
if no 1H/30M/15M closure at all    → score = min(score, 50)
if the last CISD is against us     → score = min(score, 25)
if the NY clock is past 11:00      → score = min(score, 25)
```

Bands: red 0–49 (WAIT), yellow 50–79 (WATCH CLOSELY), green 80–100 (EXECUTE).

### The clock is part of the score

The app reads the wall clock in `America/New_York` (not your device timezone, and DST-correct) and re-scores every
second:

| New York time | Effect |
| --- | --- |
| before 9:30 | −20% and a caution counting down to the open |
| 9:30–11:00 | +5% — the window you actually trade |
| 9:50–10:10 and 10:50–11:10 macros | a further +5% while the macro is live |
| 11:00 onwards | hard cap at 25% — no new trades, whatever the chart says (this overrides the second macro) |

Timing logic lives in `src/lib/clock.js` with tests in `src/lib/clock.test.js`.

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
- [ ] Ticking a 1H closure shows "entry 5M" in the rail and rewrites the entry questions to the 5M
- [ ] Answering the last question on a timeframe auto-advances to the next one, and nothing below is visible early
- [ ] Choosing "3M" as the entry timeframe removes the 1M page and re-normalises the score
- [ ] The rail clock ticks in New York time; before 9:30 docks, inside the window and macros add, after 11:00 caps at 25%
- [ ] Live flags (CISD flipped, swing taken, draw delivered) drop the probability instantly and list what is still in favour
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
