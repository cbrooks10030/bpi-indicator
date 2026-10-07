# Changelog

## Unreleased — indicator-audit
### Fixed
- **SMT no longer stops the script on symbols without an auto pair.** `runtime.error("No SMT auto pair detected…")` fired on every chart whose ticker is not in the pair registry (stocks, forex, most crypto) while `Show SMT` is on by default. SMT is now silently disabled for those symbols and the table shows `SMT: n/a`.
- No C2 setup is created on the very first HTF period of a chart (there is no previous HTF candle yet, so extreme price/bar were `na`).
- Alerts tooltip referenced the upstream product name ("Fractal Model [Pro+]").

### Changed (behaviour-neutral)
- Declared `max_bars_back(open/high/low/close, 1000)` so the IC-CISD back-scans (up to 300 replay + 500 level-search bars) cannot exceed TradingView's auto-sized history buffer on a late-arriving realtime bar.
- `icFindSwingRange` clamps its scan start to the last 998 bars so a protected swing that confirms after a very long pending period cannot index past that buffer.
- SMT swing searches break out early once past the lookback / pair-distance window (arrays are bar-ordered). Same results, fewer iterations on pivot bars.

### Added
- `README.md`, `CHANGELOG.md`, `QA_REPORT.md`, `RELEASE_CHECKLIST.md`.

## Earlier (PR #10, summary)
- New base from the FM-ICCISD-MTF-HTF fractal model source.
- Added: HTF 2/3/4H/Daily candle blocks with shared offset; Key Levels (PDH/PDL, Midnight/8:30/6PM opens) with offset; Asia/London sessions; Opening Range Gap; GK FVG/OB module (capped); C2/C3/C4 label offsets; SMT tuple requests (4 → 2 `request.security` calls).
- Projections are kept only for live, non-invalidated C2 setups; defaults: History 10, Key Levels offset 9.
