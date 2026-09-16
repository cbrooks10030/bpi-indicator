# Known Issues

Commit `10ac946`. All entries are from static inspection unless marked otherwise. Nothing here was reproduced on a chart during this audit.

Severity: **Critical** = blocks any distribution · **High** = blocks paid distribution · **Medium** = fix before public launch · **Low** = backlog.

| ID | Severity | Area | Issue | Source | Status |
|---|---|---|---|---|---|
| F-01 | Critical | Breakers (`brk_`) | `request.security(..., brk_Fmtf(), lookahead = barmerge.lookahead_on)` requests the HTF pivot expression with look-ahead on and **no bar offset**, so the containing HTF bar's final value reaches every chart bar inside it. A pivot becomes visible up to **one full HTF bar early** on history, making BOS/MSS marks and **all 8** Breakers alert emitters fire earlier than they could in real time. Only manifests when `brk_tfStructure` is above the chart timeframe — which the tooltip instructs users to do. The second request at 3252 uses `[close[1], time[1]]` and is safe. Per-alert detail: `breakers-alert-inventory.md`. | 3231 | Open |
| F-02 | Critical | Licensing | Six third-party sources embedded. Three carry MPL-2.0 (file-level copyleft, source-availability obligation); three have no license grant at all. Incompatible with a protected/paid TradingView publication as-is. | 4, 3155, 3555, 3920, 3996, 4209 | Open |
| F-03 | High | Fractal Model | The flagship C2/C3/C4 model has **no alert of any kind**. | — | Open |
| F-04 | High | Fractal Model | The entire model/strip layer lives inside `if barstate.islast` and is deleted and redrawn every tick. No historical record of past setups exists on the chart. By design, but undocumented and indistinguishable from repainting to a user. | 1204 | Open — needs disclosure |
| F-05 | High | Fractal Model | C3/C4 of the newest setup can resolve to HTF array index 0, the still-open HTF candle, so their labels, fail-state and colors change until that candle closes (up to 4h on a 15m chart). | 1268–1320 | Open — needs disclosure |
| F-06 | High | Documentation | No README, user guide, release notes, known-issues list, risk disclosure, support policy, or attribution page. | — | Open |
| F-07 | Medium | Sessions | Midnight Open (`0000-0002`) and 8:30 Open (`0830-0832`) use 2-minute session windows. A bar must *start* inside the window, so these lines probably never draw on 1H/4H charts. | 1784–1785 | Open — verify T-14 |
| F-08 | Medium | Alerts | Two mechanisms in one script: 20 `alertcondition()`s require per-condition alerts, while 6 `alert()` calls only fire through "Any alert() function call". Users get half their expected notifications with either setup. | throughout | Open |
| F-09 | Medium | Alerts | The four Breakers `alert()` calls omit `freq`, defaulting to `alert.freq_once_per_bar` — they can fire on an unconfirmed bar. Risk is concentrated in the two BOS calls (3288, 3330), which are always evaluated against the live `high`/`low`; the two MSS calls are only exposed in `'Body / Wick'` mode, since under the default `'Body Only'` their condition is built from `brk_htfClose`, which is constant within a chart bar. | 3288, 3290, 3330, 3332 | Open |
| F-10 | Medium | Alerts | `alert()` fires for "Turtle Soup Sweep" and "Turtle Soup Entry Confirmed" while, under default settings, **no visual exists** for either (sweep visuals default off; the entry arrow was removed at user request). | 4439, 4526 | Open |
| F-11 | Medium | Turtle Soup | Sweep detection mutates object state (`sp.taken := true`) and pushes setups from within an unconfirmed bar. Whether Pine's rollback fully reverts this cannot be determined statically. Blocks any "non-repainting" statement. | 4441–4455 | Open — verify T-09 |
| F-12 | Medium | Build budget | 30 of a maximum 40 `request.security()` calls; all four drawing-object caps at their maximum; compiled token count previously hit Pine's 100,256 ceiling. Effectively no room for new features. | header, throughout | Open — measure exact token count |
| F-13 | Medium | Duplicated concepts | FVG is implemented three times (`hfvg_`, `gkf_`, TS confluence), MSS twice (`brk_`, `ts_`), Unicorn twice (`uni_`, `bb_`), with different rules and colliding alert names. | §3 of the technical audit | Open |
| F-14 | Low | Hygiene | `alertcondition(alerts_on, "TTFM Rebuild v1.27 Fixed Running", ...)` — leftover development scaffolding exposed in the user's alert dropdown. | 1421 | Open |
| F-15 | Low | Inputs | 396 inputs, no presets, no documentation. Third-party author handles appear as UI group names (`CISD (tncylyv) — Visual`). | throughout | Open |
| F-16 | Low | Inputs | No guard prevents selecting an HTF below the chart timeframe for `custom_htf`, `htf2_tf`–`htf5_tf`, or the six `hfvg_htf_*` inputs. `brk_FtfLimit()` does this only for the Breakers. | 86, 106–112, 3619–3654 | Open |
| F-17 | Low | Inputs | `history` accepts up to 40 but the model scan is capped at `math.min(num - 1, 18)`. The advertised range is unreachable. | 84, 1263 | Open |
| F-18 | Low | Visuals | Vertical offsets built from `syminfo.mintick * N` do not scale across instruments. On fine-tick symbols (e.g. BTCUSD) labels may sit on top of the candle. | 1250 and similar | Open — verify T-30 |
| F-19 | Low | Visuals | The anti-overlap pass blanks the losing label (`set_text(li, "")`) instead of deleting it, so empty labels still consume slots against the 500-label cap. Merge order is code-order-dependent, so a pair may read `PDL/SSL` on one chart and `SSL/PDL` on another. | 4570–4580 | Open |
| F-20 | Low | Repo hygiene | `tcisd_module.pine` is out of sync with the host — it still contains the MTF trend table removed from the host in `b36cb7b`. An untracked `package-lock.json` sits in the working tree. | — | Open |
| F-21 | Low | Inputs | `alertFormat` (a JSON webhook template, line 18) does not appear to be referenced by any alert call. Either wire it up or remove it. | 18 | Open — verify |
| F-22 | Low | Portability | Sessions hardcode `America/New_York` with no `syminfo.type` branching. Correct for CME index futures; unverified elsewhere. | 1771–2981 | Open — verify T-30 |
| F-23 | Medium | Breakers (`brk_`) | `brk_FtfLimit()` gates only the structure line's **color** (`color = ... ? brk_linCol : na`). When the chart timeframe is above `brk_tfStructure`, the lines are invisible but all 8 alerts still fire — from logic the original author considered invalid enough to hide. | 3272, 3284, 3326 | Open — verify T-35 |
| F-24 | Low | Breakers (`brk_`) | The four `brk_*Name` alert-name inputs are never referenced; the `alert()` calls pass hardcoded literals. A user's custom alert name has no effect, and the literals say "Breaker" where the inputs say "MSS". | 3197–3204 vs 3288–3332 | Open — verify T-36 |
| F-25 | Low | Breakers (`brk_`) | A `line.new` is created on every structure break regardless of `brk_showBos` / `brk_showMss`; those inputs only set the color to `na`. Invisible lines still consume slots against the 500-line cap. | 3284, 3326 | Open |

## Not defects, but must be disclosed

- Pivot-based marks (HH/HL/LH/LL, SMT, breaker blocks, Unicorn, Turtle Soup swings) confirm N bars after their pivot and are then drawn backwards onto the pivot bar. Correct behavior; misleading appearance.
- HTF strip index 0 is always the open higher-timeframe candle and updates every tick.
- On Heikin Ashi / Renko / Range charts every signal is computed from synthetic prices.
