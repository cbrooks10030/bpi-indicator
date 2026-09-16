# Breakers Alert Inventory

Source of authority: `BPI_Indicator.pine` at commit `10ac946`, lines 3151–3363. Every statement below was read off the source, not inferred from the earlier audit documents.

---

## 1. Reconciliation: four or eight?

**Eight.** The earlier audit documents were inconsistent, and two of them were wrong.

| Document | What it said | Verdict |
|---|---|---|
| `repainting-and-lookahead-report.md` line 124 | "4 alertconditions + 4 alert calls" | **Correct** |
| `known-issues.md` F-01 | "their 8 alerts" | **Correct** |
| `executive-summary.md` line 22 | "Affects BOS/MSS lines and 4 alerts" | **Wrong** — undercounts; omits the four `alert()` calls |
| `executive-summary.md` line 14 | "Two of the script's four `alertcondition()`s … and two `alert()` calls" | **Wrong twice.** The script has 20 `alertcondition()`s in total, not four; and **all four** Breakers `alertcondition()`s plus **all four** Breakers `alert()` calls sit on the affected logic, not two and two |
| `known-issues.md` F-09, `remediation-plan.md` item 3 | "the four `alert()` calls" | **Correct in its own scope** — F-09 is specifically about the `alert()` frequency defect, which applies only to the four `alert()` calls. This is not a conflict with the count of eight |

Counted from the source:

```
$ grep -n "alertcondition" BPI_Indicator.pine | sed -n '/brk_/p'     → 4   (3360-3363)
$ sed -n '3287,3290p;3329,3332p' BPI_Indicator.pine | grep -c alert  → 4   (3288, 3290, 3330, 3332)
```

**Eight Breakers alert emitters. All eight depend on the look-ahead-affected request. Only the four `alert()` calls carry the separate frequency defect (F-09).** The two counts describe different things; the executive summary conflated them.

Both `executive-summary.md` lines have been corrected in this commit.

---

## 2. The two `request.security` calls — only one is affected

```pine
// line 3231 — AFFECTED
[brk_phPs, brk_phBi, brk_plPs, brk_plBi] =
    request.security(syminfo.tickerid, brk_tfStructure, brk_Fmtf(),
                     lookahead = barmerge.lookahead_on)

// line 3252 — SAFE (offset [1] neutralizes lookahead_on)
[brk_htfClose, brk_htfTime] =
    request.security(syminfo.tickerid, brk_tfStructure, [close[1], time[1]],
                     lookahead = barmerge.lookahead_on)
```

### Correction to the earlier description of the mechanism

`executive-summary.md` and `known-issues.md` described line 3231 as requesting "current-bar HTF pivots". That is imprecise, and the imprecision overstates the leak. `brk_Fmtf()` returns `ta.pivothigh(brk_rlBars, brk_rlBars)`, which is already internally lagged by `brk_rlBars` HTF bars — the pivot is only confirmed `brk_rlBars` HTF bars after the pivot bar.

What `lookahead_on` with a zero-offset expression actually does is deliver the **final value of the containing HTF bar to every chart bar inside it**, including chart bars that occur before that HTF bar closed. So the defect is:

> On historical bars, a pivot becomes visible to the chart up to **one full HTF bar earlier** than it could have been in real time.

Bounded, not unbounded — but still genuine look-ahead, still inflates how early BOS/MSS lines and alerts appear on history, and still means a backtest built on this logic would be optimistic. The severity stays **Critical**; only the wording of the mechanism changes. `known-issues.md` F-01 has been updated accordingly.

The leak only manifests when `brk_tfStructure` resolves above the chart timeframe. `brk_FtfLimit()` (line 3272) gates the *line color* on this, not the conditions or the alerts — so **the alerts fire even when the structure lines are suppressed as `color = na`.** That is an independent finding, recorded below as F-23.

---

## 3. Inventory

Shared facts for all eight: none is gated by `barstate.isconfirmed` (the only occurrences in the file are at lines 2347, 2435, 2442, 2450, 3455 — all in other engines), and all eight derive from `brk_pH` / `brk_pL`, which are populated exclusively from the affected line-3231 request.

### A. `alertcondition()` — lines 3360–3363

| # | Line | Condition var | Signal name | Set at | Depends on affected request | Can fire intrabar | `barstate.isconfirmed` | Frequency | Affected by look-ahead fix | Test |
|---|---|---|---|---|---|---|---|---|---|---|
| BRK-A1 | 3360 | `brk_bosBull` | `BOS Bull` | 3278, inside `if brk_breakHighCond` when `brk_bull` | **Yes** | **Yes — always.** In the BOS branch `brk_bull` is true, so `brk_highCond = high` (line 3254) — a wick break, regardless of `brk_mssMode` | No | User-chosen in the alert dialog | **Yes** — timing of first occurrence shifts later | T-05, T-25 |
| BRK-A2 | 3361 | `brk_bosBear` | `BOS Bear` | 3313, inside `if brk_breakLowCond` when not `brk_bull` | **Yes** | **Yes — always.** `brk_lowCond = low` (line 3303) whenever `brk_bull` is false | No | User-chosen | **Yes** | T-05, T-25 |
| BRK-A3 | 3362 | `brk_mssBull` | `MSS Bull` | 3283 | **Yes** | **Conditional.** `brk_mssMode = 'Body / Wick'` → uses `high`, fires intrabar. Default `'Body Only'` → uses `brk_htfClose`, which is fixed for the whole chart bar, so the value cannot flip mid-bar | No | User-chosen | **Yes** | T-05, T-25 |
| BRK-A4 | 3363 | `brk_mssBear` | `MSS Bear` | 3318 | **Yes** | **Conditional.** Same as BRK-A3 via `brk_lowCond` (line 3303) | No | User-chosen | **Yes** | T-05, T-25 |

### B. `alert()` — lines 3288, 3290, 3330, 3332

| # | Line | Guard | Message emitted | Depends on affected request | Can fire intrabar | `barstate.isconfirmed` | Frequency | Affected by look-ahead fix | Test |
|---|---|---|---|---|---|---|---|---|---|
| BRK-A5 | 3288 | `if brk_bosBullAlert and brk_bull` | `'Bull BOS'` (**hardcoded literal**) | **Yes** | **Yes — always** (wick-based, as BRK-A1) | No | **`alert.freq_once_per_bar` (implicit)** — F-09 | **Yes** | T-05, T-25 |
| BRK-A6 | 3290 | `else if brk_mssBullAlert and not brk_bull` | `'Bull Breaker'` (**hardcoded**) | **Yes** | **Conditional** — as BRK-A3 | No | `alert.freq_once_per_bar` — F-09 | **Yes** | T-05, T-25 |
| BRK-A7 | 3330 | `if brk_bosBearAlert and not brk_bull` | `'Bear BOS'` (**hardcoded**) | **Yes** | **Yes — always** | No | `alert.freq_once_per_bar` — F-09 | **Yes** | T-05, T-25 |
| BRK-A8 | 3332 | `else if brk_mssBearAlert and brk_bull` | `'Bear Breaker'` (**hardcoded**) | **Yes** | **Conditional** | No | `alert.freq_once_per_bar` — F-09 | **Yes** | T-05, T-25 |

All four `alert()` calls default **off** (`input.bool(false, …)` at lines 3196, 3198, 3201, 3203) and are grouped under the input heading `'Any alert() function call'`, which correctly tells the user which TradingView alert type to create.

---

## 4. Refinement of F-09

F-09 previously stated flatly that the four `alert()` calls "can fire on an unconfirmed bar". Precise version:

- **BRK-A5 and BRK-A7 (BOS)**: real premature-firing risk. BOS is always evaluated against the live `high`/`low`, so an intrabar wick past the pivot fires the alert on a bar that may close back inside.
- **BRK-A6 and BRK-A8 (MSS)**: under the default `'Body Only'` mode the condition is built from `brk_htfClose`, which is constant for the duration of the chart bar — the alert fires on an unconfirmed bar, but the value it fires on will not change, so there is no false-signal risk from the frequency setting alone. Under `'Body / Wick'` the risk is the same as BOS.

The fix (adding `alert.freq_once_per_bar_close`) is still correct for all four; the *severity* is concentrated in BRK-A5/A7 and in `'Body / Wick'` mode.

---

## 5. New findings from this pass

| ID | Severity | Finding | Lines |
|---|---|---|---|
| F-23 | Medium | `brk_FtfLimit()` gates only the structure line's **color** (`color = brk_tfL0 and brk_linCon ? brk_linCol : na`). When the chart timeframe is above `brk_tfStructure`, the lines are invisible but **all eight alerts still fire**, from logic the author considered invalid enough to hide. | 3272, 3284, 3326 |
| F-24 | Low | The four `brk_*Name` string inputs (`brk_bosBullName`, `brk_bosBearName`, `brk_mssBullName`, `brk_mssBearName`, lines 3197–3204) are **never referenced**. The `alert()` calls pass hardcoded literals (`'Bull BOS'`, `'Bull Breaker'`, `'Bear BOS'`, `'Bear Breaker'`). Users can type a custom alert name that has no effect — and note the literals say "Breaker" while the inputs say "MSS". | 3197–3204 vs 3288–3332 |
| F-25 | Low | A line is created on every structure break regardless of `brk_showBos` / `brk_showMss`; those inputs only set the color to `na`. Invisible lines still consume slots against the 500-line cap. | 3284, 3326 |

---

## 6. Required manual tests

| Test | Purpose | Pass criteria |
|---|---|---|
| **T-05** (existing) | Look-ahead. 5m chart, `brk_tfStructure = 1H`. Compare the bar index of the first appearance of a given MSS line on the historical chart vs. in Bar Replay | Indices identical. Expected to FAIL before the fix; the size of the gap should be ≤ one HTF bar, which also validates the mechanism described in §2 |
| **T-25** (existing, expand) | Frequency. Watch BRK-A5/A7 during a bar that wicks past a pivot and closes back inside | Alert does not fire until bar close. Run separately in `'Body Only'` and `'Body / Wick'` to confirm the §4 split |
| **T-35** (new) | F-23. Set the chart timeframe *above* `brk_tfStructure`, enable all four `alert()` toggles and a "Any alert() function call" alert | Record whether alerts fire while no lines are visible |
| **T-36** (new) | F-24. Change `brk_bosBullName` to a distinctive string, trigger a Bull BOS | Record the delivered alert text. Expected: the hardcoded `Bull BOS`, not the custom name |
| **T-37** (new) | Regression after the look-ahead fix. Re-run T-01/T-05 and count BOS/MSS marks over a fixed 500-bar window before and after | Count and positions recorded. Expect fewer and/or later marks — document as intended, not as a regression |
