# Manual TradingView Test Plan

**Status: no test in this plan has been executed.** Record results in `test-record-template.csv`. A test is only "passed" when it was actually run and the evidence (screenshot, alert log entry, console output) is attached.

Environment for every test unless stated otherwise: TradingView Pine Editor, the exact file content of the audited commit, a clean chart layout containing **only** this indicator.

---

## Phase 0 — Compilation

| ID | Test | Method | Pass criteria |
|---|---|---|---|
| T-00a | Clean compile | Paste `BPI_Indicator.pine` into the Pine Editor, verify the status bar reads `Line 4581, Col 1`, click "Add to chart", read the `>_` console | "Compiled. Added to chart." with zero errors |
| T-00b | Warning inventory | Read every console warning | Each warning is recorded and either fixed or justified in `known-issues.md` |
| T-00c | Token headroom | Note the compiled token count if the compiler reports it; otherwise record that the compile succeeded under the 100,256 limit | Recorded as a number in `known-issues.md` |

## Phase 1 — Historical behavior

| ID | Test | Method | Pass criteria |
|---|---|---|---|
| T-01 | Model layer renders | MNQ1! 15m, defaults. Inspect the HTF projection strip | HTF1 strip + C2/C3/C4 on the newest setup only; no stray labels on older candles |
| T-02 | Extra strips | Same chart, HTF2/3/4 enabled (default) | 30m / 1H / 4H strips render side by side with TF labels, two-line clock labels and CE lines; no overlap between strips |
| T-03 | Pivot markers | Enable HH/HL/LH/LL | Markers sit on their pivot bars; count matches a visual pivot count |
| T-04 | Session levels | 5m chart across a full ET day | Asia / London / NY AM H+L, Midnight Open, 8:30 Open, PDH/PDL all present, dotted, with right-edge grey text |
| T-12 | Session freeze | Watch a session H line after price closes through it | Line stops extending at the breach |
| T-13 | PDH/PDL rollover | Span a daily boundary | PDH/PDL update at the new day; no stale carry-over |

## Phase 2 — Repaint / look-ahead verification (the important phase)

| ID | Test | Method | Pass criteria |
|---|---|---|---|
| T-05 | **R-01 look-ahead** | 5m chart, `brk_tfStructure = 1H`. Record the bar index where the oldest visible MSS line appears on the historical chart. Then Bar Replay forward from an earlier point and record the bar index where the same line first appears | **Currently expected to FAIL.** If the replay index is later than the historical index, look-ahead is demonstrated. Re-run after the fix; pass = identical indices |
| T-06 | **R-03 C3/C4 provisionality** | 15m chart (auto HTF = 4H). Screenshot the newest setup's C3 label and color mid-candle; screenshot again after the 4H close | Differences are expected and must be documented, not "fixed". Record exactly what changes |
| T-07 | SMT stability | Enable SMT with a pair. Note a divergence, reload the chart | Same divergences at the same bars after reload |
| T-09 | **R-05 Turtle Soup intrabar state** | 1m chart, live market. Watch a BSL level during a bar that wicks through it and closes back below | Record: does the BSL line disappear? Does a sweep mark appear then vanish? Does the alert fire? This test decides whether a "non-repainting" statement is permissible |
| T-16 | Reload consistency | With every feature enabled, note 10 specific historical marks, then reload the browser tab | All 10 marks reappear identically (excluding the model layer, which is by design last-bar-only) |
| T-17 | Settings-change consistency | Toggle an unrelated input off and on | Historical marks are unchanged; no ghost-candle flash on the HTF strip |

## Phase 3 — Bar Replay

| ID | Test | Method | Pass criteria |
|---|---|---|---|
| T-18 | Step-through | Bar Replay over 200 bars on 5m, all engines on | No runtime errors; no marks appearing on bars before their confirming bar (except the documented pivot back-draw) |
| T-19 | Model recompute | Observe the HTF strip during replay | Behaves as documented in R-02 (recomputed each step). Confirm this matches the disclosure text |

## Phase 4 — Forward / realtime

| ID | Test | Method | Pass criteria |
|---|---|---|---|
| T-20 | Live session | Run on MNQ1! 5m through a full RTH session | No errors; session lines appear at the correct ET times |
| T-21 | Market open | Observe 09:30 ET | NY AM levels initialize correctly; no `na` artifacts |
| T-22 | Market close / gap | Observe the 17:00 ET futures break and the next open | No spurious sweeps or session lines across the gap |

## Phase 5 — Alerts

| ID | Test | Method | Pass criteria |
|---|---|---|---|
| T-23 | Per-condition alerts | Create one alert for each of the 20 `alertcondition()`s | All 20 appear in the dropdown; none is the leftover `TTFM Rebuild v1.27 Fixed Running` (it should have been deleted) |
| T-24 | `alert()` coverage | Create one "Any alert() function call" alert; wait for a Turtle Soup sweep and a BOS | Both fire. Confirm that GK FVG / Unicorn / CISD do **not** fire through this alert — and that this is documented |
| T-25 | Unconfirmed firing (R-06) | Watch a Breakers alert during a bar whose wick breaks a pivot and closes back inside. Run once in `'Body Only'` and once in `'Body / Wick'` | **Currently expected to FAIL** for the two BOS calls in both modes, and for the two MSS calls in `'Body / Wick'` only. Re-run after adding `alert.freq_once_per_bar_close` |
| T-35 | F-23 — alerts fire while lines are hidden | Set the chart timeframe *above* `brk_tfStructure`, enable all four `alert()` toggles plus an "Any alert() function call" alert | Record whether alerts fire with no visible structure lines |
| T-36 | F-24 — dead alert-name inputs | Set `brk_bosBullName` to a distinctive string and trigger a Bull BOS | Record the delivered text. Expected: the hardcoded `Bull BOS` |
| T-37 | Post-fix regression | After the look-ahead fix, count and locate BOS/MSS marks over a fixed 500-bar window, before vs after | Counts recorded. Fewer and/or later marks expected — intended, not a regression |
| T-26 | Visual/alert match | For each fired alert, confirm a corresponding visual exists | A-25 (Sweep) and A-27 (Entry) are expected to fail under default settings — no visual exists |
| T-27 | Duplicate alerts | Same signal via `alertcondition` and `alert()` (BOS/MSS) | Confirm whether a user with both configured receives two notifications; document |

## Phase 6 — Settings and robustness

| ID | Test | Method | Pass criteria |
|---|---|---|---|
| T-14 | **F-07 session window** | Load 1H and 4H charts | Determine whether the Midnight Open and 8:30 Open lines draw. Expected: they do not. Record the outcome |
| T-15 | Load / responsiveness | 1m chart, 20k bars, all features on, low-tier account if available | Chart loads; no "calculation takes too long"; note the load time |
| T-28 | HTF below chart TF | Set `custom_htf = 1m` on a 15m chart | Record the behavior. No guard exists; expect nonsense output. Decide whether to add a guard or document |
| T-29 | Object cap | `htf_candles = 20`, all 4 extra strips, all FVG/OB engines on | No drawings silently disappear |
| T-30 | Symbol sweep | Repeat T-01/T-04 on ES1!, SPY, EURUSD, BTCUSD | Record per-symbol issues, especially label placement on BTCUSD (fine-tick `mintick*20` offsets) |
| T-31 | Chart types | Heikin Ashi, Renko, line chart | Record behavior; expect synthetic-price signals. Document |
| T-32 | Light theme | `use_light_theme = true` on a white background | All text and lines legible; no black-on-black or white-on-white |
| T-33 | Mobile | TradingView mobile app, 5m and 15m | Record which labels still collide. **Cannot be tested from the development VM** |
| T-34 | New / illiquid symbol | A symbol with <200 bars of history | No runtime error from `max_bars_back`, pivots, or the 19-deep HTF request |

---

## Evidence requirements

For each test record: date/time, TradingView account tier, symbol, timeframe, exact commit SHA, settings deviations from default, screenshot filename, and the raw observation. A test with no evidence file is recorded as `UNTESTED`, not `PASS`.
