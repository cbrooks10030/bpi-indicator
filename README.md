# BPI Fractal Indicator

TradingView overlay indicator (Pine Script v6) implementing the ICT-style **fractal model**: a lower-timeframe (LTF) chart paired with a higher-timeframe (HTF) candle sequence, with Candle 2 (C2) sweep-and-reclaim setups, Candle 3/4 (C3/C4) expansion boxes, CISD / Early CISD / IC-CISD (protected swing) levels, standard-deviation projections, and a set of session/key-level tools.

Primary file: `BPI_Fractal_Indicator_Fast.pine` (release candidate).
`BPI_Fractal_Indicator.pine` is the previous working build kept for reference; `BPI_Indicator.pine` and `*_module.pine` are legacy/source modules and are not part of the release.

## Setup
1. TradingView → Pine Editor → paste the full contents of `BPI_Fractal_Indicator_Fast.pine`.
2. Save and **Add to chart**. Compilation happens in TradingView only; nothing in this repository is a compiler.
3. For a paid release, publish as an **invite-only** script (see `RELEASE_CHECKLIST.md`).

## Feature summary
| Group | What it does |
|---|---|
| General Settings | Bias filter, alert toggles, History (setups kept drawn, default 10), fractal pairing (Auto / preset / Custom LTF–HTF) |
| HTF Candles | Projected HTF 1 block (default 10 candles), HTF 2 (10) / HTF 3 (5) blocks, 4H and Daily candles, offset, colours, HTF open line, info/countdown, O/C time lines, L/H lines |
| Model Style | C2/C3/C4 labels with independent tick offsets, Candle 1 sweep line, Early CISD, Bullish/Bearish CISD, Protected Swings (IC-CISD dots), candle equilibrium, T-Spot boxes |
| Deviations | Standard-deviation projection labels for **live, non-invalidated** C2 setups only (removed on C2 breach, C4 invalidation, setup completion or replacement) |
| Liquidity Levels | BSL/SSL swing lines (off by default) |
| Key Levels | PDH/PDL, Midnight / 8:30 / 6PM opens, label offset (default 9 bars) |
| Sessions | Asia and London high/low with takeout freeze |
| SMT Divergence | Auto-paired symbol (ES/NQ/YM/RTY, micros, BTC/ETH, GC/SI/MGC/SIL) + optional second symbol |
| Table Info | Symbol / model / countdown / date / SMT pair |
| Opening Range Gap | 16:14→09:30 ET gap with C.E., quadrants, fills, labels |
| ICT FVG / OB (GK) | Capped FVG and Order Block boxes with mitigation |

## Supported markets / timeframes
- Designed for intraday futures (NQ/ES/YM/RTY and micros); SMT auto-pairing covers those plus BTC/ETH and GC/SI/MGC/SIL. Other symbols run with SMT disabled (table shows `SMT: n/a`).
- Fractal "Auto" mode works on 1, 2, 3, 5, 15, 30 min, 1H–12H, 1D–3W, 1M charts. On other chart timeframes use a preset or Custom pairing; the model draws nothing when the chart TF is above the model's LTF.
- Key Levels, Sessions and Opening Range Gap draw on intraday charts only. The 8:30 Open needs a bar that opens exactly at 08:30 ET (≤ 30 min charts).

## Confirmed-bar vs realtime behaviour (repainting)
- **C2 setups** are evaluated once per HTF period, on the first bar of the new period, from the *completed* previous HTF candle. They do not repaint after that bar.
- **CISD / Early CISD confirmation** uses the current bar's `close`; on the live bar this can toggle until the bar closes (a confirmation drawn intrabar can disappear if the bar closes back). **IC-CISD** steps only on confirmed bars.
- HTF data is fetched with `lookahead_on`. This is only used for the developing HTF candle and the previous HTF high/low; the C2 trigger reads values from the last bar of the previous period, so historical and realtime results match.
- Projection labels, FVG/OB boxes, Key Levels and Sessions are computed from closed data and do not repaint.
- Protected-swing dots turn grey when wicked through and are deleted 10 bars later by design.

## Alerts
The script uses `alert()` for C2, Early CISD and IC-CISD events and `alertcondition()` for Early CISD / CISD confirmed / GK FVG / GK OB.
- For `alert()` events: Create Alert → condition = this indicator → **"Any alert() function call"**. Make sure `Alerts?` (and the specific sub-toggle) is ON in settings. The alert text comes from the script (C2 Closure text is editable in settings).
- For named conditions: choose the condition by name (e.g. "Bullish CISD Confirmed").
- Alerts only fire for bars after the alert is created.

## Known limitations
- `History = 0` keeps every setup until TradingView's own drawing limits (500 lines/labels/boxes) start evicting the oldest objects.
- Timezone input is free text; an invalid IANA zone will stop the script with a TradingView error.
- Second SMT symbol is a user input; an unknown symbol produces a TradingView data error.
- The ORG module is fixed to New York time by design.
- Nothing in this repo verifies compilation — every change must be pasted into TradingView.
