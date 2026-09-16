# Repainting and Look-Ahead Report

Commit `10ac946`. Derived entirely from source inspection. Nothing below was observed on a chart.

Classification scheme used:
- **Confirmed** — the mechanism is unambiguous from the code.
- **Probable** — the code strongly implies it; a chart check would be formality.
- **Potential** — depends on runtime behavior I cannot determine statically.
- **Not repainting (by inspection)** — pattern is a known-safe one.
- **Manual verification required** — cannot be classified without running it.

---

## R-01 — Look-ahead bias in the Breakers (BOS/MSS) engine — **CONFIRMED / CRITICAL**

**Location:** lines 3218–3231.

```pine
brk_Fmtf() =>
    phPs = ta.pivothigh(brk_rlBars, brk_rlBars)
    plPs = ta.pivotlow(brk_rlBars, brk_rlBars)
    ...
[brk_phPs, brk_phBi, brk_plPs, brk_plBi] =
    request.security(syminfo.tickerid, brk_tfStructure, brk_Fmtf(), lookahead = barmerge.lookahead_on)
```

**Mechanism.** `brk_Fmtf()` returns the *current* higher-timeframe bar's pivot result (no historical offset). With `lookahead = barmerge.lookahead_on`, TradingView delivers the HTF bar's final value to every chart bar inside that HTF bar — including chart bars that occurred before the HTF bar closed. On historical data the pivot, and therefore the BOS/MSS break, becomes visible up to one full HTF bar earlier than it could have been in real time.

**Affected outputs:** `brk_bosBull`, `brk_bosBear`, `brk_mssBull`, `brk_mssBear`; the BOS/MSS lines drawn at lines 3275 and its bearish counterpart; `alertcondition` "BOS Bull/Bear", "MSS Bull/Bear" (lines 3360–3363); `alert('Bull BOS')`, `alert('Bull Breaker')`, `alert('Bear BOS')`, `alert('Bear Breaker')` (3288, 3290, 3330, 3332).

**Scope qualifier.** `brk_tfStructure` defaults to `''` = the chart timeframe. At the default value the request is same-timeframe and no look-ahead occurs. The bias appears only when the user selects a higher structure timeframe — which the input's own tooltip instructs them to do ("You must be on a timeframe equal to or lower than the one selected"). So the shipped default is safe and the documented usage is not.

**Safe alternative.** Either request the pivot with `lookahead = barmerge.lookahead_off`, or keep `lookahead_on` and shift the expression to a confirmed bar, e.g. wrap the pivot values so they are read as `[1]` (the same pattern already used correctly at line 3252 for `close[1]`/`time[1]`).

**Verification test.** Put the indicator on a 5m chart with `brk_tfStructure = 1H`. Note the bar index of the oldest visible MSS line. Then run Bar Replay forward from a point before that bar and record the bar index at which the same line first appears. If the replay index is later than the historical index, the bias is demonstrated. (Test T-05 in the manual plan. **Not executed.**)

---

## R-02 — Model layer exists only on the last bar — **CONFIRMED (by design) / HIGH impact**

**Location:** line 1204 `if barstate.islast` wrapping the entire HTF strip, C2/C3/C4, T-Spot, projection, sweep and equilibrium renderer; `f_clear()` deletes everything and redraws from scratch on every tick.

**Consequence.** The model's entire visual output is ephemeral. There is no historical trace of any past C2/C3/C4 setup on the chart; what you see is always recomputed from the last 20 HTF candles held in `arr_*`. Users cannot scroll back and see where the model fired, and cannot audit its past behavior from the chart. Bar Replay will show the model recomputing at each step, which will *look* like severe repainting to a user who does not know the design.

This is not dishonest — it is a projection panel, not a signal history — but it must be explicitly disclosed, because "the drawings change every time I reload" is otherwise indistinguishable from a repainting bug.

---

## R-03 — C3/C4 evaluated against the still-open HTF candle — **CONFIRMED / HIGH**

**Location:** lines 1268–1320.

The model scans `c2_idx` from 1 upward, so C2 always sits on a *closed* HTF bar. But `c3_idx = c2_idx - 1` and `c4_idx = c2_idx - 2`, so for the newest setup C3 (and for the next one, C4) resolves to `arr_*` index 0 — the live, still-forming HTF candle assembled at lines 288–312.

**Consequence.** For the newest setup, the C3 label, the `fail_c3` / `fail_c4` state, the valid/fail color, `show_follow_through`, the projections and the C2 sweep line can all change while the current HTF candle is open, and are only final at HTF bar close. On a 15m chart with `auto_htf = 4H`, that means up to four hours of provisional display.

**Not a bug** — a follow-through model cannot know follow-through before the bar closes. But it is the single most important disclosure the product needs: *C3/C4 on the most recent setup are provisional until the higher-timeframe candle closes.*

**Verification test.** T-06 — open a 15m chart mid-way through a 4H candle, screenshot the C3 state, wait for the 4H close, screenshot again. **Not executed.**

---

## R-04 — HH/HL/LH/LL markers drawn backwards with a negative offset — **NOT REPAINTING (by inspection), but visually misleading**

**Location:** lines 1447–1450, `plotchar(..., offset=-rightLen)`.

The marker is placed `rightLen` bars in the past at the moment the pivot confirms. The value never changes afterwards, so it does not repaint. However, on a historical chart it appears to have been available `rightLen` bars earlier than it actually was. Standard pivot behavior; disclose the confirmation lag (`rightLen` bars) in documentation.

Same pattern, same conclusion, for the SMT pivots (931–936), Unicorn (3066–3067), breaker blocks (3435–3436), Turtle Soup context swings (4379–4380) and Turtle Soup MSS pivots (4393–4394). All use symmetric `ta.pivothigh/low` and therefore all confirm with a lag equal to the right-length input.

---

## R-05 — Turtle Soup setup creation on unconfirmed bars — **MANUAL VERIFICATION REQUIRED**

**Location:** lines 4441–4455.

```pine
if not sp.taken and high > sp.price and bar_index > sp.bar
    sp.taken := true
    if close < sp.price
        ts_new_setup(false, sp.price, high, sp.bar)
```

`high` and `close` here are the live bar's running values, so on a realtime bar a sweep setup can be created intrabar and then cease to qualify before the bar closes. Pine rolls back series state on each realtime tick, which should undo the creation — but `sp` is a mutable object held inside a `var` array, and I cannot determine from the source alone whether the `sp.taken := true` mutation and the `array.push` inside `ts_new_setup` are rolled back identically to plain `var` reassignments.

**Why it matters.** If the mutation is *not* rolled back, a level can be marked `taken` by an intrabar wick that closes back outside, permanently removing that BSL/SSL level from the display without producing a setup.

**Verification test.** T-09 — watch a live BSL level during a bar that wicks through it and closes back below, on a 1m chart. Record whether the BSL line disappears and whether a sweep label appears and then vanishes. **Not executed.** Do not ship a "non-repainting" claim until this is resolved.

The associated `alert(...)` calls use `alert.freq_once_per_bar_close`, so *alerts* from this path are confirmation-gated even if the *drawing* flickers.

---

## R-06 — Breakers `alert()` calls fire on unconfirmed bars — **CONFIRMED / MEDIUM**

**Location:** 3288, 3290, 3330, 3332. `alert()` with no `freq` argument defaults to `alert.freq_once_per_bar`, i.e. the first time the condition is true within a bar, whether or not the bar has closed. `brk_highCond` uses live `high` when `brk_mssMode == 'Body / Wick'`. So a wick that pokes through a pivot fires the alert even if the bar closes back inside.

**Fix:** pass `alert.freq_once_per_bar_close`, or gate on `barstate.isconfirmed`.

---

## R-07 — SMT reads the paired symbol's live bar — **CONFIRMED / LOW**

**Location:** 926–929, `request.security(smt_pair1, timeframe.period, high)` with default lookahead. On the realtime bar this returns the pair's developing high/low, so an SMT divergence can appear and disappear intrabar. Pivot confirmation (`smt_swingLen`) means the actual divergence marks lag by `smt_swingLen` bars and are stable once drawn. Low practical impact. Also note `smt_deleteInvalid` (default `false`) and `smt_invalOnClose` (default `false`) — with both off, invalidated SMTs remain on the chart, which overstates the count of valid divergences visible.

---

## R-08 — HTF1 confirmed-candle request — **NOT REPAINTING (by inspection)**

Lines 316–324 use `lookahead_on` with `open[1] … open[19]` offsets. Requesting historical HTF bars with `lookahead_on` is the documented safe pattern: it pins confirmed values and prevents the `na`-flash on recalculation (which is exactly why the author did it — see the comment block at 278–287). No future data is exposed.

---

## R-09 — Extra HTF strips (HTF2–HTF5) — **CONFIRMED provisional display, no signal impact**

Lines 352–355 request the *current* HTF bar with `lookahead_off`, then `f_extra_strip_series()` maintains an 8-deep rolling history keyed on the HTF bar's timestamp. Index 0 of each strip is therefore always the open HTF candle and updates every tick. This is correct for a live projection panel. These arrays are consumed only by `f_draw_extra_strip()` and never feed any engine, so there is no signal contamination.

---

## Summary table

| ID | Area | Classification | Severity | Affects alerts? |
|---|---|---|---|---|
| R-01 | Breakers HTF pivots | Confirmed look-ahead | Critical | Yes (4 alertconditions + 4 alert calls) |
| R-02 | Model drawn only on last bar | Confirmed, by design | High (disclosure) | No |
| R-03 | C3/C4 on open HTF candle | Confirmed, by design | High (disclosure) | No |
| R-04 | Pivot markers, negative offset | Not repainting | Low (disclosure) | No |
| R-05 | Turtle Soup intrabar setup creation | Manual verification required | Medium | Alerts are close-gated |
| R-06 | Breakers `alert()` frequency | Confirmed | Medium | Yes |
| R-07 | SMT live pair data | Confirmed, low impact | Low | No |
| R-08 | HTF1 confirmed candles | Not repainting | — | No |
| R-09 | HTF2–5 strips | Confirmed provisional, isolated | Low | No |

**No claim is made that this indicator is non-repainting.** R-05 alone prevents that claim, and R-02/R-03 mean the honest description is: *the projection panel and the newest setup are provisional by design; confirmed historical signals come only from the pivot-based engines, with a confirmation lag.*
