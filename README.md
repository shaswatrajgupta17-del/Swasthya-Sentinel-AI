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

See `phases.md`. **P0** must ship for SIH. **P1** = n8n and Azure. Do not start Phase 1 until the team approves.

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

## How to run (later)

Not available yet. After Phase 1+:

1. **Frontend:** `cd frontend` → install dependencies → `npm run dev`  
2. **Backend:** Python virtualenv in `backend` → `uvicorn` as documented in that phase  
3. **Data:** seed from `data/synthetic/`  
4. **ML:** run the risk engine, then refresh the dashboard  
5. **n8n:** import `n8n/high-risk-alert-poll.json`, configure `SENTINEL_NOTIFICATION_WEBHOOK_URL`, and activate the workflow. It polls `/alerts?status=open`, filters scores at least 70, and posts location, score, and top factors. The app works when n8n is stopped.
6. **Azure:** deferred for this synthetic prototype; no Azure credentials or runtime are required

Exact commands will be added when those phases land.

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
