# BPI Indicator — Executive Summary (Production Readiness Audit)

- Audited commit: `10ac9466cb3d6753d952f1e6c087b3e2f4f5fb19` (branch `devin/1787449162-fractal-model-integration`)
- Baseline tag created before audit: `audit-baseline-20260916`
- Audit type: **static source audit only**. No production file was modified. No indicator behavior was executed, measured, or backtested as part of this audit.
- Files audited: `BPI_Indicator.pine` (4,580 lines, Pine v6) and the five standalone module copies (`bblock_module.pine`, `brk_module.pine`, `gkfvg_module.pine`, `hfvg_module.pine`, `tcisd_module.pine`).

## Verdict

**Not ready for paid beta or public launch.** It is acceptable for continued internal testing only.

Three categories block monetization:

1. **Confirmed look-ahead bias** in the Breakers (BOS/MSS) engine — `request.security(..., brk_tfStructure, brk_Fmtf(), lookahead = barmerge.lookahead_on)` (line 3231) requests the higher-timeframe pivot expression with lookahead enabled and no bar offset, so the containing HTF bar's final value reaches every chart bar inside it. On historical bars a pivot therefore becomes visible up to **one full HTF bar earlier** than it could have in real time, making BOS/MSS marks appear early. **All eight** Breakers alert emitters — the four `alertcondition()`s (`BOS Bull`, `BOS Bear`, `MSS Bull`, `MSS Bear`, lines 3360–3363) and the four `alert()` calls (lines 3288, 3290, 3330, 3332) — sit directly on this logic. Exact per-alert breakdown in `breakers-alert-inventory.md`.
2. **Third-party licensing exposure.** The script incorporates at least four attributed third-party sources (ICTProTools, fadizeidan, Gowtham Kannakaje L., "CISD by tncylyv") plus an unattributed "TS-Model" port and the supplied "Fractal Model". Three of those carry MPL-2.0 notices. MPL-2.0 requires that recipients of the executable form can obtain the source of the covered files — which is in tension with publishing a protected/invite-only, paid TradingView script. This needs a legal decision before any money changes hands. (Not legal advice.)
3. **No documentation of any kind.** There is no README, no user guide, no release notes, no known-issues list, no risk disclosure. Every input default, every signal's meaning, and every repaint characteristic is currently undocumented.

## Highest-severity findings

| # | Severity | Finding |
|---|---|---|
| F-01 | Critical | Look-ahead bias on HTF pivots in the Breakers engine (line 3231). Affects BOS/MSS lines and **all 8** Breakers alert emitters (4 `alertcondition()` + 4 `alert()`). |
| F-02 | Critical | Licensing/IP: MPL-2.0 covered code embedded in a script intended for paid distribution; one port has no license attribution at all. |
| F-03 / F-04 | High | The flagship Fractal Model (C2/C3/C4) is drawn only inside `if barstate.islast` — it has **no historical record and no alerts at all**. Users cannot verify past signals on the chart, and cannot be notified of new ones. |
| F-05 | High | C3/C4 evaluation can read HTF index 0 (the still-open HTF candle), so C3/C4 labels and their valid/fail coloring change until the HTF bar closes. Expected behavior for a live model, but currently undisclosed. |
| F-06 | High | No documentation, no risk disclosure, no versioning, no support policy. |
| F-12 | Medium | 30 `request.security()` calls and 396 inputs in one script; token budget already hit Pine's 100,256-token ceiling once during development. Little headroom remains for new features. |
| F-07 | Medium | "8:30 Open" / "Midnight Open" use 2-minute session windows (`0830-0832`, `0000-0002`), so they silently do not render on chart timeframes whose bars do not begin at those times (e.g. 1H, 4H). Needs manual confirmation. |
| F-08 / F-14 | Medium | Alert coverage is inconsistent: some subsystems use `alertcondition()`, some use `alert()`, the model uses neither, and one `alertcondition` ("TTFM Rebuild v1.27 Fixed Running") is leftover development scaffolding visible in the user's alert dialog. |

Finding IDs are those of `known-issues.md`, which is the authoritative register.

Full detail in `full-technical-audit.md`, `repainting-and-lookahead-report.md`, `breakers-alert-inventory.md`, and `security-and-ip-report.md`.

## What was NOT done

No TradingView execution was performed for this audit: no compile run, no Bar Replay, no forward test, no alert firing test, no multi-symbol or multi-timeframe sweep. Every statement in this audit is derived from reading the source. Items requiring on-chart verification are listed in `manual-tradingview-test-plan.md` and are marked *unverified* throughout.

## Profitability statement

**This audit does not evaluate, establish, imply, or support any claim of profitability, accuracy, win rate, or expected return.** It is a code-quality and release-readiness review only. No performance testing of any kind was conducted.
