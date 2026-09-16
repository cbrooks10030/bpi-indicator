# Documentation Gaps

Current state: **the repository contains zero documentation.** No README, no user guide, no release notes, no changelog, no known-issues list, no risk disclosure, no support policy, no license file beyond the header comment.

For an internal tool that is tolerable. For anything distributed — free or paid — every item below is required.

---

## 1. Missing: product description

- What the indicator is, in two sentences.
- What the Fractal Model C2/C3/C4 sequence means, with a labeled screenshot.
- Which of the seven bundled engines do what, and that some concepts (FVG, MSS, Unicorn) are implemented **twice by different engines with different rules** — see `full-technical-audit.md` §3. Users will otherwise interpret two different marks as confirmation of each other.
- Which markets and timeframes it is designed for. The session logic is hardcoded to `America/New_York`; say so.

## 2. Missing: repaint and timing disclosure — **highest priority**

Non-negotiable for a paid product. Must state plainly:

- The HTF projection strip and the newest C2/C3/C4 setup are **provisional** and change until the higher-timeframe candle closes (R-02, R-03).
- The model layer is redrawn from scratch on every tick and keeps **no history** of past setups — scrolling back will not show where it previously fired (R-02).
- Pivot-based marks (HH/HL/LH/LL, SMT, breaker blocks, Unicorn, Turtle Soup swings) confirm **N bars after the fact** and are then drawn backwards onto the pivot bar. They do not repaint, but they were not available at the bar they appear on (R-04).
- The Breakers (BOS/MSS) engine currently has a **look-ahead defect** (R-01). Until fixed, the honest statement is that historical BOS/MSS marks appeared earlier than they could live. Do not ship documentation that omits this.
- Open question R-05 (Turtle Soup intrabar state) must be resolved before writing any "does not repaint" sentence.

## 3. Missing: input reference

396 inputs, none documented. At minimum:
- A table of every input: name, group, default, range, effect.
- Highlighted defaults the user is likely to want to change.
- **Warnings for unsafe combinations**: selecting an HTF below the chart timeframe (no guard exists); `history` up to 40 when only ~18 setups can be scanned; enabling all four extra strips plus all FVG engines at once against the 500-object caps.

## 4. Missing: alert documentation

- The list of 20 `alertcondition()`s and which engine each belongs to.
- The critical explanation that the Turtle Soup and Breakers events fire through **"Any alert() function call"**, while everything else requires a per-condition alert. Users will otherwise silently receive half the alerts they expect.
- That **Turtle Soup Sweep** and **Turtle Soup Entry Confirmed** alerts fire with no corresponding visual under default settings (sweep visuals default off; the entry arrow was removed).
- That the flagship C2/C3/C4 model has **no alert at all**.
- Whether `alertFormat` (the JSON webhook template input) is actually wired to anything — it appears not to be. Either document it or remove it.

## 5. Missing: limitations

- Hardcoded ET sessions; behavior on FX/crypto/non-US equities.
- No chart-type guard: on Heikin Ashi, Renko, Kagi or Range charts every signal is computed from synthetic prices.
- Mobile label crowding is mitigated but not solved; Pine cannot detect viewport width.
- The mintick-based vertical offsets (`syminfo.mintick * 20`) do not scale across instruments with very fine ticks — labels may sit on the candle.
- 2-minute session windows mean the Midnight Open and 8:30 Open lines probably do not draw on chart timeframes above 30m (F-07, unverified).

## 6. Missing: release notes and versioning

- No version number is exposed to the user anywhere (the only version-like string is the leftover `"TTFM Rebuild v1.27 Fixed Running"` alert, which should be deleted).
- Adopt a visible version (e.g. in the indicator title or a tooltip) and keep a `CHANGELOG.md`.
- Record the compiled token count per release so the Pine ceiling stays a tracked number.

## 7. Missing: risk disclosure

Required before any distribution:
- This is an analysis tool, not financial advice.
- No performance claim is made; past behavior does not predict future results.
- Trading involves risk of loss.
- The user is responsible for their own decisions.

## 8. Missing: support, refunds, privacy

- Support channel and expected response time.
- Refund policy (required by most payment processors; TradingView invite-only scripts are typically sold off-platform, which makes this the seller's obligation).
- Privacy note: the script itself collects and transmits nothing. If webhook instructions are supplied, say where payloads go.

## 9. Missing: attribution page

See `security-and-ip-report.md` §2. A complete list of the six third-party sources, authors, licenses and links is required both legally and by TradingView's House Rules.
