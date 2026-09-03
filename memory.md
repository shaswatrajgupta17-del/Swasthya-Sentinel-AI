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
| 2026-08-28 | Phase 7 uses n8n polling with `GET /alerts?status=open` and a configurable demo webhook | Keeps notification delivery optional while preserving the local app when n8n is unavailable |
| 2026-08-31 | Phase 7 poller docs: native n8n uses `http://127.0.0.1:8000/alerts?status=open`; Docker n8n uses `host.docker.internal`; `SENTINEL_NOTIFICATION_WEBHOOK_URL` is an n8n-process env only; FastAPI does not push and does not treat that env as “n8n connected” | Matches the exported poll workflow and honest `/notifications/status`. n8n remains optional at runtime and is not claimed to be running |
| 2026-08-28 | Phase 8 defers Azure; the project will use the local Vite + FastAPI + SQLite demo path | Azure hosting and LLM summarization add external configuration without improving this synthetic prototype; risk scores and factor explanations are already complete locally |
| 2026-08-28 | Phase 9 adds a repeatable local integration check at `scripts/verify_phase9.py` | Verifies seed/score/API invariants without adding a test dependency or external service |
| 2026-08-28 | Post-Phase-10 product upgrade keeps simulation overlays in backend memory and preserves SQLite history | Adds live-demo behavior without changing the frozen synthetic dataset or Phase 5 score ownership |
| 2026-08-28 | Phase 10 freezes the local demo at generator seed `20260828`, model `phase5-v1`, and High threshold `70` | Makes the SIH walkthrough repeatable without requiring a public URL or external infrastructure |

---

## Current status

**Phase 10 — Deployment and demonstration: completed.**
The risk engine (`ml/`) computes transparent 0–100 risk scores from SQLite synthetic health signals. Features are extracted at location $\times$ 7-day scoring window relative to a 30-day baseline. Anomaly ratios, multi-source corroboration (ASHA, OPD, Pharmacy, Environment), and DBSCAN spatial clustering ($eps=2.5\text{ km}, min\_samples=2$) are calculated and combined using documented weights. The planted synthetic cluster (Lakshmipur, Rampur, Devgaon) ranks High ($\approx 98.6/100$, Cluster `C1`) and generates 3 High severity alerts. Baseline locations remain Low ($0.7 - 2.1$). Scores and alerts are persisted to SQLite idempotently and served via FastAPI (`/risks`, `/alerts`, `/internal/run-risk`). The React frontend dashboard reflects live risk values, real map marker colors, and active alerts.
Phase 6 adds six deterministic, data-driven factor contributions per risk score (`risk_factors`), factual notes using the same baseline ratios and component scores, API exposure on both risk endpoints, and dashboard contribution bars sourced from API values. Rounded persisted factor contributions reconcile exactly to each score. High-risk and low-risk locations both return inspectable explanations while retaining cluster and model metadata.
Phase 7 documents an optional n8n **poll** path: ML risk engine writes High alerts to SQLite → FastAPI exposes `GET /alerts?status=open` → n8n may poll every five minutes → filter `score_0_100 >= 70` → POST a geographic notification to a demo webhook. Native Windows / local n8n uses `http://127.0.0.1:8000`; Docker n8n on the same host uses `http://host.docker.internal:8000`. `SENTINEL_NOTIFICATION_WEBHOOK_URL` belongs on the n8n process and must not be committed. FastAPI does not push alerts to n8n. `GET /notifications/status` does not report n8n as connected from a FastAPI env var. The dashboard and alert API work if n8n is stopped. The workflow export is inactive until imported and activated; this repo does not claim n8n is running.
Phase 8 selects Option A from `phases.md`: Azure is deferred and the local Vite + FastAPI + SQLite path remains the demo deployment. No Azure credentials, SDK, hosting configuration, or LLM summary endpoint is added. Existing risk factors remain the sole explanation source.
Phase 9 adds the repeatable local verification script, an explicit engine-not-run dashboard state, current run instructions, and end-to-end checks for seed, risk engine, API, map, alerts, factors, n8n compatibility, and non-diagnostic copy. Phase 10 has not started.
Phase 10 finalizes `DEMO_SCRIPT.md`, freezes the synthetic generator seed (`20260828`), risk model (`phase5-v1`), and High alert threshold (`70`), and selects the local Vite + FastAPI + SQLite deployment. A public URL is optional and deferred; no external infrastructure is required for the presentation.
The post-Phase-10 product upgrade adds a deterministic in-memory simulation layer, trend and insights endpoints, alert lifecycle transitions, location investigation, live status controls, and notification status visibility. Historical SQLite signals and the frozen risk engine remain unchanged.

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
- **Phase 7:** n8n polling workflow export (`n8n/high-risk-alert-poll.json`), enriched `GET /alerts?status=open` payload, native vs Docker poll URLs documented, demo webhook env on n8n only (no committed secrets), honest notification status (FastAPI does not push; poller not claimed running).
- **Phase 8:** Azure deferral decision documented; local demo remains the supported deployment path and no external service is required.
- **Phase 9:** Local integration verification script, engine-not-run state, updated run instructions, and verified seed → engine → API → frontend demo path.
- **Phase 10:** Finalized five-minute demo script, frozen seed/model/threshold, repeatable local preflight, and documented local deployment decision.
- **Product upgrade:** Deterministic synthetic simulation, backend-driven trend comparisons, investigation workflow, model insights, notification state, and expanded navigation. This is not a new numbered roadmap phase.

---

## Current task

Phase 10 and the product upgrade remain complete. Phase 7 polling is documented (export + URLs + env ownership + no FastAPI push). n8n is optional and is not claimed to be running in this environment.

---

## Known issues

- Alert channel for n8n (email vs Telegram vs Discord) remains optional; the exported demo webhook path is the frozen Phase 7 integration. n8n must still be imported and activated locally; this repository does not run n8n.
- Azure is deferred for this prototype; revisit only if hosting or factor summarization becomes necessary.

---

## Future decisions

- Phase 6: rule-based factor contributions selected; SHAP was not justified for the transparent weighted prototype
- Phase 7: cron-style n8n polling selected; alerts remain available in-app if n8n is down
- Phase 8: Azure deferred; local Vite + FastAPI + SQLite is the demo path

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
| Automation | n8n poller (`GET /alerts?status=open`) | Phase 7 design exported and documented; optional at runtime (not claimed running) |
| Cloud | Azure only if valuable | Deferred; local demo path selected in Phase 8 |
| Auth | None for MVP (local demo) | Chosen |
| i18n | English MVP | Chosen |

When any row changes, update this table and the date in "Important project decisions."
