# Release Checklist — BPI Fractal Indicator

## 1. Code
- [ ] `BPI_Fractal_Indicator_Fast.pine` compiles in Pine Editor with no warnings that matter.
- [ ] All manual checks in `QA_REPORT.md` pass; note results per item.
- [ ] Decide the shipping title (drop "(Fast)" from `indicator(...)`) and keep one release file.
- [ ] Remove or archive `BPI_Fractal_Indicator.pine`, `BPI_Indicator.pine`, `*_module.pine` from what you publish (repo can stay private).

## 2. TradingView publishing
- [ ] Publish as **Invite-only** (protected source). Do not publish open-source.
- [ ] Description: what it draws, supported markets/timeframes, confirmed-bar vs intrabar behaviour (from README), alert setup. **No profit, win-rate or accuracy claims.**
- [ ] House-rules check: original description, no external links other than allowed vendor info, credit the open-source fractal-model base and the fadi ORG / GK FVG sources you ported.
- [ ] Add/remove users via the script's "Manage access" — plan how Whop purchases map to TradingView usernames (manual or via Whop's TradingView integration).

## 3. Whop / sales
- [ ] Product page copy mirrors the README limitations; add a risk disclaimer ("educational tool, not financial advice").
- [ ] Refund / access-revocation policy written.
- [ ] Onboarding doc: how to paste nothing (invite-only adds to chart), recommended defaults, alert setup steps.

## 4. Support
- [ ] Known-issues list (README "Known limitations") published.
- [ ] Versioning: tag the repo (`v1.0.0`) at the exact source you publish; update `CHANGELOG.md` for every TradingView re-publish.
