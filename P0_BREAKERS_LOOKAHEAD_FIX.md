# P0 — Breakers look-ahead fix (F-01)

Baseline: `audit-baseline-20260916` = `10ac9466cb3d6753d952f1e6c087b3e2f4f5fb19`
Branch: `remediation/p0-safe-fixes`
Scope: `BPI_Indicator.pine`, the `brk_Fmtf()` helper only. No other Breakers logic was touched.

**Compiled, not behaviorally tested.** There is no offline Pine compiler; the only validation path is the TradingView Pine Editor, where this branch compiled on 2026-09-16 (MNQ1! 15m, warnings only — see test T-P00). Nothing in this document reports observed chart behavior — every behavioral statement below is a prediction derived from the source and from documented Pine semantics, and must be confirmed by the tests in `P0_BREAKERS_TEST_PLAN.md` before it is treated as fact.

---

## 1. Behavior before the change

```pine
brk_Fmtf() =>
    phPs = ta.pivothigh(brk_rlBars, brk_rlBars)
    plPs = ta.pivotlow(brk_rlBars, brk_rlBars)
    int phBi = na
    int plBi = na
    if not na(phPs)
        phBi := time[brk_rlBars]
    if not na(plPs)
        plBi := time[brk_rlBars]
    [phPs, phBi, plPs, plBi]

[brk_phPs, brk_phBi, brk_plPs, brk_plBi] =
    request.security(syminfo.tickerid, brk_tfStructure, brk_Fmtf(),
                     lookahead = barmerge.lookahead_on)
```

The pivot detector itself is not the problem. `ta.pivothigh(n, n)` needs `n` bars to the right of the candidate before it can return anything, so within the higher-timeframe (HTF) series the value is already lagged and confirmed.

The problem is the request. `barmerge.lookahead_on` with **no bar offset on the expression** makes `request.security()` return the HTF bar's *final* value to every chart bar that falls inside that HTF bar. On historical data the whole HTF series is already known, so a chart bar early inside HTF bar N receives the value that HTF bar N only finished with at its close.

Consequence: on history, a pivot — and therefore the BOS/MSS break that references it — can become visible up to **one full HTF bar earlier than it could ever have been known in real time**. The leak is bounded at one HTF bar; it is not unlimited future knowledge. It is still a look-ahead defect, and it is exactly the kind that makes a historical chart look better than live trading.

Two points of context that matter for judging severity:

- The second request in the engine (`[brk_htfClose, brk_htfTime]`) already used the correct `[close[1], time[1]]` offset pattern and was never affected.
- The defect is historical. In real time there is no future HTF data to leak; the pre-fix code simply read the developing HTF bar's current value.

## 2. The change

```pine
brk_Fmtf() =>
    // (comment block in source explains confirmation timing)
    phPs = ta.pivothigh(brk_rlBars, brk_rlBars)[1]
    plPs = ta.pivotlow(brk_rlBars, brk_rlBars)[1]
    int phBi = na
    int plBi = na
    if not na(phPs)
        phBi := time[brk_rlBars + 1]
    if not na(plPs)
        plBi := time[brk_rlBars + 1]
    [phPs, phBi, plPs, plBi]
```

Inside the HTF context the `[1]` reads the previous **completed** HTF bar, so `lookahead_on` can only deliver data that had already closed. The timestamps shift by the same one bar (`brk_rlBars + 1`) so a pivot's price and its recorded bar time still refer to the same HTF bar.

This deliberately mirrors the already-correct request at `[close[1], time[1]]` rather than inventing a second pattern. `lookahead_on` is kept: with a `[1]` offset it is the standard non-repainting HTF form, and it keeps history and real time resolving identically. Switching to `lookahead_off` instead would have fixed history but left the developing HTF bar visible in real time, which repaints.

The request line, the pivot/structure state machine, the line drawing, `brk_FtfLimit()`, and the alert conditions are unchanged.

## 3. Expected differences

**Historical charts.** BOS/MSS lines and marks appear **later** than before — by up to one HTF bar. Some marks may disappear: a break that previously registered against a prematurely-visible pivot may no longer find a pivot at that moment, and the state machine (`brk_bull`, `brk_pH`, `brk_pL`) can then take a different path, so the difference is not guaranteed to be a pure time shift. Counts of BOS/MSS marks over a long history may change in both directions.

To anyone used to the old output this will look like a regression. It is not. It is the difference between what the indicator could have known and what it was showing.

**Real time.** Pivots are now taken from the last closed HTF bar, so a pivot that forms inside the developing HTF bar is not acted on until that bar closes. Detection is therefore up to one HTF bar slower than before, and correspondingly more stable — the pre-fix code could act on a value that the developing HTF bar later changed.

**History vs Bar Replay.** This is the observable acceptance criterion: after the fix, the same symbol/timeframe should produce the same marks at the same bars whether loaded as history or stepped through Bar Replay. Before the fix they were expected to diverge. Test T-P01/T-P05.

## 4. Affected signals and alerts

All eight Breakers alert emitters are downstream of this request — four `alertcondition()` and four `alert()` calls:

| Emitter | Type | Signal |
|---|---|---|
| `brk_bosBull` | `alertcondition` | BOS Bull |
| `brk_bosBear` | `alertcondition` | BOS Bear |
| `brk_mssBull` | `alertcondition` | MSS Bull |
| `brk_mssBear` | `alertcondition` | MSS Bear |
| `brk_bosBullAlert and brk_bull` | `alert` | Bull BOS |
| `brk_mssBullAlert and not brk_bull` | `alert` | Bull Breaker |
| `brk_bosBearAlert and not brk_bull` | `alert` | Bear BOS |
| `brk_mssBearAlert and brk_bull` | `alert` | Bear Breaker |

Per-emitter detail is in `audit/breakers-alert-inventory.md`. No other engine consumes `brk_phPs` / `brk_plPs`, so the Fractal model, CISD, Turtle Soup, breaker blocks, GK FVG/OB, ATM and Unicorn are unaffected by this change.

Visuals affected: the BOS/MSS structure lines drawn at `brk_lin`, and nothing else.

## 5. Known risks

1. **Compilation verified, behavior not.** `ta.pivothigh(...)[1]` and `time[brk_rlBars + 1]` compile, and the branch stayed under Pine's token cap (test T-P00, 2026-09-16). Whether the historical BOS/MSS sequence is actually look-ahead-free is still unverified and requires T-P01 through T-P05.
2. **The state machine may reorder, not just shift.** See §3. Differences must be recorded from an actual before/after comparison (T-P05), not assumed.
3. **`brk_module.pine` still carries the defect.** That standalone copy has the identical unoffset request. It is not shipped and was deliberately left alone, as this task limits changes to what it names. It should either be fixed or marked as a historical copy in a follow-up.
4. **Unrelated finding F-23 is still open.** `brk_FtfLimit()` hides the structure lines by setting the line color to `na` but does not gate the alerts, so on a chart above the structure timeframe all eight alerts still fire with nothing drawn. Out of scope here; see `audit/remediation-plan.md` §3b.

No profitability or accuracy claim is made or implied by this fix. Correcting a look-ahead defect makes historical output honest; it says nothing about whether the strategy makes money.
