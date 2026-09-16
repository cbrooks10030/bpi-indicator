# Release Readiness Checklist

Commit `10ac946`. Legend: ☐ not met · ◐ partially met · ☑ met.

---

## Stage 1 — Internal testing (you and people you directly instruct)

| | Criterion |
|---|---|
| ☑ | Compiles in the TradingView Pine Editor (last verified during development, not re-verified in this audit) |
| ☑ | No unbounded array growth; drawing objects are tracked and deleted |
| ☑ | No hardcoded secrets or private endpoints |
| ☐ | Known issues are written down — **now met by this audit**, so ☑ as of this commit |
| ☐ | Someone other than the author has used it for a week |

**Verdict: READY for internal testing.**

---

## Stage 2 — Private alpha (a handful of trusted users, free)

| | Criterion |
|---|---|
| ☐ | Repaint behavior disclosed in writing to every tester (R-02, R-03, R-04, R-05) |
| ☐ | F-01 look-ahead either fixed or explicitly disclosed to testers |
| ☐ | A one-page description of what each engine does |
| ☐ | Alert mechanism split (`alertcondition` vs `alert()`) explained |
| ☐ | Leftover `TTFM Rebuild v1.27 Fixed Running` alert removed |
| ☐ | Phase 0 and Phase 1 of the manual test plan executed with evidence |

**Verdict: NOT READY.** Roughly one working session of documentation plus the F-01 fix.

---

## Stage 3 — Paid beta

The attachment's minimum criteria, assessed:

| | Criterion | Status |
|---|---|---|
| ☐ | No confirmed look-ahead bias | **FAILS** — F-01 |
| ☐ | Repainting behavior fully documented | FAILS — no documentation exists |
| ☐ | All alerts tested and matched to visuals | FAILS — nothing tested; F-10 is a known mismatch |
| ☐ | No unresolved critical or high-severity issues | FAILS — F-01 through F-06 |
| ☐ | Licensing and IP cleared | **FAILS** — F-02 |
| ☐ | Risk disclosure present | FAILS |
| ☐ | Support and refund policy defined | FAILS |
| ☐ | No unsupported performance claims | Met by absence (no claims exist) — must stay that way |
| ☐ | Versioning and release notes | FAILS |

**Verdict: NOT READY. Do not take money for this build.** Two of the failures (F-01, F-02) are not cosmetic: one is a correctness defect that inflates historical appearance, the other is a legal exposure.

---

## Stage 4 — Public launch

Everything in Stage 3, plus:

| | Criterion |
|---|---|
| ☐ | Phases 0–6 of the manual test plan executed with evidence |
| ☐ | Verified on at least 4 symbol classes and 5 timeframes |
| ☐ | Mobile rendering verified on a real device |
| ☐ | Performance verified on a low-tier TradingView account |
| ☐ | Duplicated engines (F-13) consolidated or clearly documented |
| ☐ | Input count reduced or a presets mechanism added (F-15) |
| ☐ | Full attribution page published |
| ☐ | Changelog and a user-visible version string |

**Verdict: NOT READY.**

---

## Shortest credible path to a paid beta

1. Fix F-01 (look-ahead) and F-09 (alert frequency). Small, localized edits in the `brk_` block.
2. Resolve F-02 (licensing). This is the long pole and it is not an engineering task — it is a decision about publishing open-source vs. reimplementing vs. obtaining permissions.
3. Run T-09 to settle F-11 so the repaint disclosure can be written accurately.
4. Write the documentation set from `documentation-gaps.md`.
5. Execute test plan Phases 0, 1, 2 and 5 and record evidence.
6. Remove F-14, fix F-10 (either restore a visual or remove the alert).

Steps 1, 3, 4, 5 and 6 are on the order of two to three working sessions. Step 2 is unbounded and depends on legal input, so start it first.

---

**This checklist evaluates code quality and release hygiene only. It says nothing about whether the indicator is profitable, and no part of this audit should be cited as evidence that it is.**
