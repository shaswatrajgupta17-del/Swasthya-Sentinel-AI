# Product Requirements Document — Swasthya Sentinel AI

**Problem ID:** SIH2026-STATE-04  
**Title:** Early Disease Cluster Detection from Fragmented Rural Health Signals  
**Product type:** College-level prototype with synthetic/demo data  
**Status:** Documentation complete. Application development has not started.

---

## 1. Problem statement

Outbreak indicators can appear across disconnected rural health sources before an outbreak is formally confirmed. ASHA worker reports, outpatient (OPD) symptom logs, pharmacy sales spikes, and environmental signals often sit in separate notebooks, spreadsheets, or systems. By the time a district office sees a single confirmed picture, a cluster may already have grown.

Public health teams need a way to **combine these fragmented signals**, spot **unusual patterns**, find **geographic clusters**, assign a **transparent risk score**, and **alert authorities** — without claiming to diagnose individual patients.

---

## 2. Problem analysis

### 2.1 What is broken today

| Gap | Why it matters |
| --- | --- |
| Signals live in silos | ASHA fever reports, PHC OPD counts, chemist sales, and rainfall/water data are rarely compared on the same map. |
| Confirmation is late | Formal outbreak declaration waits for lab confirmation and reporting chains. Early action needs earlier, imperfect signals. |
| Geography is missing | A rise in diarrhea in three neighbouring villages is more urgent than the same count spread across a district. |
| Reasons are opaque | A “high risk” flag without evidence is unused. Officers need *why*: which signals, which places, which days. |
| Privacy is fragile | Line-list patient data is sensitive. A prototype must work on **aggregates**, not identities. |

### 2.2 What “early” means in this prototype

Early does **not** mean predicting a named disease in a named person. It means:

- Detecting **unusual volume** of syndromic signals (fever, diarrhea, cough, rash, etc.) relative to a recent baseline.
- Detecting **spatial grouping** of those anomalies (village / PHC / block).
- Raising **corroboration** when two or more independent sources move together (e.g. ASHA + pharmacy ORS).

### 2.3 Constraints of a college prototype

- Data is **synthetic**. Villages, counts, and spikes are invented for demonstration.
- The system is a **decision-support mock**, not a clinical or government production system.
- An LLM must never invent a diagnosis. Risk numbers come from the ML/risk engine only.

---

## 3. Proposed solution

**Swasthya Sentinel AI** is a map-first dashboard plus a Python risk engine.

1. **Ingest** synthetic rural signals (ASHA, OPD, pharmacy, environment) into SQLite.
2. **Aggregate** by location and time window (e.g. village-day, PHC-week).
3. **Score risk** with statistical and ML methods (anomaly + spatial cluster + multi-source agreement).
4. **Explain** each score with feature contributions (rules and/or SHAP). Optionally, an LLM **summarizes those facts** in plain language.
5. **Display** clusters on a Leaflet map, trends on Recharts, and a ranked alert list.
6. **Notify** via n8n when a risk threshold is crossed (webhook → email/Telegram mock).

**One-line product promise:** *See unusual rural health patterns on a map, understand why the score is high, and get an alert — using demo data only.*

---

## 4. Target users

| User | Role in the prototype | What they need |
| --- | --- | --- |
| District / block public health officer | Primary user | Map of clusters, ranked risks, explanations, exportable alert summary |
| PHC / ASHA supervisor (demo persona) | Secondary | Recent signal volume in their block; not a full EHR |
| SIH jury / faculty | Evaluator | Clear problem–solution fit, working demo, honest limitations |
| Engineering team (students) | Builders | Simple modules, documented phases, synthetic data only |

Out of scope as users: patients, pharmacists as end-users, national-scale IDSP operators.

---

## 5. User journeys

### 5.1 Officer opens the dashboard (happy path)

1. Lands on a district overview with a **prototype / synthetic data** banner.
2. Sees a map coloured by village/PHC risk and a list of top clusters.
3. Clicks a cluster → side panel shows risk score, contributing signals, time trend, and a short explanation.
4. Filters by syndrome (e.g. diarrhea) or time range (last 7 / 14 / 30 days).
5. Marks an alert as “acknowledged” (demo state in SQLite).

### 5.2 Threshold alert

1. Risk engine writes a high-risk row and an alert record.
2. FastAPI exposes a webhook or n8n polls/receives the event.
3. n8n sends a demo notification (email or chat) with location, score, and top reasons — **no patient names**.

### 5.3 Evaluator walkthrough

1. README + dashboard disclaimer state this is not medical diagnosis.
2. Demo dataset includes at least one **planted cluster** so the map clearly lights up.
3. Explanation panel matches the numbers on the map (no LLM contradiction).

---

## 6. Core features

- Unified view of four signal types on one map and one timeline.
- Geographic clustering of unusual activity.
- Numerical risk score per location-time unit.
- Human-readable reasons tied to those numbers.
- Alert list for authority-style review.
- Persistent prototype data in SQLite.
- Explicit non-diagnosis, synthetic-data messaging on every major screen.

---

## 7. MVP features (what we will actually build)

Must ship for a credible SIH-style demo:

1. React dashboard (Vite + Tailwind) with district map (React Leaflet).
2. List of locations with risk score, syndrome tags, and last-updated time.
3. Detail panel: contributing signals, simple charts (Recharts).
4. FastAPI + SQLite: locations, aggregated signals, risk scores, alerts.
5. Synthetic CSV generators / seed data with a known outbreak-like cluster.
6. Risk engine: baseline + anomaly + simple spatial cluster + combined score (0–100).
7. Explainability: top contributing factors (rule-based first; SHAP if time allows).
8. Disclaimer UI and API metadata: `data_mode: synthetic`, `not_a_diagnosis: true`.
9. One n8n flow: high-risk alert → notification (Phase 7).
10. Optional Azure: hosting and/or explanation summarization only (Phase 8).

---

## 8. Future features (explicitly not MVP)

- Real ASHA / IDSP / eVIN integrations.
- Named-disease prediction (cholera vs typhoid vs dengue as a clinical label).
- Patient-level records or contact tracing.
- Production SSO, ABDM, or government NIC hosting.
- Multilingual voice reporting for ASHAs.
- Automated lab-confirmation workflows.
- National-scale streaming ingestion.

---

## 9. Privacy considerations

| Rule | Prototype behaviour |
| --- | --- |
| No personal health information | No names, phones, Aadhaar, household IDs, or GPS tracks of people |
| Aggregate by place | Village / PHC / block counts only |
| Synthetic identifiers | `loc_id`, `signal_id` — not real facilities unless publicly dummy-named |
| Alerts are geographic | “Block X, diarrhea signals elevated” — never a person |
| LLM inputs | Only aggregates and already-computed factor lists; never raw “patient text” with identifiers |
| Logging | Do not log payloads that look like clinical notes about individuals |

This is privacy-conscious **design**, not a HIPAA/DISHA compliance certification.

---

## 10. Success criteria

The prototype succeeds if:

- A planted synthetic cluster is visible on the map without reading the database.
- Risk scores change when corroborating sources are added or removed in demo data.
- Explanations list the same signals that drove the score.
- An evaluator can complete the officer journey in under five minutes.
- Every screen and the README state: **synthetic data, not a medical diagnosis**.
- Code stays split into frontend, backend, ML, and data — understandable by beginners.

---

## 11. Prototype limitations

- Not for real clinical or operational public-health decisions.
- Does not diagnose diseases or recommend treatment.
- Statistical “outbreak-like” patterns can be false positives; that is expected and should be explained in the demo.
- SQLite and local files are not a production architecture.
- Azure and n8n are optional layers; the core demo must work without them.
- Models trained on synthetic data will not generalise to real districts.
