# Sambid (FedNotify)

**Before exploring the codebase, read `Project_studycase.md` at the repo root.**
It contains the complete platform overview: what Sambid is, all features, plans/pricing,
the opportunity pipeline, every backend route/model/service, every frontend page, and a
quick index mapping common tasks to the exact files. Use it to navigate directly instead
of scanning source files.

Key rules (details in Project_studycase.md §10):
- Never enable backend schedulers locally — they burn the production SAM.gov quota.
- Plan prices are DB-driven; never hardcode them.
- Paywall/trial gating is server-side; don't leak locked data to trial/free users.
- Live site: sambid.co (VPS 141.136.44.84, pm2 "sambid"). sambid.com is NOT ours.

Keep Project_studycase.md updated whenever features, plans, or pages change.
