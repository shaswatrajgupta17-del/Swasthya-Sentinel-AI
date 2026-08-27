# Swasthya Sentinel AI

Privacy-conscious **college prototype** for **SIH2026-STATE-04**: early disease **cluster** detection from fragmented rural health signals.

**This is not a medical device.** It does not diagnose patients, confirm outbreaks, or replace public health professionals. Demo data is **synthetic**.

---

## Problem

Outbreak-like indicators can show up in ASHA reports, OPD symptom logs, pharmacy sales, and environmental data **before** a formal outbreak is declared. Those sources are usually disconnected, so district teams see fragments instead of a geographic pattern.

---

## Solution

Swasthya Sentinel AI combines **synthetic** village-level signals, scores **unusual clustered activity**, shows results on a **map**, explains **why** the score is high, and can **alert** a demo authority channel (n8n).

The **ML/risk engine** produces numbers. An LLM, if used later, may only **summarize those numbers** — it must not invent a diagnosis.

---

## Features (planned)

- District dashboard with React Leaflet map and risk bands (Low / Watch / High)
- Ranked locations and cluster membership
- Charts of ASHA / OPD / pharmacy / environment series (Recharts)
- FastAPI + SQLite persistence
- Risk scores, contributing factors, and alerts
- Optional n8n notifications and optional Azure hosting/explanation

**MVP vs later:** see `PRD.md`.

---

## Architecture (short)

```
Synthetic CSVs → SQLite → ML risk engine → FastAPI → React dashboard
                                      ↘ n8n alerts
                                      ↘ optional Azure LLM summary of factors
```

Details: `architecture.md`. UI: `design.md`. Build order: `phases.md`.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, JavaScript, Tailwind CSS |
| Maps / charts | React Leaflet, Recharts |
| Backend | Python, FastAPI |
| Database | SQLite |
| ML | Pandas, NumPy, Scikit-learn (XGBoost/SHAP if justified) |
| Automation | n8n |
| Cloud | Azure only where it adds value |

---

## How to run (later)

Not available yet. After Phase 1+:

1. **Frontend:** `cd frontend` → install dependencies → `npm run dev`
2. **Backend:** create a Python virtualenv in `backend` → install dependencies → `uvicorn` as documented in that phase
3. **Data:** seed from `data/synthetic/`
4. **ML:** run the risk engine, then refresh the dashboard
5. **n8n / Azure:** optional; the local demo should work without them

Exact commands will be added when those phases land. Do not expect `npm` or `pip` to work in Phase 0.

---

## Team contribution structure

| Path | Owner focus |
| --- | --- |
| `frontend/` | UI, map, charts |
| `backend/` | API, SQLite, seed |
| `ml/` | Scoring, clustering, factors |
| `data/synthetic/` | Demo CSVs and data dictionary |
| `n8n/` | Alert workflows |
| Root `*.md` | Product and architecture (everyone reads; update `memory.md` on decisions) |

**Working agreement:** follow `phases.md`. Do not mix a new library in without a note in `memory.md`. Keep modules separate. Use synthetic data only.

---

## Documents

| File | Contents |
| --- | --- |
| `PRD.md` | Problem, users, MVP, privacy, success |
| `architecture.md` | System design |
| `design.md` | UI/UX |
| `phases.md` | Phase 0–10 |
| `memory.md` | Decisions and status |
| `.cursor/rules/project-rules.mdc` | Rules for AI-assisted coding |
