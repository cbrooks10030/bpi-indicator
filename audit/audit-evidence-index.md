# Audit Evidence Index

Audit date: 2026-09-16 · Audited commit: `10ac9466cb3d6753d952f1e6c087b3e2f4f5fb19` · Branch: `devin/1787449162-fractal-model-integration` · Read-only baseline tag: `audit-baseline-20260916`

**No production file was modified.** Everything in `/audit` is new. `git status` before the audit showed a clean tree apart from an untracked `package-lock.json`.

---

## Deliverables

| File | Contents |
|---|---|
| `executive-summary.md` | Verdict, top 8 findings, scope limits |
| `full-technical-audit.md` | File inventory, version/compatibility, architecture, security requests, inputs, state, numerics, visuals, portability, alerts, positives |
| `repainting-and-lookahead-report.md` | R-01…R-09 with classification, mechanism, affected signals, safe alternatives, verification tests |
| `breakers-alert-inventory.md` / `.csv` | All 8 Breakers alert emitters, per-alert; reconciliation of the 4-vs-8 discrepancy; corrected look-ahead mechanism; F-23/F-24/F-25 |
| `signal-lifecycle-matrix.csv` | 28 signals × 16 lifecycle attributes |
| `alert-test-matrix.csv` | 28 alert entries × 14 scenarios (all `UNTESTED`) |
| `security-and-ip-report.md` | Secrets scan, third-party licensing, originality, privacy |
| `performance-claims-audit.md` | Trading-claim audit (none found, none permissible) + runtime performance |
| `documentation-gaps.md` | Nine categories of missing documentation |
| `manual-tradingview-test-plan.md` | 37 tests across 7 phases, none executed |
| `test-record-template.csv` | Evidence template, pre-populated with all 37 tests as `UNTESTED` |
| `known-issues.md` | F-01…F-25 with severity and source lines — the authoritative finding register |
| `release-readiness-checklist.md` | Four-stage readiness assessment |
| `remediation-plan.md` | P0–P3 ordered fixes with session-level effort estimates |
| `assumptions-and-unknowns.md` | Method limits, 8 assumptions, 11 open questions |
| `audit-evidence-index.md` | This file |

---

## Evidence basis for each finding class

| Finding class | Evidence type | Where it came from |
|---|---|---|
| Look-ahead (F-01) | Direct source quotation | `BPI_Indicator.pine` line 3231 (affected) vs 3252 (safe) |
| Repaint classifications | Source structure (`barstate.islast` scoping, array index arithmetic, `request.security` arguments) | Lines 288–324, 1204, 1268–1320, 4441–4455 |
| Alert inventory | Exhaustive grep of `alertcondition(` (20 hits) and `alert(` (6 hits) | Line numbers recorded in `alert-test-matrix.csv` |
| Breakers alert inventory | Line-by-line read of 3151–3363, plus greps for `barstate.isconfirmed` (5 hits, none in `brk_`) and for each `brk_*Name` input (declared, never referenced) | `breakers-alert-inventory.md` |
| Security-request inventory | Exhaustive grep of `request.security` (30 code occurrences) | Table in `full-technical-audit.md` §4 |
| Input count (396) | Grep of all `input.*(` constructors | — |
| Object/loop counts | Greps: 37 `label.new`, 48 `line.new`, 21 `box.new`, 72 `for`, 23 `while`, 132 `delete` | — |
| Licensing (F-02) | Attribution comments at lines 1–4, 3155, 3555, 3920, 3996–4001, 4209 | — |
| Secrets | Grep for URLs (2 hits, both mozilla.org), no keys/tokens/emails found | Working tree only; history not scanned |
| Documentation gaps | `git ls-files` — 7 files, none documentation | — |

## What is NOT evidence

- No screenshots were taken for this audit.
- No TradingView console output was captured for this audit.
- No alert log, Bar Replay recording, or timing measurement exists.
- The "compiles cleanly" state is carried over from earlier development work in this session's history; it was **not** re-verified as part of the audit and should be re-established via test T-00a.

## Reproducing the audit

```bash
cd /home/ubuntu/repos/bpi-indicator
git checkout audit-baseline-20260916
grep -n "request\.security" BPI_Indicator.pine
grep -n "alertcondition\|^\s*alert(" BPI_Indicator.pine
grep -c "input\." BPI_Indicator.pine
sed -n '3218,3260p' BPI_Indicator.pine   # F-01
sed -n '1204,1360p' BPI_Indicator.pine   # R-02 / R-03
sed -n '4432,4460p' BPI_Indicator.pine   # R-05
sed -n '3193,3206p;3231p;3252p;3287,3290p;3329,3332p;3360,3363p' BPI_Indicator.pine   # Breakers alerts
```

## Corrections log

| Date | Document | Correction |
|---|---|---|
| 2026-09-16 | `executive-summary.md` | Said "Two of the script's four `alertcondition()`s … and two `alert()` calls" and "Affects BOS/MSS lines and 4 alerts". Both wrong: the script has 20 `alertcondition()`s, and **all 8** Breakers emitters (4 + 4) are affected. Finding IDs in the summary table also did not match `known-issues.md`; realigned. |
| 2026-09-16 | `executive-summary.md`, `known-issues.md` F-01 | Described line 3231 as requesting "current-bar HTF pivots". Imprecise — `ta.pivothigh(n, n)` is internally lagged. Restated: `lookahead_on` with no bar offset delivers the containing HTF bar's final value to every chart bar inside it, so the leak is bounded at **one HTF bar**. Severity unchanged (Critical). |
| 2026-09-16 | `known-issues.md` F-09 | Refined: premature-firing risk is concentrated in the two BOS `alert()` calls; the MSS calls are only exposed in `'Body / Wick'` mode. |

## Profitability statement

This audit assessed code correctness, repaint behavior, alert integrity, licensing and release hygiene. **It did not assess, and provides no evidence regarding, trading profitability, accuracy, or expected return.**
