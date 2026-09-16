# Remediation Plan

Ordered by (blocking severity × effort). Estimates are in *working sessions* for a single engineer, not calendar time.

---

## P0 — Blocking, start immediately

### 1. Resolve third-party licensing (F-02)
**Not an engineering task.** Effort: unbounded, depends on external responses — start it first so it runs in parallel with everything else.

Steps:
1. Locate the original TradingView publication for each of: HTF Candles by Fadi, fadizeidan (breaker blocks), ICTProTools (BOS/MSS), Gowtham Kannakaje L. (ICT FVG), CISD by tncylyv, the TS-Model, and the supplied Fractal Model.
2. Record each one's license and publication type (open-source / protected / invite-only). Reusing protected or invite-only code is prohibited by TradingView's House Rules regardless of intent.
3. For each, pick one: comply (publish open-source with notices), obtain written permission, or reimplement from the concept rather than the code.
4. Have an attorney confirm the MPL-2.0 position before charging money.

### 2. Fix the look-ahead bias in the Breakers engine (F-01)
Effort: < 1 session. Line 3231 only — the second request at 3252 already uses the safe `[close[1], time[1]]` pattern.

Either request the pivot with `lookahead = barmerge.lookahead_off`, or keep `lookahead_on` and read the pivot from a confirmed offset, mirroring line 3252. Run T-05 before and after, and T-37 to record the change in mark count, so the difference is documented evidence rather than an assertion.

This fix moves **all eight** Breakers alert emitters, not four — see `breakers-alert-inventory.md` for the per-alert breakdown.

Note the behavioral consequence: BOS/MSS lines will appear **later** on historical charts after the fix. That is the point, but it will look like a regression to anyone who has grown used to the current output. Say so in the release notes.

### 3. Fix Breakers alert frequency (F-09)
Effort: minutes. Add `alert.freq_once_per_bar_close` to the four `alert()` calls at 3288, 3290, 3330, 3332, or gate them on `barstate.isconfirmed`. Verify with T-25 in both `'Body Only'` and `'Body / Wick'` modes. The two BOS calls (3288, 3330) are the ones with real premature-firing exposure; the MSS calls are only exposed in `'Body / Wick'`.

### 3b. Gate the Breakers alerts on `brk_tfL0` (F-23)
Effort: minutes. `brk_FtfLimit()` currently hides the structure lines by setting `color = na` but leaves all eight alerts firing. Add `brk_tfL0` to the alert guards, or drive the conditions themselves from it.

### 3c. Wire up or remove the Breakers alert-name inputs (F-24)
Effort: minutes. `brk_bosBullName`, `brk_bosBearName`, `brk_mssBullName`, `brk_mssBearName` are declared and never used; the `alert()` calls pass hardcoded literals. Either pass the inputs into `alert()` or delete the inputs — a settings field that silently does nothing is worse than no field. Verify with T-36.

### 4. Settle the Turtle Soup intrabar question (F-11)
Effort: 1 session, mostly waiting for a live market. Run T-09. If object-field mutation is not rolled back, gate the sweep detection on `barstate.isconfirmed` (the alerts are already close-gated, so only the drawing changes). Until this is answered, no "non-repainting" language may be published.

---

## P1 — Required before a paid beta

### 5. Write the documentation set (F-06)
Effort: 1–2 sessions. Deliverables listed in `documentation-gaps.md`. Priority order within this task:
1. Repaint and timing disclosure (R-02, R-03, R-04, R-05).
2. Alert reference, including the `alertcondition` vs `alert()` split and the two alerts with no visual.
3. Risk disclosure.
4. Input reference and unsafe combinations.
5. Attribution page (output of item 1).

### 6. Add an alert for the Fractal Model (F-03)
Effort: < 1 session. The flagship feature currently cannot notify anyone. Two viable conditions: "new C2 formed on the closed HTF candle" and "C3/C4 follow-through confirmed". Both must be gated on HTF bar close, not on `barstate.islast`, or the alert will fire every tick.

### 7. Resolve the alert/visual mismatches (F-10)
Effort: < 1 session. Turtle Soup Sweep and Turtle Soup Entry Confirmed fire with no visible mark under defaults. Either turn a minimal visual on by default, or make the alert unavailable when the visual is off, or document it loudly. Pick one; the current state will generate support tickets.

### 8. Remove development scaffolding (F-14)
Effort: minutes. Delete the `TTFM Rebuild v1.27 Fixed Running` alert condition.

### 9. Execute test plan Phases 0, 1, 2, 5
Effort: 1–2 sessions plus live-market waiting. Record evidence in `test-record-template.csv`.

---

## P2 — Before public launch

### 10. Widen or document the 2-minute session windows (F-07)
Effort: < 1 session after T-14 confirms. If the lines genuinely do not draw above 30m, either anchor them on a timestamp comparison rather than `input.session`, or state the supported timeframe range.

### 11. Guard against HTF below chart TF (F-16)
Effort: < 1 session. `brk_FtfLimit()` already implements the check for one engine; generalize it and either suppress the affected drawings or show a one-time warning label.

### 12. Reduce input surface / add presets (F-15)
Effort: 1–2 sessions. 396 inputs with no documentation is the biggest adoption barrier after price. A "Preset" dropdown (Minimal / Model only / Everything) that drives sensible visibility defaults would do most of the work without removing anything.

### 13. Consolidate or document duplicated engines (F-13)
Effort: 1 session to document, several to consolidate. Documenting is sufficient for launch; consolidating would also reclaim token budget (F-12), which is the only realistic way to make room for new features.

### 14. Fix the anti-overlap label handling (F-19)
Effort: minutes. Delete the merged-away label instead of blanking it; sort by price before merging so `PDL/SSL` ordering is deterministic.

### 15. Repo hygiene (F-20)
Effort: minutes. Re-sync `tcisd_module.pine` with the host or delete the module copies and rely on git history; remove the stray `package-lock.json`; add a `.gitignore` entry.

---

## P3 — Backlog

- F-17: cap `history` at the reachable maximum (18) or make the scan honor larger values.
- F-18: replace `syminfo.mintick * N` offsets with ATR-relative offsets everywhere, as already done in three places.
- F-21: wire up or remove `alertFormat`.
- F-22: add `syminfo.type` branching, or document ET-only session support.
- F-12: record the compiled token count at each release so remaining headroom is tracked.

---

## Sequencing

```
Session 1:  items 2, 3, 8, 14, 15   (small, safe, mechanical)   + kick off item 1
Session 2:  item 4 (T-09) + item 9 Phases 0-1
Session 3:  item 5 (documentation)
Session 4:  items 6, 7 + item 9 Phases 2, 5
Session 5+: P2 work, gated on item 1 concluding
```

Item 1 (licensing) gates *release*, not development. Everything else can proceed while it is resolved — but nothing should be sold until it is.
