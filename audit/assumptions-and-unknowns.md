# Assumptions and Unknowns

Everything this audit could not determine, and every assumption it rests on. Read this before citing any finding as settled.

---

## 1. Method limitations

- **This was a static source audit.** The indicator was not compiled, loaded, replayed, or run live as part of it. No TradingView session was used. Every finding is an inference from reading 4,580 lines of Pine.
- There is **no offline Pine compiler**. Nothing here has been checked by a compiler, including the line references — they are from the audited commit and will drift if the file changes.
- No profiling, no timing measurement, no object-count measurement.
- No test in `manual-tradingview-test-plan.md` was executed. Every row in `test-record-template.csv` reads `UNTESTED`.

## 2. Assumptions made

| # | Assumption | Basis | If wrong |
|---|---|---|---|
| A-01 | The audited commit `10ac946` is what would ship | It is the branch head | Findings apply to a stale build |
| A-02 | `BPI_Indicator.pine` is the only shipped artifact; the five `*_module.pine` files are references | Stated by the user in the session brief | The module copies also need auditing and they have drifted |
| A-03 | The intended market is CME index futures (MNQ/ES) | All development and screenshots used MNQ1!; sessions hardcode ET | Session-related findings are understated for other markets |
| A-04 | `barmerge.lookahead_on` with a zero-offset expression leaks future data on historical bars | TradingView's documented behavior for `request.security` | F-01 would be downgraded — but this behavior is well established |
| A-05 | `barmerge.lookahead_on` with offsets ≥1 is safe | Documented, and the standard community pattern | R-08 would need revisiting |
| A-06 | `alert()` without a `freq` argument defaults to `alert.freq_once_per_bar` | Pine v6 reference | F-09 severity changes |
| A-07 | `time(timeframe.period, session)` matches only bars whose **open** falls inside the session window | Pine semantics | F-07 disappears |
| A-08 | The user intends to sell or distribute this | The audit specification asks about paid beta and public launch | F-02 becomes informational rather than blocking |

## 3. Open questions — cannot be answered from the source

1. **U-01 (blocks any non-repaint claim).** Does Pine roll back mutations to object fields held inside `var` arrays on realtime bars the same way it rolls back plain `var` reassignments? This decides whether `sp.taken := true` at line 4442 can permanently consume a BSL level from an intrabar wick. → test T-09.
2. **U-02.** What is the current compiled token count? The script hit the 100,256 ceiling during development and was trimmed by an unknown margin. Remaining headroom is unknown. → test T-00c.
3. **U-03.** Is the `alertFormat` JSON template input actually referenced by anything? No reference was found, but the search was textual. → grep trace + T-24.
4. **U-04.** Do the Midnight Open and 8:30 Open lines draw on 1H/4H charts? → test T-14.
5. **U-05.** Does the light theme produce legible output across all seven engines? Each engine has independent color inputs that were not cross-checked against `use_light_theme`. → test T-32.
6. **U-06.** Which labels still collide on the TradingView mobile app? Not testable from this environment at all. → test T-33.
7. **U-07.** What are the original licenses and publication types of the six third-party sources? Not determinable from the file; requires looking each one up on TradingView. → `security-and-ip-report.md` §2.
8. **U-08.** Does the HTF1 live candle, assembled from chart bars at lines 288–312, ever diverge from the exchange's HTF bar when the chart timeframe does not divide evenly into the HTF (e.g. a 7m chart)? → manual check.
9. **U-09.** Are there secrets anywhere in the git history? Only the working tree was inspected. → run a history secret scan before making the repo public.
10. **U-10.** Does the `tcisd_` engine repaint? Its internals were not traced line by line; it was assessed at the interface level only. → test T-11 / a focused follow-up audit.
11. **U-11.** Is a low-tier TradingView account sufficient to run this without calculation timeouts? → test T-15.

## 4. Areas deliberately not audited in depth

- The internals of the `hfvg_`, `gkf_`, `org_`, and `tcisd_` engines were reviewed at the interface and data-flow level (what they request, what they draw, what they alert on) rather than line by line. A defect internal to one of them would not have been caught.
- The five standalone `*_module.pine` files were inventoried, not audited.
- Pine syntax correctness was not verified (no compiler).
- Visual aesthetics were not assessed beyond structural issues (scaling, collisions, theme).

## 5. Standing statement

**Nothing in this audit evaluates whether the indicator is profitable, accurate, or predictive. No performance testing was conducted. No finding here should be quoted as support for any performance claim.**
