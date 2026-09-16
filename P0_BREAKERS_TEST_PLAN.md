# P0 — Breakers manual test plan

Applies to `remediation/p0-safe-fixes` (look-ahead fix F-01 + alert timing F-09).
Record every run in `P0_MANUAL_TEST_RECORD.csv`. Only T-P00 (Pine Editor compilation) has been executed — it passed with warnings only. **Every behavioral test below is still UNTESTED.**

## Environment

- TradingView Pine Editor, `BPI_Indicator.pine` pasted whole. Verify the status bar reads `Line <file lines + 1>, Col 1` before compiling, so a truncated paste is not mistaken for a code error.
- Use a chart with **only this indicator** loaded. Other indicators on the pane make BOS/MSS marks impossible to attribute.
- Settings to note for every run: `Structure Timeframe` (`brk_tfStructure`), `Pivot Lookback` (`brk_rlBars`), MSS mode (`Body Only` / `Body / Wick`), and which Breakers alert toggles are on.
- For before/after comparisons, keep the baseline build (`audit-baseline-20260916`) in a second saved script so both can be added to the same chart.

## Timeframe relationship tests

| ID | Setup | Expected result |
|---|---|---|
| T-P01 | Chart TF **below** structure TF (e.g. 5m chart, 1h structure) | Lines and marks appear only at or after the close of the HTF bar that confirmed the pivot. No mark sits earlier in the HTF bar than its confirming close. This is the primary look-ahead check. |
| T-P02 | Chart TF **equal** to structure TF (e.g. 1h chart, 1h structure) | Pivots resolve on the chart's own bars; marks appear `brk_rlBars + 1` bars after the pivot bar. Lines still draw (`brk_tfL0` is true). |
| T-P03 | Chart TF **above** structure TF (e.g. 4h chart, 15m structure) | `brk_FtfLimit()` is false, so structure lines are invisible. **Known open defect F-23: the alerts still fire.** Record what actually happens rather than assuming either behavior. |
| T-P04 | Historical chart reload (F5 / re-add indicator) on the same symbol and TF | Mark positions are byte-identical to the previous load. Any difference means state is leaking across loads. |

## Look-ahead acceptance tests

| ID | Setup | Expected result |
|---|---|---|
| T-P05 | Same symbol/TF, baseline build and fixed build on one chart | Fixed build's marks are at or later than the baseline's, never earlier. Screenshot both. Record the mark count for each — counts may differ in either direction because the state machine can take a different path, which is expected, not a failure. |
| T-P06 | Bar Replay from a point ~200 bars back, stepping bar by bar, fixed build | Each mark appears at the same bar it occupies on the fully loaded historical chart. Divergence here means look-ahead remains. |
| T-P07 | Bar Replay, baseline build, same start point | Expected to diverge from its own historical chart. This run exists to document the pre-fix defect; if it does *not* diverge, F-01's severity assessment needs revisiting. |
| T-P08 | Maximum practical history (deep scroll-back on a liquid symbol, e.g. MNQ1! 5m) | No runtime error, no "too many drawings" message, marks still appear at the far left. Note any `line` limit truncation. |

## Real-time alert tests

These require a live session during market hours. They cannot be simulated with Bar Replay, because Bar Replay does not reproduce intrabar tick behavior.

| ID | Setup | Expected result |
|---|---|---|
| T-P09 | Alert created on a Breakers `alert()` signal (Bull BOS / Bear BOS / Bull Breaker / Bear Breaker), watched through an **open** candle that breaks structure | **No** notification while the candle is open. Pre-fix this fired immediately. |
| T-P10 | Same alert, at the candle **close**, with the break still valid | Exactly one notification, at or just after the close. |
| T-P11 | Open candle breaks structure, then price retraces so the break is no longer valid at the close | No notification. This is the case the fix is for. Note that for BOS the condition uses the bar's `high`/`low`, which do not retrace, so a wick break will still alert at the close — record what happens rather than assuming. |
| T-P12 | Multiple Breakers conditions satisfied on one candle | No duplicate notification for the same signal on the same bar. Different signals may each fire once. |
| T-P13 | `alertcondition()`-based alert (BOS Bull / BOS Bear / MSS Bull / MSS Bear), created with frequency **Once Per Bar Close** in the alert dialog | One notification at the close. These four are user-configured; the script cannot force their frequency. |
| T-P14 | Same `alertcondition()` alert created with frequency **Once Per Bar** | Fires intrabar. Expected, and the reason the alert dialog frequency has to be part of any customer-facing setup instruction. |
| T-P15 | MSS alerts in `Body Only` vs `Body / Wick` mode | `Body Only` compares against the confirmed HTF close and should not flip mid-candle; `Body / Wick` uses live `high`/`low` and can. Run both. |

## Context-change tests

| ID | Setup | Expected result |
|---|---|---|
| T-P16 | Change chart timeframe with the indicator loaded | Marks recompute for the new TF with no runtime error and no stale lines from the previous TF. |
| T-P17 | Change symbol | As above; no lines inherited from the previous symbol. |
| T-P18 | Change `Structure Timeframe` input while loaded | Marks recompute; line visibility follows `brk_FtfLimit()` for the new relationship. |

## Pass criteria

The look-ahead fix is accepted only if T-P01, T-P05 and T-P06 all pass with screenshots attached. The alert timing fix is accepted only if T-P09, T-P10 and T-P12 pass in a live session. Until then the release status stays at **READY FOR INTERNAL TESTING ONLY** at most.
