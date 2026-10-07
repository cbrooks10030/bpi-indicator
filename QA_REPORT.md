# QA Report — BPI_Fractal_Indicator_Fast.pine

Scope: full read-through of `BPI_Fractal_Indicator_Fast.pine` (2.5k lines) for correctness, repainting, limits, efficiency and release readiness. **No TradingView compilation or runtime test was performed from this environment** — see "Manual TradingView checks". Line numbers refer to the audited revision on branch `indicator-audit`.

## Findings

| # | Sev | Where | Finding | Root cause | Fix | Verified by |
|---|---|---|---|---|---|---|
| 1 | **High** | SMT engine (`runtime.error`, ~L1876) | Script stops with "Runtime error" on any symbol not in the SMT pair registry while `Show SMT` is on (default). Likely the "Runtime error" popups seen earlier. | Upstream code treated a missing pair as fatal. | Applied — replaced with `smt_enabled = show_smt and smt_pair1 != ""`; all SMT gates use it; table already shows `SMT: n/a`. | Static review. Manual: load on AAPL / EURUSD, confirm no error. |
| 2 | Medium | `icFindCisdLevel`, `replayIc` (~L820–900) | `open[i]`/`low[off]` referenced up to ~800 bars back with a dynamic index. TradingView sizes the history buffer from what it sees on historical bars; a deeper first reference on a realtime bar raises "historical offset beyond buffer". | Dynamic series indexing without a declared buffer. | Applied — `max_bars_back(open/high/low/close, 1000)`. Behaviour-neutral. | Static. Manual: leave chart live through several HTF periods. |
| 3 | Low | `processC2` (~L1163) | On the first HTF period of a chart `state.prevLow/prevLowBar` are `na`; a trigger there would create a setup with `na` extreme and draw at `na` coordinates. | State is filled only after the first completed HTF candle. | Applied — trigger also requires non-`na` extreme price and bar. | Static. |
| 4 | Low | Alerts tooltip (L10) | Text said "Add Alert on Fractal Model [Pro+]" (upstream product). | Copy left from source. | Applied. | — |
| 5 | Low (perf) | `f_smt_nearest`, `f_smt_detect_*` | Full scans of up to 150 swings × 150 per pivot bar. | No early exit although arrays are bar-ordered. | Applied — `break` once past the window; identical results. | Static reasoning: only elements outside the window are skipped. |
| 6 | Info | Projections | `StdDevData.lines` array is created but never populated; projections are label-only. Harmless. | Upstream design. | Not applied. | — |
| 7 | Info | `ICCisd.ln` | Always `na`; only the dot label is used. Harmless. | Upstream. | Not applied. | — |
| 8 | Info | `request.security(..., lookahead_on)` | Lookahead is used on the HTF O/H/L/C. Triggers read `c2Buy[1]` on the period-change bar, i.e. from the completed candle, so there is no historical/realtime divergence for setups. CISD/Early-CISD confirmations use live `close` and can flicker intrabar (documented in README). | Upstream design. | Not changed (would alter model behaviour). | Manual: compare replay vs live on same session. |
| 9 | Info | Drawing limits | Worst case ≈ 27 HTF candles (1 box + 3 lines each) + 10 setups × (2 boxes, ~4 lines, ~9 labels) + GK ≤ 140 boxes + key levels/sessions/SMT/liq — all under the 500 caps; `History = 0` is the only unbounded mode. | — | Documented. | — |
| 10 | Info | `request.security` count | 3 per bar (HTF tuple, 2 SMT tuples). The second SMT request runs even when the second pair is off (empty symbol = chart symbol); Pine cannot skip a `request.*` call conditionally. | Pine semantics. | Not changeable without removing the feature. | — |
| 11 | Info | Free-text inputs | `Timezone` and `Second Comparison Symbol` can be set to invalid values → TradingView error. | Input types. | Documented in README. | — |
| 12 | Info | `BPI_Fractal_Indicator.pine` (non-Fast) | Carries findings 1–4 as well; not changed per instruction to keep it untouched. | — | Decide at release which file ships. | — |

## Not found
- No deprecated v5 calls, no `var` misuse, no unbounded arrays other than `History = 0`, no loops over full history per bar, no duplicate HTF requests, no debug plots/tables exposing logic.

## Tests completed here
- Static read of the whole script; all edits checked with grep/diff (`git diff` on the branch).
- Pine cannot be compiled or executed in this environment; no results are claimed.

## Manual TradingView checks (required before selling)
1. Paste into Pine Editor → Add to chart: **no compile error**. — PASSED (user, 2026-10-07).
2. NQ1! 5m, 1m, 15m, 1H (Auto): C2/C3/C4, CISD, IC-CISD dots, projections only on live C2s, HTF blocks aligned.
3. AAPL and EURUSD 5m: loads with `SMT: n/a`, no runtime error (finding 1).
4. Leave a live 1m chart running across ≥ 3 HTF periods: no "historical offset" error (finding 2), countdowns tick.
5. Replay mode vs live: setup marks identical; CISD lines may appear/disappear intrabar only on the live bar.
6. Alerts: create "Any alert() function call" with `Alerts?` on; confirm a C2 / IC-CISD notification arrives; create "Bullish CISD Confirmed" named alert.
7. Inputs: History 0 and 40, HTF candles 1 and 10, Offset 0, label offsets ±1000, Time Stamps on — no errors.
8. Daily and Weekly charts: model draws (Auto maps 1D→1M), Key Levels/Sessions/ORG hidden.
9. First bars of a thin-history symbol (e.g. new futures contract): no error on first HTF period (finding 3).

## Remaining risks
- Compilation confirmed by the user in TradingView for this revision; runtime checks 2–9 still open.
- Intrabar CISD flicker is inherent to the model; disclose it to buyers.
- `History = 0` relies on TradingView's own object eviction.
