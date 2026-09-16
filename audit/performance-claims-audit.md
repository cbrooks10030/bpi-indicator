# Performance Claims Audit

Two distinct meanings of "performance" are covered here: (A) claims about trading results, and (B) runtime/computational performance. No trading performance was measured, calculated, or estimated during this audit, and none will be.

---

## A. Trading performance claims

### Claims found in the repository

**None.** The source contains no win-rate, accuracy, profit, or expected-return statement. There is no README, no marketing copy, and no release notes in the repository, so there is nothing to audit against. This is the desirable state and should be preserved.

### Claims that must never be made

Because this codebase has no backtest, no strategy conversion, and no statistical evaluation of any kind, **no claim of profitability, accuracy, win rate, edge, expected return, or "proven" performance is supportable by anything in this repository.** If marketing material exists outside the repository, it should be checked against this fact.

Specific prohibitions for any future copy:
- No win rate or accuracy percentage.
- No profit, income, or return figure, including hypothetical.
- No "proven", "guaranteed", "consistent", or "risk-free" language.
- No screenshot of cherry-picked winning signals presented as typical.
- No implication that the indicator predicts price.

### What could legitimately be claimed later

Only after the work in `manual-tradingview-test-plan.md` and a properly constructed study:
- Descriptive facts: "marks higher-timeframe C2/C3/C4 closure sequences", "draws session highs and lows in ET".
- Verified behavioral facts: "pivot-based signals confirm N bars after the pivot and do not repaint thereafter" — **only once R-05 is resolved**.
- Nothing about outcomes.

### Note on converting to a strategy

There is currently no `strategy()` version. Any future backtest built from this code would inherit **R-01 (confirmed look-ahead bias in the Breakers engine)**, which would inflate results. R-01 must be fixed before any backtest number is produced, let alone published.

---

## B. Runtime performance (static assessment)

No profiling was run. These are structural observations.

| Factor | Measured statically | Risk |
|---|---|---|
| `request.security()` calls | 30 | High. TradingView's limit is 40 per script; the script is at 75% of it and has no room for new HTF features. |
| Input declarations | 396 | Settings dialog will be slow to open and is unusable without documentation. |
| `for` loops | 72 | Most are bounded by small constants (≤20 HTF candles, ≤80 pivots). No unbounded nesting found. |
| `while` loops | 23 | All are array-trim loops with a shrinking condition. No infinite-loop risk found. |
| Drawing object budget | `max_boxes/lines/labels = 500` each, `max_polylines = 100` | At maximum. No headroom; exceeding it silently deletes the oldest objects. |
| `max_bars_back` | 5000 | Raises memory per chart. Chosen deliberately; not obviously reducible given the 19-deep HTF history. |
| Compiled token count | Hit Pine's 100,256 ceiling during development; currently under it by an unknown margin | High. Any addition likely requires a removal. **Measure the exact current token count on the next compile and record it.** |
| Full-redraw on every tick | `if barstate.islast` block deletes and recreates the entire strip/model layer each tick | Medium. This is the standard pattern, but with up to 20 HTF candles × (1 box + 2 lines) plus 4 extra strips × 8 candles it is a few hundred object operations per tick. Likely the main source of any sluggishness users report. |
| Duplicate security requests | Not detected — each of the 30 requests has a distinct (symbol, timeframe, expression) triple | Low |

### Runtime performance items to verify manually

1. Chart load time on a 1m chart with 20k bars, all features enabled (test T-15).
2. Whether "Calculation takes too long" ever triggers on a low-tier TradingView plan.
3. The exact compiled token count at the next compile — record it in `known-issues.md` so the remaining headroom is a tracked number rather than a guess.
4. Whether the 500-object caps are ever hit with `htf_candles = 20`, all 4 extra strips on, and all FVG/OB engines enabled. If so, users will see drawings vanish with no explanation.

**None of the above has been executed.**
