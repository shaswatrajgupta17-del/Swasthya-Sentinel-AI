# Project memory — Swasthya Sentinel AI

Living log of decisions and status. Update this file when an important decision changes (see `.cursor/rules/project-rules.mdc`).

---

## Important project decisions

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-08-28 | College prototype for SIH2026-STATE-04 using **synthetic data only** | Real rural health data is sensitive and unavailable; demo must not impersonate production surveillance |
| 2026-08-28 | **ML/risk engine owns numeric scores**; optional LLM only explains computed factors | Prevents “ChatGPT diagnosed an outbreak”; keeps jury story honest |
| 2026-08-28 | Frontend: React + Vite + **JavaScript** + Tailwind + Leaflet + Recharts | Matches team skill plan; map-first UI |
| 2026-08-28 | Backend: FastAPI; DB: **SQLite** for v1 | Simple local demo; no cloud DB required |
| 2026-08-28 | ML: Pandas, NumPy, Scikit-learn; XGBoost/SHAP **only if justified** | Avoid complexity for a first prototype |
| 2026-08-28 | Automation: **n8n** for alerts, not for scoring | Clear module boundaries |
| 2026-08-28 | **Azure optional** (hosting and/or explanation summary) | Core path is local Vite + FastAPI |
| 2026-08-28 | Risk grain: **location × time window**, not person-level | Privacy-conscious prototype |
| 2026-08-28 | Documentation-first; **no app code in Phase 0** | Avoid building the wrong system |
| 2026-08-28 | Disclaimer required on UI and `/health` | Legal/ethical clarity for SIH |
| 2026-08-28 | Phase 3 uses a fixed-seed, 60-day fictional dataset with a three-village planted cluster | Makes the SIH demo repeatable while preserving privacy |
| 2026-08-28 | Phase 4 uses FastAPI, SQLAlchemy, and SQLite with a reset-and-seed workflow | Keeps the local demo simple, repeatable, and ready for Phase 5 scores |

---

## Current status

**Phase 4 - Backend and database: completed.**  
Phase 1–3 work is complete, and FastAPI now serves the seeded SQLite database with placeholder risk scores. No ML model, Azure integration, or n8n workflow has been created.

---

## Completed work

- `PRD.md` — problem, users, MVP, privacy, limitations
- `architecture.md` — system split, APIs, DB, ML, n8n, Azure role
- `design.md` — dashboard/map/risk/alert visual language
- `phases.md` — Phase 0–10 roadmap
- `README.md` — project overview
- `.cursor/rules/project-rules.mdc` — AI-assisted development rules
- Placeholder directories: `frontend/`, `backend/`, `ml/`, `data/synthetic/`, `n8n/`
- **Phase 1:** React + Vite + JavaScript + Tailwind frontend foundation, dashboard shell, reusable shared components, static mock data, Alerts and About pages.
- **Phase 2:** Interactive React Leaflet district map, 8 fictional village locations, selected-location cluster panel, synced risk list, and Recharts 14-day signal trends.
- **Phase 3:** Generated five aggregate-only CSVs for 12 fictional villages over 60 days, plus `scripts/generate_synthetic_data.py` and a data dictionary. Rampur, Lakshmipur, and Devgaon are the planted multi-signal cluster.
- **Phase 4:** Added FastAPI routers, SQLAlchemy SQLite models, repeatable database seeding from Phase 3 CSVs, placeholder `risk_scores`, and frontend API wrapper functions. Required endpoints were verified locally.

---

## Current task

Await approval for **Phase 5 - ML / risk engine**. Keep Phase 4 risk scores as `0` placeholders until the independent ML module calculates them.

---

## Known issues

- Empty module folders have no runtime yet (expected).
- Alert channel for n8n (email vs Telegram vs Discord) is **not frozen** — decide in Phase 7.
- Azure go/no-go is **not frozen** — decide in Phase 8.

---

## Future decisions

- Phase 4 follow-up: whether `/internal/run-risk` is CLI-only (decide when Phase 5 starts)
- Phase 5: z-score vs Isolation Forest vs both; DBSCAN vs k-distance neighbours
- Phase 6: rule-based factors vs SHAP
- Phase 7: webhook vs cron poll
- Phase 8: skip Azure vs host vs LLM summary
- Scoring weights documentation for the jury (must be written when Phase 5 lands)

---

## Technology decisions

| Layer | Choice | Status |
| --- | --- | --- |
| Frontend | React, Vite, JavaScript, Tailwind CSS | Phase 1 complete |
| Maps | React Leaflet | Phase 2 complete (mock coordinates only) |
| Charts | Recharts | Phase 2 complete (mock trends only) |
| Synthetic data | pandas generator, fixed random seed `20260828` | Phase 3 complete |
| Backend | Python FastAPI + SQLAlchemy | Phase 4 complete |
| Database | SQLite (`backend/data/sentinel.db`) | Phase 4 complete; seeded synthetic data |
| ML | Pandas, NumPy, Scikit-learn; optional XGBoost, SHAP | Chosen, not implemented |
| Automation | n8n | Chosen, not configured |
| Cloud | Azure only if valuable | Deferred to Phase 8 |
| Auth | None for MVP (local demo) | Chosen |
| i18n | English MVP | Chosen |

When any row changes, update this table and the date in “Important project decisions.”
