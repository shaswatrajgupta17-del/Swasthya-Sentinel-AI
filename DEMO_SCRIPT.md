# SIH Demo Script

**Product:** Swasthya Sentinel AI  
**Problem ID:** SIH2026-STATE-04  
**Length:** about 5 minutes  
**Data:** synthetic only — say this out loud.

## Demo preflight

Use the frozen local scenario before presenting:

1. `python backend/seed_database.py`
2. `python -m ml.run`
3. `python -m uvicorn backend.app.main:app --reload`
4. `npm run dev --prefix frontend`

Frozen inputs: generator seed `20260828`, 60 synthetic days, model version `phase5-v1`, and High alert threshold `70`.

Use this as a talk track. Screens must match `design.md` section 13. The Phase 7 n8n workflow is optional at runtime; use the in-app alert list if the notification receiver is not configured.

---

## 0:00 — Problem introduction

**Show:** title / dashboard with disclaimer already visible.

**Say:**

Rural outbreak clues show up in **different places** — ASHA reports, OPD symptom logs, pharmacy sales, environmental signals — **before** an outbreak is formally confirmed. Those sources are usually disconnected, so a district officer sees fragments, not a cluster.

We built a **privacy-conscious prototype** that combines **synthetic** village-level signals. We do **not** diagnose patients and this is **not** a production health system.

---

## 1:00 — Dashboard

**Show:** map-first command centre (KPIs, legend, ranked list).

**Say:**

This is the officer’s **command centre**. Colour is **unusual clustered activity**, not a confirmed outbreak. The banner states **synthetic data**.

---

## 2:00 — Cluster detection

**Show:** click the planted high-risk hotspot.

**Say / point to:**

- Map hotspot (neighbouring villages, not one random pin)
- **Risk score** (0–100) and category (Low / Watch / High)
- **Location details** (village or PHC, block)

---

## 3:00 — Explainability

**Show:** “Why this score” + trend chart.

**Say:**

The score is **calculated**, then explained. In this scenario you can see **ASHA counts up**, **OPD counts up**, and a **pharmacy spike** (for example ORS) moving **together**. Risk increased because **multiple signals changed together** — not because an AI named a disease.

If asked about the transparent score, explain the current engine weights: 40% anomaly, 30% multi-source corroboration, 20% spatial clustering, and 10% environmental context. The model version is `phase5-v1`.

---

## 4:00 — Alert workflow

**Show:** alert list and the n8n demo notification receiver log.

**Say:**

When the score crosses 70, the engine writes an **alert for authorities** — place, score, and top reasons. n8n polls open alerts every five minutes, filters the same threshold, and posts a demo notification. No personal health information. The in-app alert remains the fallback if n8n is down.

---

## 5:00 — Innovation

**Show:** disclaimer / About, or stay on the factor panel.

**Say:**

- **Privacy** — aggregates only; no patient identities  
- **Synthetic data** — we demonstrate the method without real records  
- **Early warning** — pattern and geography before formal confirmation  
- **Explainable AI** — numbers first; language only restates factors  

Happy to take questions on architecture (`architecture.md`) or limitations.

---

## If they ask “does this diagnose dengue/cholera?”

**Answer:** No. It flags **unusual multi-source geographic patterns**. Naming a disease for a person would be unsafe and is out of scope.
