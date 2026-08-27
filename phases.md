# Development phases — Swasthya Sentinel AI

Work **one phase at a time**. Do not start later phases until the current phase’s completion criteria are met, unless a dependency is explicitly listed as parallel.

This is a college prototype. Prefer a working slice over extra libraries.

---

## Development priority

| Level | Meaning |
| --- | --- |
| **P0** | Must complete for the SIH prototype. |
| **P1** | Important improvements. Ship if time allows; the local demo should still work without them. |
| **P2** | Optional enhancements (not in the default roadmap). |

| Phase | Priority |
| --- | --- |
| 0 Project foundation | **P0** |
| 1 UI/UX and design system | **P0** |
| 2 Dashboard and map | **P0** |
| 3 Synthetic health data | **P0** |
| 4 Backend and database | **P0** |
| 5 ML / risk engine | **P0** |
| 6 Explainability | **P0** |
| 7 n8n automation | **P1** |
| 8 Azure integration | **P1** |
| 9 Integration and testing | **P0** |
| 10 Deployment and demonstration | **P0** |

If time is short, skip P1 (n8n, Azure) and still complete a map + score + factors demo. Keep `DEMO_SCRIPT.md` in sync with what you actually built.

### Recommended file: `DEMO_SCRIPT.md`

Keep a **5-minute SIH presentation flow** at the repo root (`DEMO_SCRIPT.md`). Update it in Phase 10 so timings match the live UI. Outline:

- **0:00** — Problem: fragmented rural health signals  
- **1:00** — Dashboard as command centre  
- **2:00** — Cluster: map hotspot, risk score, location details  
- **3:00** — Explainability: ASHA, OPD, pharmacy moving together  
- **4:00** — Alert workflow (n8n if P1 is done; otherwise in-app alert list)  
- **5:00** — Innovation: privacy, synthetic data, early warning, explainable AI  

---

## Phase 0 — Project foundation

**Priority:** P0

**Goal:** Shared understanding, repo hygiene, and empty module folders. No application runtime yet.

**Tasks:**

- Keep PRD, architecture, design, phases, memory, README, `DEMO_SCRIPT.md`, and Cursor rules as the source of truth.
- Confirm folder placeholders: `frontend/`, `backend/`, `ml/`, `data/synthetic/`, `n8n/`.
- Add a `.gitignore` when the first code phase starts (node_modules, venv, `.env`, `*.db`).
- Do not install packages, train models, or provision Azure in this phase.

**Expected output:** Documentation + skeleton directories only.

**Dependencies:** None.

**Completion criteria:** All listed docs exist and match SIH2026-STATE-04. No Vite/FastAPI app yet.

---

## Phase 1 — UI/UX and design system

**Priority:** P0

**Goal:** Tailwind tokens and reusable presentational components with **static mock data**.

**Tasks:**

- Scaffold React + Vite + JavaScript + Tailwind in `frontend/` (first time packages are installed).
- Encode colour, type, and DisclaimerBanner from `design.md`.
- Build RiskBadge, KPI stat, simple layout shell (header + main + side list).
- No real API.

**Expected output:** Local Vite app showing the shell and badges; synthetic disclaimer visible.

**Dependencies:** Phase 0 docs.

**Completion criteria:** Design tokens used consistently; pages render without FastAPI.

---

## Phase 2 — Dashboard and map

**Priority:** P0

**Goal:** Map-first dashboard using mock GeoJSON/JSON.

**Tasks:**

- React Leaflet map fitted to a demo district.
- Circle markers coloured by mock risk; click opens ClusterPanel layout.
- Ranked list synced with map selection.
- Recharts placeholder with mock 14-day series.
- Responsive split: desktop map+list.

**Expected output:** Clickable demo map and list; still mock data.

**Dependencies:** Phase 1.

**Completion criteria:** An evaluator can click 3 locations and see mock scores + mock “why” bullets. Disclaimer still visible.

---

## Phase 3 — Synthetic health data

**Priority:** P0

**Goal:** A small, story-driven dataset with at least one planted cluster.

**Tasks:**

- Define village/PHC list with lat/lng for one fictional (or clearly dummy-named) block/district.
- Generate CSVs: ASHA, OPD, pharmacy, environment — village-day grain.
- Plant one multi-village diarrhea (or fever) rise plus pharmacy ORS spike; keep the rest near baseline.
- Document column meanings in `data/synthetic/README.md` (short).
- No personal fields.

**Expected output:** CSVs under `data/synthetic/` that later seed SQLite.

**Dependencies:** Architecture table grain. Can overlap late Phase 2 visually (map points should match location names).

**Completion criteria:** A human can spot the planted cluster in a spreadsheet. No PII columns.

---

## Phase 4 — Backend and database

**Priority:** P0

**Goal:** FastAPI + SQLite serving locations, signals, and placeholder risk rows.

**Tasks:**

- Scaffold FastAPI; CORS for Vite.
- Schema + seed script from CSVs.
- Implement `/health`, `/locations`, `/signals/summary`, `/risks`, `/alerts` (risks may be empty or rule-of-thumb until Phase 5).
- Frontend switches from mock JSON to API (feature flag or env base URL).

**Expected output:** Running API + `sentinel.db` (local); dashboard reads live locations.

**Dependencies:** Phase 3 CSVs. Phase 2 UI.

**Completion criteria:** Refreshing the UI shows DB-backed locations. Seed is repeatable.

---

## Phase 5 — ML / risk engine

**Priority:** P0

**Goal:** Numeric scores and cluster IDs written to SQLite.

**Tasks:**

- Implement `ml/` pipeline: Stage 1 transparent weights (see `architecture.md`), baseline, spatial grouping, 0–100 score.
- Store `model_version` and persist `risk_scores`.
- Wire `POST /internal/run-risk` (dev) or a CLI `python -m ml.run`.
- Map colours use engine output, not hand-painted mock scores.

**Expected output:** Planted cluster ranks at the top; baseline villages stay Low/Watch.

**Dependencies:** Phase 4 database.

**Completion criteria:** Re-running the engine on the same seed is stable enough for a demo. No LLM in this phase.

---

## Phase 6 — Explainability

**Priority:** P0

**Goal:** Every score has inspectable reasons.

**Tasks:**

- Persist `risk_factors` (name, contribution, short note).
- ClusterPanel shows top factors and contribution bars.
- Optional SHAP only if a tree model is justified and explanations stay consistent with the score.
- Copy rules: no disease names as diagnoses.

**Expected output:** UI “Why this score” matches DB factors.

**Dependencies:** Phase 5.

**Completion criteria:** Jury question “why is this red?” is answerable from the panel without opening Python.

---

## Phase 7 — n8n automation

**Priority:** P1

**Goal:** One alert path for high scores.

**Tasks:**

- Create alert rows when score ≥ threshold.
- Webhook or poll from n8n; send a demo message.
- Export workflow JSON into `n8n/` with placeholders, not real secrets.

**Expected output:** Triggering a high-risk seed produces a notification.

**Dependencies:** Phase 5–6 alerts. n8n running locally or in a student cloud.

**Completion criteria:** Documented trigger + screenshot/log of a demo message. Core app still works if n8n is down.

---

## Phase 8 — Azure integration

**Priority:** P1

**Goal:** Use Azure only if it helps hosting or **summarizing existing factors**.

**Tasks:**

- Decide: (A) skip Azure and demo locally, (B) host frontend/API, (C) add LLM summary of `risk_factors` with a fallback template.
- If LLM: prompt forbids diagnosis; store or display `explanation_text` separately from `score`.
- Never move PII (there is none) or replace the risk engine with Azure.

**Expected output:** Written decision in `memory.md`. If skipped, that is a valid completion.

**Dependencies:** Phase 6. Hosting optional for SIH if localhost demo is allowed.

**Completion criteria:** Either Azure is wired with a fallback, or memory records “Azure deferred; local demo is the path.”

---

## Phase 9 — Integration and testing

**Priority:** P0

**Goal:** End-to-end demo path is reliable.

**Tasks:**

- Seed → engine → API → map → alert list → (optional) n8n.
- Fix CORS, empty states, engine-not-run state.
- Basic backend tests for scoring invariants (planted cluster > quiet village).
- Frontend smoke: disclaimer, map load, detail panel (matches `design.md` demo flow).
- Confirm no diagnosis claims in UI copy.

**Expected output:** Short test notes or pytest files; `DEMO_SCRIPT.md` still accurate.

**Dependencies:** Phases 4–7 (8 if used).

**Completion criteria:** A teammate can follow README and complete the officer journey.

---

## Phase 10 — Deployment and demonstration

**Priority:** P0

**Goal:** Repeatable SIH presentation.

**Tasks:**

- Finalize `DEMO_SCRIPT.md` (problem, map, planted cluster, explanation, alert, limitations).
- Freeze a seed + `model_version`.
- Optional public URL (Azure/other) if required by the event.
- Record known issues in `memory.md`.

**Expected output:** 5-minute walkthrough that matches PRD success criteria.

**Dependencies:** Phase 9.

**Completion criteria:** Disclaimer spoken and shown. No claim of real-patient diagnosis. Repo is understandable.

---

## Phase dependency graph (summary)

```
0 → 1 → 2 → 4 → 5 → 6 → 9 → 10
         ↘ 3 ↗         ↘ 7 ↗
                     8 optional
```

Phase 3 should finish before Phase 4 seed. Phases 7–8 are P1 and may be skipped.
