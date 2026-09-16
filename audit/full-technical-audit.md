# BPI Indicator — Full Technical Audit

Commit `10ac946`. Static source review only; nothing was executed.

---

## 1. File inventory

| File | Lines | Purpose | Pine version | Production relevance | Executable? | Claims/assumptions | Manual testing needed |
|---|---|---|---|---|---|---|---|
| `BPI_Indicator.pine` | 4,580 | The shipped indicator. Single-file entrypoint. | v6 | **Primary** | Yes | Assumes ET-based futures sessions; assumes chart TF ≤ selected HTFs | Yes — everything |
| `bblock_module.pine` | 185 | Standalone copy of the breaker-block engine | v6 | Reference copy, not shipped | Yes (standalone) | Must be kept in sync with host | Only if edited |
| `brk_module.pine` | 215 | Standalone copy of the ICTProTools BOS/MSS engine | v6 | Reference copy, not shipped | Yes | Carries the same look-ahead pattern as the host | Only if edited |
| `gkfvg_module.pine` | 80 | Standalone copy of the GK ICT FVG engine | v6 | Reference copy | Yes | — | Only if edited |
| `hfvg_module.pine` | 364 | Standalone copy of the HTF FVG engine | v6 | Reference copy | Yes | — | Only if edited |
| `tcisd_module.pine` | 254 | Standalone copy of the tncylyv CISD engine | v6 | Reference copy | Yes | Still contains the MTF trend table that was removed from the host | Only if edited |
| `.gitignore` | 3 | Ignores `crop_*.png`, `fractal_source.txt`, `*.rtf` | n/a | Build hygiene | No | — | No |

**Gap:** there is no README, no `/docs`, no release notes, no known-issues file, no test files, no screenshots, no alert documentation, no changelog. Nothing in the repository describes what the indicator does or how to configure it.

**Drift risk:** the five `*_module.pine` copies duplicate logic that also lives inside the host file. Nothing enforces synchronization. `tcisd_module.pine` is already out of sync — it still contains the multi-timeframe trend table that was deleted from the host in commit `b36cb7b`.

---

## 2. Pine version and platform compatibility

- Declared `//@version=6`. No v4/v5-only constructs were found.
- Declaration: `indicator("BPI Indicator", shorttitle="BPI", overlay=true, max_bars_back=5000, max_boxes_count=500, max_lines_count=500, max_labels_count=500, max_polylines_count=100)`.
- All four drawing-object budgets are set to the **maximum** allowed. There is no headroom; if the script ever exceeds 500 live lines the oldest are silently dropped, which looks to a user like drawings randomly disappearing.
- `max_bars_back=5000` raises memory use on every chart. Combined with 30 `request.security()` calls this is a meaningful load; see `performance-claims-audit.md`.
- No `request.security_lower_tf()` is used, so no lower-timeframe intrabar dependency and no premium-tier requirement from that direction.
- No `varip` is used — good; no intrabar-persistent state that survives rollback.
- The compiled script previously exceeded Pine's 100,256-token limit during development and had to be trimmed. Any new feature will likely require removing an existing one.

**Account-tier assumptions:** the script does not itself require a paid TradingView plan, but a user who wants alerts on several of these signals simultaneously will hit the free plan's alert count limit. This should be stated in documentation.

---

## 3. Architecture overview

The file is a host script (the Fractal Model / HTF projection engine) with six third-party engines bolted in under namespace prefixes:

| Prefix | Engine | Approx. lines |
|---|---|---|
| (none) | Fractal Model: HTF candle projection, C2/C3/C4 closure model, T-Spot, projections, sweeps | 1–1,460 |
| `smt_` | SMT divergence | 900–1,050 |
| `ss_` | Session swings / POI arrays | 2,035–2,200 |
| `org_` | Opening range / gap logic | 2,600–2,900 |
| `uni_` | Unicorn model | 3,050–3,145 |
| `brk_` | ICTProTools BOS/MSS breakers | 3,150–3,365 |
| `bb_` | Breaker blocks | 3,430–3,550 |
| `hfvg_` | HTF FVG | 3,600–3,915 |
| `gkf_` | GK ICT FVG | 3,916–3,993 |
| `tcisd_` | CISD (tncylyv) | 3,994–4,208 |
| `ts_` | Turtle Soup + BSL/SSL | 4,209–4,568 |

Namespacing is applied consistently, which is the main reason this many engines coexist without collisions. The trade-off is that the same concept (FVG, MSS, pivots, CISD) is implemented more than once with different definitions — e.g. FVG exists in `hfvg_`, `gkf_`, and inside the Turtle Soup confluence check; MSS exists in `brk_` and `ts_`. A user seeing two different "MSS" marks from one indicator has no way to know they come from different engines with different rules. **This should be documented or consolidated.**

---

## 4. External data requests (`request.security`)

30 calls. Full detail in `repainting-and-lookahead-report.md`; summary:

| Group | Lines | Symbol | TF | Expression | Lookahead | Safe? |
|---|---|---|---|---|---|---|
| HTF1 confirmed candles | 316–324 | chart | `htf` (auto/custom) | `open[1..19]` etc. | `lookahead_on` | **Yes** — historical offsets only; this is the documented safe pattern |
| HTF1 live candle | 288–312 | chart | `htf` | built locally from chart bars | n/a | Yes — but it is the *open* HTF bar, so anything derived from index 0 is provisional |
| HTF2–5 strips | 352–355 | chart | user | `[o,h,l,c,time]` current bar | `lookahead_off` | Yes |
| SMT pairs | 926–929 | user symbol | chart TF | `high`, `low` | default (off) | Yes |
| Session swings | 2046–2056 | chart | 240/60/15 | pivots + `time[n]` | `lookahead_off` | Yes |
| **Breakers pivots** | 3231 | chart | `brk_tfStructure` | `brk_Fmtf()` — current-bar pivots | **`lookahead_on`** | **No — see F-01** |
| Breakers close/time | 3252 | chart | `brk_tfStructure` | `[close[1], time[1]]` | `lookahead_on` | Yes — offset 1 |
| HTF FVG | 3875–3910 | chart | 6 user TFs | `[o,h,l,c,t][1..3]` + `ta.atr(14)` on 1D/1M | default (off) | Yes |

Two observations beyond the look-ahead issue:

- `hfvg_daily`/`hfvg_monthly` request `ta.atr(14)` from the 1D and 1M timeframes with the **default** lookahead. On a 1M request, the value only updates monthly; the code should confirm it tolerates `na` for the first bars of a new symbol. Not verified.
- The HTF1 "two separate security calls" design (comment at lines 278–287) is a deliberate anti-flicker workaround. It is sound, but it means the live HTF candle (index 0) is built from *chart* bars while indices 1–19 come from the *HTF* feed. If the chart timeframe does not divide evenly into the HTF, index 0's OHLC can differ slightly from the exchange's HTF bar. Unverified; worth a manual check on an odd pairing (e.g. 7m chart).

---

## 5. Inputs audit

396 input declarations. Full per-input enumeration is impractical here; the material findings:

- **Volume.** 396 inputs across ~25 groups is far beyond what a user can navigate. There is no "presets" mechanism. This is the single biggest usability risk for a paid product.
- **`brk_tfStructure = input.timeframe('')`** defaults to the chart timeframe. At the default, the look-ahead call (line 3231) requests the chart's own timeframe and is therefore harmless. The bias only appears once the user sets a higher timeframe — which the tooltip actively encourages. Dangerous default-vs-documented-use mismatch.
- **No guard against HTF < chart TF.** `custom_htf`, `htf2_tf`–`htf5_tf`, and the six `hfvg_htf_*` inputs accept any timeframe. Selecting one below the chart timeframe produces meaningless output rather than a warning. `brk_FtfLimit()` does this check for the breakers engine only.
- **`history` (max 40) × `htf_candles` (max 20)** — the model scan is bounded by `math.min(num - 1, 18)` so the effective cap is fine, but `history=40` is presented to the user as achievable when only ~18 setups can ever be scanned. Misleading range.
- **Ranges that invite performance problems:** `htf_space_between` max 200, `htf_offset` max 100, `ts_liq_max`, `hfvg` count inputs. None are individually dangerous; combined with 500-object caps they can cause silent drawing loss.
- **Leftover scaffolding:** `alertcondition(alerts_on, "TTFM Rebuild v1.27 Fixed Running", ...)` at line 1421 exposes an internal build name in the user's alert dropdown. Should be removed before launch.
- **Wording:** many input titles are internally namespaced and user-hostile, e.g. group names `CISD (tncylyv) — Visual`, `CISD (tncylyv) — Colors`. Third-party author handles are surfaced directly in the settings UI.

---

## 6. State, arrays, objects, cleanup

- `var` arrays are used throughout for pivots, setups, FVGs, and drawing handles. Every unbounded producer found is trimmed: `ts_ph_bar`/`ts_pl_bar` at 80 (`while ... array.shift`), `ts_setups` at `ts_max_models`, and the zig-zag trim in `bb_push`.
- `f_clear()` deletes and clears `boxes`, `lines`, `labels`, `htfEqLines` at the top of every `barstate.islast` redraw. Correct, and the reason the object caps are not blown by the strip renderer.
- `lbl_all` is `array.clear()`ed each bar (line 1584) and only holds handles, so no leak.
- **Minor defect:** the anti-overlap merge (lines 4570–4580) blanks the losing label with `label.set_text(li, "")` instead of deleting it. Empty labels still consume slots against `max_labels_count=500`. Cosmetically invisible, but it wastes budget.
- **Minor defect:** the merge is O(n²) over `lbl_all`. n is small (≤ ~14), so this is not a performance problem, but the merge is order-dependent: whichever label was pushed first wins the position, so the displayed order of `PDL/SSL` is a function of code order, not price. Users may see `SSL/PDL` on one chart and `PDL/SSL` on another.
- Object field mutation on realtime bars (`sp.taken := true` at lines 4442/4452, and the `TSSetup` fields) relies on Pine's rollback of series state to behave correctly intrabar. This is the one state-model assumption in the script I could not verify statically — see `repainting-and-lookahead-report.md` R-05.

---

## 7. Numerical and logical safety

- **Division:** 77 `/` operations. The ones in price math are of the form `(a + b) / 2` or `/ 2.0` (equilibrium, midpoints) — constant denominators, safe. `math.round(candle_w / 2)` at line 1210 is **integer division**; with `candle_w = 1` (the "Small" default) it yields 0, which is why the code wraps it in `math.max(1, ...)`. Correct, but fragile if edited.
- **`na` handling:** the drawing loops guard with explicit `na()` checks before use (e.g. lines 1224, 1281, 1377). `nz(ta.atr(14))` is used at lines 688, 1582, 4248 — `nz` of `na` is 0, which makes `lbl_tol` 0 on the first bars, disabling the merge until ATR warms up. Harmless.
- **Comparisons with `na`:** line 3255 `if ((brk_plPs > brk_nPl1 and brk_bull) or na(brk_nPl1) or brk_plPs < brk_nPl1)` — the first comparison is evaluated against a possibly-`na` `brk_nPl1`; Pine returns `false` for `na` comparisons so the `or na(...)` branch catches it. Correct but only by luck of ordering.
- **Precision:** prices are compared with raw `>` / `<` rather than mintick-aware tolerance (e.g. `high > sp.price` at 4442). On instruments with coarse ticks this is fine; on symbols where a sweep is exactly equal to the level, the sweep will not register. Consider `>=` or a mintick epsilon. Behavioral choice, flagged not fixed.
- **Unreachable/duplicated conditions:** none found that would change behavior. `bear_setup`/`bull_setup` at 1290–1291 are mutually exclusive by construction.
- No `math.log`/`sqrt`/negative-root hazards. No user-supplied lengths reach `ta.*` functions without `minval` guards.

---

## 8. Visual behavior

- Default palette is grey lines/text with a light-blue candle body (`#c0f7fe`) and black borders. The black borders and black C2/C3/C4 text are chosen for a **dark** chart background with light candles; `use_light_theme` exists but the third-party engines' colors are independent inputs and were not audited for theme consistency. **Unverified on a light background.**
- Scale: all vertical offsets are computed from `ta.atr(14)` or `syminfo.mintick * N` (e.g. `syminfo.mintick * 20` at line 1250). The mintick-based ones do not scale with volatility — on a high-priced, fine-tick instrument (e.g. a crypto pair with 8 decimals) `mintick * 20` is visually zero and labels will sit on top of the candle. **Confirmed by inspection; needs a manual check on BTCUSD and on a penny stock.**
- Mobile: the user has already reported label collisions in the TradingView mobile app. The mitigations added (size-down of clock/BSL/SSL, the slash-merge) reduce but cannot eliminate collisions, because horizontal crowding on a phone is a function of viewport width, which Pine cannot read. **No mobile verification is possible from this environment.**
- `plotchar(..., offset=-rightLen)` for HH/HL/LH/LL (lines 1447–1450) draws the marker `rightLen` bars back once the pivot confirms. This is standard, but on a historical chart it *looks* as if the marker was available at the pivot bar. This must be disclosed — it is the most likely source of a "your indicator repaints" complaint even though the underlying logic is honest.

---

## 9. Symbol / session / timezone assumptions

- All session logic hardcodes `"America/New_York"` (lines 1771–1785, 2115–2116, 2712, 2852, 2981). Correct for CME index futures (the development symbol was `MNQ1!`). For FX, crypto, or non-US equities the session names shown to the user ("Asia", "London", "NY AM") will be right in ET but may not match the instrument's actual trading behavior.
- Session labels say "(ET)" in the Asia/London input titles only; the hardcoded NY AM, midnight, and 8:30 windows carry no timezone hint in their UI text.
- `midnight_sess_time = time(timeframe.period, "0000-0002", ...)` and `open830_sess_time = time(..., "0830-0832", ...)` use 2-minute windows. A bar only matches if it *starts* inside the window. On a 1H or 4H chart no bar starts at 08:30, so the 8:30 Open line should never draw there. **Probable defect — verify manually on 1H (test case T-14).**
- No `syminfo.type` / `syminfo.session` branching anywhere: the indicator behaves identically on a 24h futures contract and a 6.5h equity session, including the daily-boundary logic.
- Chart-type assumptions: the script reads `open/high/low/close` directly, so on Heikin Ashi, Renko, Kagi or Range charts every signal is computed from synthetic prices. Nothing warns the user. Standard Pine caveat, but it must be in the docs.

---

## 10. Alerts

See `alert-test-matrix.csv` for the test grid. Structural findings:

- 20 `alertcondition()` + 6 `alert()` calls.
- **Mixed mechanisms.** `alertcondition()` requires the user to create one alert per condition; `alert()` fires from inside the "Any alert() function call" alert. A user who sets up "Any alert() function call" gets Turtle Soup and Breakers events but **not** GK FVG, Unicorn, breaker blocks, or CISD. A user who sets up the individual conditions gets the reverse. Nothing in the UI explains this.
- **The flagship model has no alert.** C2/C3/C4 formation, failure, and T-Spot produce no alert of any kind.
- `alert()` inside the breakers engine (lines 3288, 3290, 3330, 3332) is called with **no `freq` argument**, so it defaults to `alert.freq_once_per_bar` — it can fire on an unconfirmed bar. Combined with the look-ahead pivot request, these are the least trustworthy alerts in the script.
- The Turtle Soup alerts (4439, 4512, 4526) correctly use `alert.freq_once_per_bar_close`.
- Alert *messages* are plain strings; the `alertFormat` input (line 18) defines a JSON template that, as far as I can see, is **not referenced by any alert call**. Users configuring webhooks with that template will get nothing. **Confirm with a grep-level trace before release** — if unused, remove the input.

---

## 11. Positive findings

Not everything is a risk. Worth recording:

- Consistent namespacing prevented collisions across seven imported engines.
- The HTF1 dual-request pattern is a correct, documented solution to the recalculation flash.
- Drawing-object lifecycle is disciplined: everything the redraw creates is tracked in an array and deleted on the next redraw.
- Array growth is bounded everywhere it could grow.
- `lookahead_on` is used correctly (with historical offsets) in 2 of the 3 places it appears.
- No `varip`, no `security_lower_tf`, no obviously deprecated v5 idioms.
