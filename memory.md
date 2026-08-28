# Project memory — Swasthya Sentinel AI

Living log of decisions and status. Update this file when an important decision changes (see `.cursor/rules/project-rules.mdc`).

---

## Important project decisions

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-08-28 | College prototype for SIH2026-STATE-04 using **synthetic data only** | Real rural health data is sensitive and unavailable; demo must not impersonate production surveillance |
| 2026-08-28 | **ML/risk engine owns numeric scores**; optional LLM only explains computed factors | Prevents "ChatGPT diagnosed an outbreak"; keeps jury story honest |
| 2026-08-28 | Frontend: React + Vite + **JavaScript** + Tailwind + Leaflet + Recharts | Matches team skill plan; map-first UI |
| 2026-08-28 | Backend: FastAPI; DB: **SQLite** for v1 | Simple local demo; no cloud DB required |
| 2026-08-28 | ML: Pandas, NumPy, Scikit-learn (DBSCAN); XGBoost/SHAP **only if justified in Phase 6** | Transparent, deterministic scoring for Phase 5 |
| 2026-08-28 | Automation: **n8n** for alerts, not for scoring | Clear module boundaries |
| 2026-08-28 | **Azure optional** (hosting and/or explanation summary) | Core path is local Vite + FastAPI |
| 2026-08-28 | Risk grain: **location x time window**, not person-level | Privacy-conscious prototype |
| 2026-08-28 | Documentation-first; **no app code in Phase 0** | Avoid building the wrong system |
| 2026-08-28 | Disclaimer required on UI and `/health` | Legal/ethical clarity for SIH |
| 2026-08-28 | Phase 3 uses a fixed-seed, 60-day fictional dataset with a three-village planted cluster | Makes the SIH demo repeatable while preserving privacy |
| 2026-08-28 | Phase 4 uses FastAPI, SQLAlchemy, and SQLite with a reset-and-seed workflow | Keeps the local demo simple, repeatable, and ready for Phase 5 scores |
| 2026-08-28 | Phase 4 frontend integration: all pages (Dashboard, Alerts) self-fetch from FastAPI; no mock data used at runtime | Completes Phase 4 completion criterion: UI reads DB-backed data |
| 2026-08-28 | Phase 5 ML / Risk Engine: 0–100 deterministic score with 40% anomaly, 30% corroboration, 20% spatial DBSCAN, 10% environment | Transparent, repeatable statistical scoring; planted cluster ranked High ($\approx 98.6$); 3 High-Risk alerts generated |
| 2026-08-28 | Phase 6 uses deterministic weighted factor decomposition persisted in `risk_factors` | Keeps UI explanations tied to the Phase 5 score without adding SHAP or an LLM |

---

## Current status

**Phase 6 — Explainability: completed.**
The risk engine (`ml/`) computes transparent 0–100 risk scores from SQLite synthetic health signals. Features are extracted at location $\times$ 7-day scoring window relative to a 30-day baseline. Anomaly ratios, multi-source corroboration (ASHA, OPD, Pharmacy, Environment), and DBSCAN spatial clustering ($eps=2.5\text{ km}, min\_samples=2$) are calculated and combined using documented weights. The planted synthetic cluster (Lakshmipur, Rampur, Devgaon) ranks High ($\approx 98.6/100$, Cluster `C1`) and generates 3 High severity alerts. Baseline locations remain Low ($0.7 - 2.1$). Scores and alerts are persisted to SQLite idempotently and served via FastAPI (`/risks`, `/alerts`, `/internal/run-risk`). The React frontend dashboard reflects live risk values, real map marker colors, and active alerts.
Phase 6 adds six deterministic, data-driven factor contributions per risk score (`risk_factors`), factual notes using the same baseline ratios and component scores, API exposure on both risk endpoints, and dashboard contribution bars sourced from API values. Rounded persisted factor contributions reconcile exactly to each score. High-risk and low-risk locations both return inspectable explanations while retaining cluster and model metadata.

---

## Completed work

- `PRD.md` - problem, users, MVP, privacy, limitations
- `architecture.md` - system split, APIs, DB, ML, n8n, Azure role
- `design.md` - dashboard/map/risk/alert visual language
- `phases.md` - Phase 0-10 roadmap
- `README.md` - project overview
- `.cursor/rules/project-rules.mdc` - AI-assisted development rules
- Placeholder directories: `frontend/`, `backend/`, `ml/`, `data/synthetic/`, `n8n/`
- **Phase 1:** React + Vite + JavaScript + Tailwind frontend foundation, dashboard shell, reusable shared components, static mock data, Alerts and About pages.
- **Phase 2:** Interactive React Leaflet district map, 8 fictional village locations, selected-location cluster panel, synced risk list, and Recharts 14-day signal trends.
- **Phase 3:** Generated five aggregate-only CSVs for 12 fictional villages over 60 days, plus `scripts/generate_synthetic_data.py` and a data dictionary. Rampur, Lakshmipur, and Devgaon are the planted multi-signal cluster.
- **Phase 4:** FastAPI routers, SQLAlchemy SQLite models, repeatable database seeding from Phase 3 CSVs, placeholder `risk_scores`. Frontend API layer (`api.js`) with `getLocations`, `getRisks`, `getAlerts`, `getSignalsSummary`. Dashboard and Alerts pages fully wired to FastAPI - loading states, error states, and synthetic-data disclaimers on all screens.
- **Phase 5:** ML risk engine (`ml/features.py`, `ml/risk_engine.py`, `ml/run.py`), statistical anomaly calculation, DBSCAN spatial clustering, deterministic 0–100 scoring (`phase5-v1`), SQLite persistence, high-risk alert generation for scores $\ge 70$, backend API endpoints (`/risks`, `/alerts`, `/internal/run-risk`), and frontend dashboard integration.
- **Phase 6:** Deterministic six-factor decomposition from the Phase 5 components, persisted `risk_factors`, risk API factor responses, explainability panel with backend-driven contribution bars and notes, exact score/contribution reconciliation, and preserved cluster/model metadata.

---

## Current task

Phase 6 explainability is complete. Do not start Phase 7 until explicitly requested.

---

## Known issues

- Alert channel for n8n (email vs Telegram vs Discord) is **not frozen** - decide in Phase 7.
- Azure go/no-go is **not frozen** - decide in Phase 8.

---

## Future decisions

- Phase 6: rule-based factor contributions selected; SHAP was not justified for the transparent weighted prototype
- Phase 7: webhook vs cron poll
- Phase 8: skip Azure vs host vs LLM summary

---

## Technology decisions

| Layer | Choice | Status |
| --- | --- | --- |
| Frontend | React, Vite, JavaScript, Tailwind CSS | Phase 1 complete |
| Maps | React Leaflet | Phase 2 complete (mock coordinates only) |
| Charts | Recharts | Phase 2 complete (mock trends only) |
| Synthetic data | pandas generator, fixed random seed 20260828 | Phase 3 complete |
| Backend | Python FastAPI + SQLAlchemy | Phase 4 complete |
| Database | SQLite (backend/data/sentinel.db) | Phase 4 complete; seeded synthetic data |
| Frontend API integration | api.js + self-fetching pages | Phase 4 complete |
| ML | Pandas, NumPy, Scikit-learn (DBSCAN), version `phase5-v1` | Phase 5 complete |
| Automation | n8n | Chosen, not configured |
| Cloud | Azure only if valuable | Deferred to Phase 8 |
| Auth | None for MVP (local demo) | Chosen |
| i18n | English MVP | Chosen |

When any row changes, update this table and the date in "Important project decisions."
