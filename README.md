# Swasthya Sentinel AI

Privacy-conscious **college prototype** for **SIH2026-STATE-04**.

**This is not a medical device.** It does not diagnose patients, confirm outbreaks, or replace public health professionals. Demo data is **synthetic**.

---

## Overview

A privacy-conscious **early warning** platform that detects unusual rural health patterns from **fragmented signals** (ASHA reports, OPD logs, pharmacy trends, environment), shows **geographic clusters**, and explains a **numeric risk score** — without using real patient records.

---

## Problem

**SIH2026-STATE-04 — Early Disease Cluster Detection from Fragmented Rural Health Signals.**

Outbreak indicators can appear across disconnected sources before an outbreak is formally confirmed. District teams often see pieces (a notebook here, a chemist spike there) instead of one map. Waiting for lab confirmation is too late for *early* action; acting on a black-box “AI diagnosis” is not acceptable either.

---

## Solution

Swasthya Sentinel AI (prototype):

1. **Data aggregation** — synthetic village-level ASHA, OPD, pharmacy, and environmental series in SQLite  
2. **Risk assessment** — transparent weighted score (optional ML later), not a clinical diagnosis  
3. **Geographic clustering** — neighbouring unusual locations grouped on a map  
4. **Explainable alerts** — factors + optional n8n notification; optional Azure text only restates those factors  

The **ML/risk engine** produces numbers. An LLM, if used, may only **summarize those numbers**.

---

## Key features

- **Risk map** — village/PHC markers, Low / Watch / High  
- **Cluster detection** — spatial grouping of unusual activity  
- **Explainable scoring** — 40% symptom anomaly, 25% pharmacy, 20% environment, 15% historical pattern (Stage 1)  
- **Alert workflow** — in-app alerts plus an optional n8n polling notification flow
- **Live synthetic surveillance** — deterministic scenario controls with start, pause, reset, and speed
- **Investigation workflow** — location detail, trends, baseline comparisons, factors, and alert lifecycle
- **Model insights** — transparent Phase 5 weighted anomaly output and current simulation state
- **Notification status** — honest n8n/webhook configuration state without fake delivery claims
- **Scenario simulation** — planted baseline vs outbreak-like periods in synthetic data  
- **Privacy-first architecture** — aggregates only; no person-level health information  

MVP vs later: `PRD.md`. Demo walkthrough: `DEMO_SCRIPT.md`.

---

## Technology stack

**Frontend:** React, Vite, JavaScript, Tailwind CSS, React Leaflet, Recharts  

**Backend:** Python FastAPI, SQLite  

**ML:** Python, Pandas, NumPy, Scikit-learn (XGBoost / Isolation Forest / SHAP only if justified)  

**Automation:** n8n (P1, exported workflow under `n8n/`)

**Cloud:** Azure deferred; the supported demo path is local Vite + FastAPI + SQLite

---

## Architecture overview

```
Synthetic Data Generator → CSV → SQLite → FastAPI
                                |      |      |
                                ↓      ↓      ↓
                         React UI   ML Risk  n8n alerts
                                    Engine
                                      ↓
                              Azure AI (optional explain)
```

React visualizes. FastAPI serves. SQLite stores. ML scores. n8n notifies. Azure never diagnoses.

Full design: `architecture.md`. UI: `design.md`.

---

## Prototype limitations

- **Synthetic data only** — not real ASHA/IDSP extracts  
- **Not medical diagnosis** — no named disease for a person, no treatment advice  
- **Not a production healthcare system** — SQLite, local demo, no government-scale security certification  

---

## Development roadmap

See `phases.md`. **P0** must ship for SIH. **P1** = n8n and Azure. Phases 1–10 are complete for this local prototype.

---

## Team development structure

| Team | Owns | Folder |
| --- | --- | --- |
| **Frontend** | Dashboard, map, charts, disclaimer | `frontend/` |
| **Backend** | FastAPI, SQLite, seed, REST | `backend/` |
| **ML** | Risk score, clusters, factors | `ml/` |
| **AI / cloud** | Optional Azure summary/hosting; prompt must not diagnose | Phase 8 only |
| **Automation** | n8n alert workflows | `n8n/` |
| **Everyone** | Docs; update `memory.md` when decisions change | Root `*.md` |

**Working agreement:** one phase at a time. No extra libraries without a note in `memory.md`. Synthetic data only.

---

## How to run locally

1. **Seed:** `python backend/seed_database.py`
2. **Score:** `python -m ml.run`
3. **Backend:** `python -m uvicorn backend.app.main:app --reload`
4. **Frontend:** `npm run dev --prefix frontend`
5. **Verify:** with FastAPI running, `python scripts/verify_phase9.py --api-url http://127.0.0.1:8000`
6. **n8n:** optionally import `n8n/high-risk-alert-poll.json`, configure `SENTINEL_NOTIFICATION_WEBHOOK_URL`, and activate the workflow. It polls `/alerts?status=open`, filters scores at least 70, and posts location, score, and top factors. The app works when n8n is stopped.
7. **Azure:** deferred for this synthetic prototype; no Azure credentials or runtime are required

## Product upgrade boundaries

- **Real implementation:** SQLite historical signals, deterministic Phase 5 risk engine, persisted Phase 6 factors, FastAPI APIs, Leaflet map, trend calculations, alert lifecycle, and n8n workflow export.
- **Synthetic simulation:** `/simulation` applies reproducible scenario multipliers in backend memory. It never rewrites historical CSV or SQLite signal rows.
- **Model behavior:** `phase5-v1` remains the numeric risk source. Scenario overlays are labeled simulation effects and do not claim external real-time surveillance or fabricated model metrics.
- **External infrastructure:** n8n delivery requires the separately configured `SENTINEL_NOTIFICATION_WEBHOOK_URL`. Azure is deferred.

## Simulation scenarios

On Dashboard, choose a scenario and start the controlled stream:

- `NORMAL` — small deterministic baseline fluctuation
- `FEVER CLUSTER` — nearby East Block signals rise together
- `RESPIRATORY CLUSTER` — nearby North Block signals rise together
- `PHARMACY SURGE` — medicine demand rises in the planted cluster
- `ENVIRONMENTAL EVENT` — environmental indicators rise in selected locations

The simulation clock is process-local and deterministic for a given tick. Reset returns to the baseline view. It is a demonstration stream, not an external data feed.

## Upgrade API surface

- `GET /locations/{location_id}`
- `GET /signals/trends/{location_id}?days=14`
- `GET /insights`
- `GET /simulation/status`
- `POST /simulation/start`, `/simulation/pause`, `/simulation/reset`
- `POST /alerts/{alert_id}/status`
- `GET /notifications/status`

Alerts are generated from the existing risk threshold and are not created on every simulation tick. The UI supports Investigate, Acknowledge, and Resolve transitions against the synthetic alert row.

---

## Documents

| File | Contents |
| --- | --- |
| `PRD.md` | Problem, users, MVP, privacy, success |
| `architecture.md` | System design |
| `design.md` | UI/UX |
| `phases.md` | Phase 0–10 and P0/P1 |
| `DEMO_SCRIPT.md` | 5-minute SIH talk track |
| `memory.md` | Decisions and status |
| `.cursor/rules/project-rules.mdc` | Rules for AI-assisted coding |
