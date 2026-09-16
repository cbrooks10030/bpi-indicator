# Security and IP Report

Commit `10ac946`. **This is not legal advice.** A qualified attorney should review sections 2 and 3 before any paid distribution.

---

## 1. Secrets and sensitive data

| Check | Result |
|---|---|
| Hardcoded API keys / tokens / passwords | **None found.** |
| Private or internal URLs | **None.** The only URLs in the source are `https://mozilla.org/MPL/2.0/` (twice, both license references). |
| Webhook endpoints | None hardcoded. `alertFormat` (line 18) is a user-editable JSON template with no destination. |
| Email addresses / personal identifiers | None in the source. Third-party author handles appear as attribution. |
| Sensitive or embarrassing comments | None found. Comments are technical. Note one leftover internal build string, `"TTFM Rebuild v1.27 Fixed Running"` (line 1421), which is exposed in the user's alert dropdown. |
| Credentials in git history | Not exhaustively scanned. A full history secret scan (e.g. `gitleaks`, `trufflehog`) is recommended before making the repository public. **Not performed.** |
| Files that should not be committed | `package-lock.json` is present in the working tree but untracked and matched by no ignore rule — it is unrelated to a Pine project and should be removed or ignored. |

`.gitignore` covers `crop_*.png`, `fractal_source.txt`, `*.rtf`. The ignoring of `fractal_source.txt` suggests third-party source material has been kept out of the repo deliberately; that material's license status is therefore untracked. See section 3.

---

## 2. Third-party code and licensing — **CRITICAL**

The shipped file incorporates code from at least six external sources:

| Source | Attribution in file | Stated license | Lines |
|---|---|---|---|
| HTF Candles by Fadi | line 4, "Based on HTF Candles by Fadi" | not stated at line 4 | host engine |
| fadizeidan | line 3555 | **MPL-2.0**, explicitly | `bb_` breaker blocks |
| ICTProTools | line 3155 | **MPL-2.0**, explicitly | `brk_` BOS/MSS, "Ported verbatim" |
| Gowtham Kannakaje L. | line 3920 | **© only — no license stated** | `gkf_` ICT FVG |
| CISD by tncylyv | lines 3996–4001 | **no attribution line, no license** | `tcisd_` |
| "TS-Model source" | line 4209 | **no author, no license** | `ts_` Turtle Soup + BSL/SSL |
| Supplied "Fractal Model" | not attributed in file | unknown | C2/C3/C4 engine, projections, T-Spot |

The file's own header declares MPL-2.0 and `© mindyourbuisness` (lines 1–2).

### Why this blocks monetization

MPL-2.0 is a **file-level copyleft**. The relevant obligations for this situation:

1. Code in a file that contains MPL-covered source stays MPL-covered. Because everything here is one `.pine` file, the whole file is arguably Covered Software.
2. Anyone who receives the **Executable Form** must be able to obtain the **Source Code Form** of the covered parts, at no charge.
3. You may charge for the work, but you may not remove recipients' right to the source of the covered portions.

A TradingView script published as **protected** or **invite-only** hides the source. Distributing an MPL-covered derivative that way, especially for money, is very likely non-compliant. The realistic options:

- **Publish open-source** on TradingView (source visible), keeping all MPL notices. Compliant; gives up source secrecy.
- **Publish protected but make the source available** on request / via a repository link for the MPL-covered portions. Awkward but defensible.
- **Remove and reimplement** the MPL-covered engines (`brk_`, `bb_`) from scratch, and resolve the unlicensed ports (`gkf_`, `tcisd_`, `ts_`, Fractal Model) by obtaining written permission or reimplementing. Only route to a fully closed, paid product.

### Unlicensed ports are the bigger problem

Three engines (`tcisd_`, `ts_`, and the Fractal Model) carry **no license statement at all**, and one (`gkf_`) carries a copyright line with no license grant. A comment saying "ported verbatim" from a source with no license grant means there is no permission to redistribute — copyright default is *all rights reserved*. TradingView's House Rules additionally require attribution and permission for reusing other authors' open-source code, and reusing protected/invite-only code is prohibited outright.

**Action required before any beta, paid or free:**

1. Identify the original TradingView publication for each of the six sources.
2. Record its exact license and whether it was published open-source, protected, or invite-only.
3. For each: obtain written permission, comply with its license, or reimplement.
4. Add a complete attribution block at the top of the file listing every source, its author, its license, and a link.

Until that is done, treat publication as blocked regardless of code quality.

---

## 3. Originality of the remaining code

The genuinely original work in this repository appears to be the **integration layer**: the namespacing scheme, the dual-`request.security` anti-flash pattern, the multi-strip HTF projection layout, the unified grey/dotted right-edge label styling, and the slash-merge anti-overlap pass. That is real work, but it is a minority of the 4,580 lines. Any marketing that presents the indicator as original analysis should be reviewed against section 2.

---

## 4. Data handling / privacy

- The script makes no network calls other than TradingView's own `request.security()` (same-platform data).
- No user data is collected, stored, or transmitted by the script.
- `alertFormat` lets a user template a webhook payload; if the product ships webhook instructions, a privacy note about where alert payloads are sent is needed. The indicator itself sends nothing.
- No source or chart data was sent to any third-party service during this audit.

---

## 5. Recommendations (priority order)

1. **Resolve the licensing of all six third-party sources.** Blocking.
2. Remove the `"TTFM Rebuild v1.27 Fixed Running"` alert condition.
3. Add a complete attribution and license header.
4. Run a git-history secret scan before making the repo public.
5. Remove the stray untracked `package-lock.json`.
6. Rename user-facing input groups so third-party handles (`CISD (tncylyv) — Visual`) are not surfaced as UI labels — either proper attribution in documentation or neutral group names, depending on what the license requires.
