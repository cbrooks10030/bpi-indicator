# P0 — Alert inventory after scaffolding removal (F-14)

Branch: `remediation/p0-safe-fixes`. Line numbers are from the post-change file on this branch.

## What was removed

```pine
alertcondition(alerts_on, "TTFM Rebuild v1.27 Fixed Running", "TTFM Rebuild v1.27 Fixed is active")
```

One line, deleted. It was development scaffolding: it fired on every bar whenever the `Alerts?` input was on and announced a build name ("TTFM Rebuild v1.27 Fixed") that does not correspond to anything a customer could see. Shipping it would have put a meaningless, always-true entry at the top of the alert dropdown.

`alerts_on` (`input.bool(true, "Alerts?", group=GRP_GEN)`) was **kept**. It was referenced only by the deleted line, so it is now an unused input. It was left in place deliberately: removing an input can disturb saved chart settings, and that is a user-visible side effect that does not belong in a P0 safety fix. It should be removed — or given a real purpose as a master alert gate — in a follow-up, and it may produce an "unused variable" compiler warning in the meantime.

No production signal depended on the removed condition: nothing read its result, and `alertcondition()` has no side effects on other series.

## Inventory after cleanup

19 `alertcondition()` emitters (was 20) and 7 `alert()` calls. No other alert was removed, renamed, or re-messaged.

### `alertcondition()` — user selects the frequency in the alert dialog

| Line | Title | Condition |
|---|---|---|
| 2612 | GK Bullish OB | `gk_any_bull_ob` |
| 2613 | GK Bearish OB | `gk_any_bear_ob` |
| 2614 | GK Bullish FVG | `gk_bull_fvg_raw` |
| 2615 | GK Bearish FVG | `gk_bear_fvg_raw` |
| 3159 | Unicorn Bullish | `uni_anyBull` |
| 3160 | Unicorn Bearish | `uni_anyBear` |
| 3385 | BOS Bull | `brk_bosBull` |
| 3386 | BOS Bear | `brk_bosBear` |
| 3387 | MSS Bull | `brk_mssBull` |
| 3388 | MSS Bear | `brk_mssBear` |
| 3570 | Bullish Breaker Block | `bb_bullFire` |
| 3571 | Bearish Breaker Block | `bb_bearFire` |
| 3572 | Bullish Unicorn (Breaker + FVG) | `bb_bullFire and bb_uni` |
| 3573 | Bearish Unicorn (Breaker + FVG) | `bb_bearFire and bb_uni` |
| 4015 | Bullish FVG | `gkf_bullFVG` |
| 4016 | Bearish FVG | `gkf_bearFVG` |
| 4017 | All FVG | `gkf_bullFVG or gkf_bearFVG` |
| 4229 | Bullish CISD Trigger | `tcisd_shortsSqueezed` |
| 4230 | Bearish CISD Trigger | `tcisd_longsRekt` |

### `alert()` — frequency set in code

| Line | Message | Frequency |
|---|---|---|
| 3312 | `Bull BOS` | `alert.freq_once_per_bar_close` (changed this branch) |
| 3314 | `Bull Breaker` | `alert.freq_once_per_bar_close` (changed this branch) |
| 3355 | `Bear BOS` | `alert.freq_once_per_bar_close` (changed this branch) |
| 3357 | `Bear Breaker` | `alert.freq_once_per_bar_close` (changed this branch) |
| 4464 | `<dir> Turtle Soup Sweep @ <price>` | `alert.freq_once_per_bar_close` (pre-existing) |
| 4537 | `<dir> MSS Confirmed @ <price>` | `alert.freq_once_per_bar_close` (pre-existing) |
| 4551 | `<dir> Turtle Soup Entry Confirmed @ <price>` | `alert.freq_once_per_bar_close` (pre-existing) |

Every `alert()` call in the script now carries an explicit close-confirmed frequency.

## Still open (not in this task's scope)

- The flagship C2/C3/C4 fractal model has **no alert emitter at all** (F-03).
- Two Turtle Soup alerts can fire for features that are off by default, so a user can receive a notification with nothing on the chart (F-10).
- The four `brk_*Name` inputs are declared and never referenced; `alert()` passes hardcoded literals, so a custom name silently does nothing (F-24).
- Breakers alerts fire even when `brk_FtfLimit()` has hidden their lines (F-23).
- Frequency for all 19 `alertcondition()` entries is the user's choice in the alert dialog and cannot be forced from the script. Setup documentation must state which to pick.

No alert in this inventory has been created or observed in TradingView. Nothing here confirms that any of them fire correctly.
