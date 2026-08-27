# Architecture — Swasthya Sentinel AI

This document describes the **planned** system. No application code is implemented yet. Follow this layout when Phase 0+ development starts.

---

## 1. Overall architecture

Swasthya Sentinel AI is a **modular college prototype**. Data is generated, stored, scored, then shown and optionally alerted.

```
Synthetic Data Generator
          |
          ↓
Synthetic Health Data (CSV)
          |
          ↓
SQLite Database
          |
          ↓
FastAPI API Layer
          |
   ----------------------------
   |             |             |
   ↓             ↓             ↓
React UI     ML Risk       n8n Automation
Dashboard    Engine        Alerts
                |
                ↓
        Azure AI (Optional)
        Explanation Layer
```

**Who does what:**

- **React** is responsible only for visualization (map, charts, disclaimers). It does not calculate risk.
- **FastAPI** handles APIs and application logic (read/write SQLite, call the engine, create alerts).
- **SQLite** stores prototype data (locations, signals, scores, alerts).
- **ML engine** calculates numerical risk scores, clusters, and factor weights.
- **n8n** handles workflow automation (notify when a high-risk alert exists).
- **Azure AI is optional** and only explains **already calculated** factors. It must not set the score or diagnose.

**Hard split of intelligence:**

| Component | Allowed to do | Not allowed to do |
| --- | --- | --- |
| ML / risk engine | Compute numeric risk, clusters, factor weights | Name a patient’s disease |
| FastAPI | Serve scores, persist alerts, never invent risk | Bypass the engine with “AI guesses” |
| LLM (optional, later) | Rewrite **already computed** reasons in plain language | Independently diagnose or raise risk |
| Frontend | Visualize API data + disclaimers | Hide synthetic/demo nature |

All demo data is **synthetic**. The API should advertise `data_mode: "synthetic"` on health and summary endpoints.

---

## Architecture principles

The system prioritizes:

- **Explainability over complexity** — a weighted, inspectable score beats a black-box model the jury cannot question
- **Privacy over detailed personal information** — village/PHC aggregates only; no person-level records
- **Modular development** — frontend, API, database, ML, n8n, and Azure stay in separate folders and roles
- **Beginner-friendly maintainability** — JavaScript frontend, clear Python modules, documented weights
- **Clear separation between prediction and explanation** — the engine predicts (scores); UI/LLM only explain those scores
- **Synthetic data for demonstration** — no real rural healthcare extracts
- **Scalable future design** — SQLite and batch scoring now; the same API shape could later sit in front of a real warehouse

---

## Data generation layer

Real rural healthcare data is unavailable for this college project and would be sensitive if it were. The prototype therefore uses a **synthetic data generator** (scripts under `data/` / Phase 3) that writes CSV files, which are then loaded into SQLite.

The generator creates **aggregated** (not person-level) series:

- ASHA worker aggregated reports (syndrome counts by village and day)
- OPD symptom counts (facility-level)
- Pharmacy sales trends (e.g. ORS, antipyretics)
- Environmental indicators (e.g. rainfall, water-risk index)

It should include:

- **Normal baseline periods** — typical day-to-day variation
- **Abnormal outbreak-like periods** — a planted rise so the demo has a clear hotspot
- **Geographic clusters** — neighbouring villages moving together, not one isolated spike
- **Seasonal variations** — mild background change so baselines are not a flat line

**Purpose:** demonstrate early-warning *capability* (unusual clustered signals) without using private healthcare information.

---

## 2. Frontend architecture

**Stack:** React, Vite, JavaScript, Tailwind CSS, React Leaflet, Recharts.

**Planned app structure (when built):**

- `frontend/src/pages/` — Dashboard (map + list), Alert list, About/disclaimer
- `frontend/src/components/` — Map, RiskBadge, ClusterPanel, SignalChart, DisclaimerBanner
- `frontend/src/api/` — Fetch wrappers to FastAPI only (no ML logic in the browser)
- `frontend/src/data/` — Optional static GeoJSON for village points if the API is down in early UI phases

**Principles:**

- UI is a **client of the API**, not a second risk engine.
- Map is the primary navigation; tables support the map.
- JavaScript (not TypeScript) to keep the SIH team’s learning curve low.
- No patient-detail screens.

Early phases (1–2) may use **mock JSON** in the frontend until the backend exists. Mock files must be replaced, not left as a second source of truth, once FastAPI is live.

---

## 3. Backend architecture

**Stack:** Python, FastAPI, SQLite (SQLAlchemy or raw sqlite3 — pick one in Phase 4 and stick to it).

**Planned modules:**

- `backend/app/main.py` — FastAPI app, CORS for local Vite
- `backend/app/routers/` — `locations`, `signals`, `risks`, `alerts`, `health`
- `backend/app/models/` — ORM / row shapes
- `backend/app/services/` — aggregation helpers, alert creation (call ML; do not reimplement scoring here)
- `backend/app/db.py` — SQLite connection and schema init

**API style (indicative):**

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness + `synthetic` flag |
| GET | `/locations` | Villages/PHCs with lat/lng |
| GET | `/signals/summary` | Aggregated counts by place and time |
| GET | `/risks` | Latest risk scores for map colouring |
| GET | `/risks/{location_id}` | Score + contributing factors |
| GET | `/alerts` | Alert list |
| POST | `/alerts/{id}/ack` | Demo acknowledge |
| POST | `/internal/run-risk` | Dev-only: recompute scores from DB |

Do not expose endpoints that accept real patient identifiers.

---

## API layer

All user-facing reads go through REST. Nothing in the browser talks to SQLite or to `ml/` directly.

```
React Dashboard
        |
        |
     REST API
        |
        |
    FastAPI Services
        |
 -------------------------
 |           |            |
Database   ML Engine    n8n
```

**Rules:**

- The frontend **never** directly accesses the database.
- The frontend **never** contains ML logic (no scoring in React).
- The backend **only serves calculated results** (and triggers a recompute in a guarded dev endpoint). It does not invent a score in the router.
- The **ML engine remains independent** (`ml/`). FastAPI imports it; n8n and React do not.

Indicative routes stay in the table above. Early UI phases may use mock JSON until this layer exists; then mocks are removed.

---

## 4. Database architecture

**Engine:** SQLite file, e.g. `data/sentinel.db` (gitignored when it contains generated runs; seed scripts live in git).

**Suggested tables:**

| Table | Role |
| --- | --- |
| `locations` | `id`, name, type (village/phc/block), parent_id, lat, lng, district |
| `asha_signals` | location_id, date, syndrome, count (synthetic) |
| `opd_signals` | location_id, date, syndrome, count |
| `pharmacy_signals` | location_id, date, product_group (e.g. ORS, antipyretic), units |
| `env_signals` | location_id, date, metric (rainfall_mm, water_risk_index), value |
| `risk_scores` | location_id, window_start, window_end, score_0_100, cluster_id, model_version |
| `risk_factors` | risk_score_id, factor_name, contribution (numeric), note |
| `alerts` | risk_score_id, severity, status (open/acked), created_at |

**Grain:** One risk row per **location × time window** (default: village + last 7 days). No person-level tables.

---

## 5. ML / risk engine

**Stack:** Python, Pandas, NumPy, Scikit-learn. XGBoost and SHAP only if they improve a **measurable** demo (clearer planted-cluster ranking or clearer factor chart). Do not add them “for the resume.”

The prototype uses a **two-stage** approach.

### Stage 1 — Transparent risk scoring (required)

A documented weighted sum that a beginner can explain on stage:

```
Risk Score =
  40% symptom anomaly
+ 25% pharmacy signal increase
+ 20% environmental factors
+ 15% historical pattern
```

Weights can be tuned slightly for the planted cluster, but they must stay written down (`model_version` + this formula). Symptom anomaly covers ASHA + OPD unusualness vs baseline. “Historical pattern” is persistence (elevated for several days), not a secret model.

### Stage 2 — Machine learning improvement (optional)

Only if Stage 1 already works and there is time:

- Random Forest or XGBoost for ranking locations
- Isolation Forest for anomaly features

Stage 2 must still output a 0–100 score **and** factor contributions that match the UI. It must not replace Stage 1 with an unexplained number.

### Explainability

- Always: feature contribution list (which signals moved, by how much)
- SHAP: only if a tree model is used in Stage 2
- **Priority: explainability is more important than black-box accuracy.**

**Pipeline (batch, not streaming in MVP):**

1. Load aggregates from SQLite or CSV.
2. For each location and syndrome family, compute a **baseline** (e.g. median of prior weeks) and an **anomaly score** (z-score or Isolation Forest on a small feature vector).
3. **Spatial step:** DBSCAN or simple neighbour graph on lat/lng of anomalous points → `cluster_id`.
4. **Corroboration:** bonus when ASHA, OPD, and pharmacy (and optionally env) are jointly elevated.
5. **Combine** into `score_0_100` with documented weights (store `model_version`).
6. Write `risk_scores` and `risk_factors`.

Phase 6 writes the top 3–5 factors per score into `risk_factors`. The UI (and optional Azure summary) must use those rows, not a separate guess.

**Code home:** `ml/` — importable from FastAPI `services`, not copied into React.

---

## 6. n8n automation layer

n8n is **not** the risk engine.

**MVP flow (Phase 7):**

1. Trigger: webhook from FastAPI when a new alert is `severity = high`, **or** n8n cron calling `GET /alerts?status=open`.
2. Filter: score ≥ threshold (e.g. 70).
3. Action: send email / Telegram / Discord to a **demo** inbox with location name, score, top factors, link to dashboard.

Payloads must not include personal data (there should be none). Keep workflow JSON under `n8n/` only when Phase 7 starts — do not invent production credentials.

---

## 7. Azure role

Use Azure **only where it adds real demo value**. The core product must run locally (Vite + FastAPI + SQLite) without Azure.

**Legitimate later uses:**

- App Service / Static Web Apps to host the demo for SIH presentation
- Azure OpenAI (or equivalent) to **summarize `risk_factors`** into a paragraph — input is structured JSON from our engine, output is explanation text stored or streamed as `explanation_text`
- Optional Azure SQL **is not required**; SQLite stays the prototype database unless hosting forces a move

**Do not use Azure for:** training as a substitute for the local ML module, storing real health records, or “AI diagnosis” endpoints.

---

## 8. API / data flow

```
data/synthetic/*.csv
        │
        ▼
backend ingest / seed script → SQLite
        │
        ▼
ml/risk_engine.run() → risk_scores + risk_factors + alerts
        │
        ├──────────────► FastAPI GET /risks, /alerts
        │                      │
        │                      ▼
        │                 React dashboard
        │
        └──────────────► POST webhook → n8n → notification
                               │
                               ▼
                    optional Azure LLM summarize(risk_factors)
```

Frontend never trains models. n8n never recalculates scores.

---

## 9. Component communication

| From | To | Contract |
| --- | --- | --- |
| React | FastAPI | REST + JSON, CORS localhost |
| FastAPI | SQLite | SQL via one data-access module |
| FastAPI | `ml/` | Python function call in-process (same machine) for MVP |
| FastAPI | n8n | HTTP webhook, shared secret in env file (never commit secrets) |
| FastAPI | Azure OpenAI | Optional; timeout + fallback to template explanation |

---

## 10. Folder structure

```
Swasthya-Sentinel-AI/
├── PRD.md
├── architecture.md
├── design.md
├── phases.md
├── memory.md
├── DEMO_SCRIPT.md
├── README.md
├── .cursor/rules/project-rules.mdc
├── frontend/                 # React + Vite (created in Phase 1)
├── backend/                  # FastAPI (created in Phase 4)
├── ml/                       # Risk engine (created in Phase 5)
├── data/
│   └── synthetic/            # CSV seeds (Phase 3)
└── n8n/                      # Exported workflows (Phase 7)
```

Until a phase starts, directories may exist as empty placeholders only. Do not add `package.json`, Python apps, or models before the matching phase.

---

## 11. Security and privacy considerations

- Synthetic data only for this prototype.
- No PII columns; reject any future schema that stores names or phones.
- `.env` for secrets; never commit keys (n8n, Azure).
- CORS limited to the Vite origin in development.
- `/internal/run-risk` should be disabled or protected in any deployed demo.
- Disclaimer on UI and in API `GET /health`.
- LLM prompts (if any) include: “You do not diagnose. You only restate the provided factors.”
- Treat unexpected CSV uploads as untrusted; MVP can skip uploads and use repo seeds only.
