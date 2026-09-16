# P0 — Repository hygiene (F-20)

Branch: `remediation/p0-safe-fixes`. No file was deleted from version control and no history was rewritten.

## `tcisd_module.pine` — kept, labelled as historical

Decision: **keep in the repository, label it, do not synchronize.**

Reasoning. The host script's CISD section has diverged from this copy (F-20): the host was rewired so detection always runs while only the drawing is gated, and the section was later compressed to stay under Pine's token cap. Bringing the copy into line would not be a mechanical sync — it would mean rewriting its logic, which is exactly what this task forbids, and it would destroy the only record of what was originally ported from the third-party source.

So it stays, with a header that makes its status unambiguous:

```pine
// HISTORICAL REFERENCE COPY — NOT SHIPPED, NOT IN SYNC WITH BPI_Indicator.pine.
```

Comment-only change; no Pine statement in the file was touched.

The same reasoning has **not** been applied to `bblock_module.pine`, `gkfvg_module.pine`, `hfvg_module.pine` or `brk_module.pine`. Their sync status against the host was not re-verified on this branch, and labelling them without checking would be a guess. Note that `brk_module.pine` does carry the same unoffset `lookahead_on` request that was fixed in the host this branch (F-01), so it is at minimum stale with respect to a known critical defect. Auditing all four copies, and deciding whether the repository should keep module copies at all, is follow-up work.

## `package-lock.json` — removed

It was **never tracked by git** (absent from `git ls-files`, no commit touches it), so this is not a deletion from history — it was an untracked stray in the working tree. There is no JavaScript project here: the repository contains only `.pine` files, with no `package.json`, no `node_modules`, and no build or CI configuration that could consume a lockfile. It appears to have been created incidentally by tooling.

Removed from the working tree and added to `.gitignore` so it cannot be committed by accident.

## `.gitignore`

```diff
 crop_*.png
 fractal_source.txt
 *.rtf
+
+# Stray npm lockfile: this repository contains no JavaScript project.
+package-lock.json
+node_modules/
```

Existing entries untouched. `node_modules/` is included so the same class of stray cannot reappear as a directory.

## Not addressed here

The repository still has no `README`, no `LICENSE`, and no user documentation — the largest documentation gap in the audit (F-06), and directly relevant to the unresolved licensing question. Licensing is a human and legal workstream and is deliberately left unresolved; nothing in this branch grants, assumes, or implies any license for the embedded third-party code.
