# P0 — Breakers alert timing (F-09)

Branch: `remediation/p0-safe-fixes`. Scope: the four Breakers `alert()` calls. Nothing else in the alert layer was changed.

**Not verified in TradingView.** No alert was created, armed, or observed for this change.

## Old behavior

```pine
if brk_bosBullAlert and brk_bull
    alert('Bull BOS')
else if brk_mssBullAlert and not brk_bull
    alert('Bull Breaker')
```

`alert()` with no frequency argument defaults to `alert.freq_once_per_bar`: it fires on the first tick of the bar on which the call executes. The BOS conditions compare live `high` / `low` against the pivot, so a wick that pokes through structure mid-candle satisfied the condition and sent the alert immediately — before the candle closed, and regardless of whether the break survived to the close.

That put the alert layer out of step with the intent of the rest of the engine, which is built around confirmed higher-timeframe structure, and out of step with what the user sees settle on the chart.

## New behavior

```pine
if brk_bosBullAlert and brk_bull
    alert('Bull BOS', alert.freq_once_per_bar_close)
```

All four calls (Bull BOS, Bull Breaker, Bear BOS, Bear Breaker) now pass `alert.freq_once_per_bar_close`, which fires only on the bar's closing tick.

This works because Pine rolls `var` state back to the last bar close at the start of every real-time tick: the block re-executes on the closing tick with the same inputs, so a break that is still valid at the close is still evaluated there and alerts once. A break that only existed on an intermediate tick no longer produces a notification.

One nuance worth stating plainly: for the two BOS calls the comparison uses the bar's `high` / `low`, which do not retrace within the bar. A wick that breaks structure and then reverses will therefore still satisfy the condition at the close and still alert — what the change removes is the *early* notification, not the wick sensitivity itself. Removing the wick sensitivity would mean changing detection logic, which is out of scope. Test T-P11 records the actual behavior.

## Why the change is required

An alert that fires on an unconfirmed break is a false signal in the most damaging place: it reaches the user as a notification, it cannot be taken back, and it arrives at a moment when it looks most actionable. It also makes alert history impossible to reconcile against the chart, so any support conversation about "the alert fired but I see nothing" is unanswerable.

## What did not change

- The four `alertcondition()` emitters (BOS Bull, BOS Bear, MSS Bull, MSS Bear). A script cannot set their frequency; the user picks it in the alert dialog. Setup instructions must tell customers to select **Once Per Bar Close**, and the documentation gap remains open until they do.
- Alert messages. They are still hardcoded literals, so the four `brk_*Name` inputs remain dead (F-24, out of scope here).
- Detection logic, line drawing, and the number of alert emitters. No alert was added or duplicated; the four calls remain in their original mutually-exclusive `if / else if` structure, so at most one fires per branch per bar.
- F-23 remains open: alerts still fire when `brk_FtfLimit()` has hidden the lines.

## How to test

`P0_BREAKERS_TEST_PLAN.md`, tests T-P09 through T-P15. These need a live market session; Bar Replay does not reproduce intrabar ticks and cannot validate alert frequency.

Expected behavior during an open candle: the chart may show the BOS/MSS line as soon as the break is detected, but **no notification is delivered until that candle closes**. Visual and alert therefore no longer agree instant-for-instant during the open candle — the line can lead the alert by up to one bar. That is the intended trade-off: the alert is the thing being promised to the user, so it is the thing that has to be confirmed.
