# P0 — Right-edge label merge fix (F-19)

Branch: `remediation/p0-safe-fixes`. Scope: the `lbl_all` anti-overlap pass plus the four Daily/PDH/PDL label sites. No other visual logic was touched, and no label text, color, size, style or position input changed.

**Not rendered.** No chart was loaded for this change; every behavioral statement is derived from the source.

## Old behavior

```pine
if lbl_antiov and barstate.islast and array.size(lbl_all) > 1
    for i = 1 to array.size(lbl_all) - 1
        label li = array.get(lbl_all, i)
        string ti = label.get_text(li)
        if ti != ""
            for j = 0 to i - 1
                label lj = array.get(lbl_all, j)
                if ti != "" and label.get_text(lj) != "" and math.abs(...) < lbl_tol
                    label.set_text(lj, label.get_text(lj) + "/" + ti)
                    label.set_text(li, "")
                    ti := ""
```

Three problems:

1. **Merge order was draw order.** The surviving label was whichever feature happened to be drawn first in the file. So the same two levels could read `PDL/SSL` on one chart and `SSL/PDL` on another depending only on which features were enabled, and the text sat at whichever label came first rather than at a predictable price.
2. **Merged-away labels were blanked, not removed.** `label.set_text(li, "")` leaves a live label object holding a label slot.
3. **Blanking was permanent for the persistent labels.** Daily High/Low and PDH/PDL are created once (`if na(dh_line)`) and afterwards only moved with `label.set_xy`. Nothing ever reset their text, so once such a label was merged away it stayed blank forever — even after price moved and the cluster separated. That is the worst of the three, because the level silently loses its name for the rest of the session.

## New behavior

The pass now sorts label indices by price (ties broken by draw order, so the ordering is total and deterministic), then walks them from the lowest upward. The lowest label of a cluster is the anchor and keeps the text; each subsequent label within `lbl_tol` of the anchor is appended to it. So a cluster always reads bottom-to-top and always resolves to the same string for the same set of levels — `PDL/SSL`, never `SSL/PDL`.

Merged-away labels are then handled by kind:

- Labels rebuilt from scratch on every last-bar pass (session H/L, Midnight, 8:30, BSL/SSL) are **deleted**, which frees the object slot.
- Labels created once and only moved afterwards (Daily High/Low, PDH/PDL) are **blanked**, not deleted. Deleting them would be a latent runtime error: nothing recreates them, and the next bar's `label.set_xy` would be operating on a deleted object. Their indices are collected in `lbl_keep` at their draw sites, which is the only reason the pass can tell the two kinds apart.

To fix problem 3, those four sites now reapply their text every bar:

```pine
label.set_text(dh_label, text_daily_visible ? "Daily High" : "")
```

This also means the `Show ... Text` toggle now takes effect on an already-created label instead of only on a fresh one.

`lbl_tol` (`ATR(14) × Overlap Sensitivity`) and the `Prevent Overlapping Right-Edge Text` toggle are unchanged.

## Ordering rule, stated for the record

> Within a cluster of right-edge labels whose prices are within `lbl_tol` of each other, the label at the lowest price keeps the merged text, and the text is composed in ascending price order, separated by `/`. Labels at exactly equal prices fall back to the order in which they were drawn.

Clustering is measured against the **anchor**, not against the previous label. A long chain of labels each within `lbl_tol` of its neighbour but spread over more than `lbl_tol` in total therefore splits into more than one cluster rather than collapsing into one label. That is intentional — collapsing it would produce a single label whose text spans a price range wide enough to be misleading.

## Cases to check (in `P0_MANUAL_TEST_RECORD.csv`, T-L01…T-L06)

| Count | Expectation |
|---|---|
| Zero labels | Pass skipped by the `array.size(lbl_all) > 1` guard; no error. Reachable by turning every right-edge feature off. |
| One label | Same guard; label renders normally with its own text. |
| Two labels, far apart | No merge, both texts intact. |
| Two labels, within tolerance | One label showing `LOWER/HIGHER`; the other gone (transient) or blank (Daily/PDH/PDL). |
| Many labels, mixed | Each cluster resolves independently; no label shows a stale merged string from a previous bar. |
| Equal or near-equal prices | Deterministic text: re-adding the indicator on the same chart must produce the identical string. |
| Cluster that separates | Both labels show their own text again — this is the F-19 regression check, and it needs a live or replayed session where price actually moves. |

## Known risks

1. **Compilation verified** (test T-P00, 2026-09-16, warnings only): `array.includes()`, the label getters and the nested selection sort compile, and the branch stayed under Pine's token cap. Runtime merge behavior (T-L01 to T-L08) is still untested.
2. **Cost is O(n²)** in the number of right-edge labels. `n` is bounded by the enabled features (roughly a dozen), the pass runs only under `barstate.islast`, and the previous implementation was also O(n²) — but this is worth knowing before anything else is added to `lbl_all`.
3. **Deletion leaves a dangling id** in the owning `var` (e.g. `midnight_open_label`). The next bar's code calls `label.delete` on it again, which Pine treats as a no-op, and then reassigns it. No path reads text or position from a deleted label. This is the part of the change most worth confirming on a real chart.
4. `label.delete` frees the slot only until the next last-bar pass recreates the label, so the saving is real but small. F-19's practical impact was always the ordering and the permanent blanking, not slot exhaustion.

No visual default changed, so an existing saved chart will look the same except where labels were previously colliding.
