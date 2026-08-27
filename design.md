# Design — Swasthya Sentinel AI

Visual and interaction design for the public-health **surveillance dashboard** prototype. This is not an EHR and not a consumer health app.

---

## 1. UI/UX principles

1. **Map first.** Officers think in geography. The map is the home, not a widget at the bottom.
2. **Score + reason together.** Never show a red badge without the top contributing signals nearby.
3. **Honest prototype.** A persistent banner: synthetic data, not a diagnosis, not for real patients.
4. **Calm density.** Rural district overview: scannable, not a 40-widget analytics wall.
5. **One primary action per view.** On the dashboard: inspect a cluster. On alerts: acknowledge.
6. **Beginner-clear labels.** Prefer “ASHA fever reports (7 days)” over “syndromic_z_asha_t7”.
7. **No clinical chrome.** Avoid stethoscope-heavy illustration, prescription pads, or “Dr.” workflows.

---

## 2. Visual identity

**Name in UI:** Swasthya Sentinel AI  
**Tagline (small):** Early cluster signals for rural public health — demo  

**Mood:** Trustworthy government-adjacent dashboard: clean surfaces, clear geography, restrained colour. Slightly more “operations centre” than “startup SaaS gradient.”

**Metaphor:** A sentinel watches the district map; colour is **risk of unusual clustered signals**, not a confirmed outbreak stamp.

**Logo (when needed):** Simple shield or watchtower + map pin. Do not use a red cross as a logo (confusion with medical emergency / ICRC).

---

## 3. Color system

Use Tailwind semantic tokens (define in Phase 1). Suggested palette:

| Token | Hex (guide) | Use |
| --- | --- | --- |
| `sentinel-ink` | `#0F2A3A` | Primary text, header |
| `sentinel-teal` | `#0E7C7B` | Brand, links, selected map outline |
| `sentinel-mist` | `#F4F7F7` | Page background |
| `sentinel-card` | `#FFFFFF` | Panels |
| `risk-low` | `#2A9D8F` | Score 0–39 |
| `risk-watch` | `#E9C46A` | Score 40–69 |
| `risk-high` | `#E76F51` | Score 70–100 |
| `signal-asha` | `#3D5A80` | ASHA series |
| `signal-opd` | `#577590` | OPD series |
| `signal-pharm` | `#8A4FFF` (muted) or `#6D597A` | Pharmacy |
| `signal-env` | `#4A7C59` | Environment |

**Rules:**

- Risk colours are for **scores and map fills only**, not for decoration.
- Do not use red for ordinary buttons.
- Colour is never the only risk cue (see Accessibility).
- Disclaimer banner: teal/ink background, not alarm red.

---

## 4. Typography

- **UI sans:** System stack first (e.g. Tailwind `font-sans`) — Inter or Source Sans 3 if a webfont is added later with justification.
- **Numbers:** Tabular lining for scores and counts (`tabular-nums`).
- **Hierarchy:** Page title 20–24px; section 16px semibold; body 14px; meta 12px.
- **Hindi/English:** MVP can be English with optional Hindi labels on key terms (ASHA, PHC, Block) in Phase 1 if time allows — not a full i18n system.

---

## 5. Layout

**Shell:**

- Top bar: product name, district selector (demo: one district), disclaimer chip, “Synthetic data” badge.
- Left or right **context panel** (not a huge left nav): filters (syndrome, days, min score).
- **Main:** full-height map.
- **Dock:** bottom or side list of top 8 locations by risk (click syncs map popup).

**Spacing:** 16px card padding, 8px gap in lists, 24px page margins on desktop.

**Avoid:** hamburger-only navigation that hides the map on desktop.

---

## 6. Dashboard design

**Above the fold:**

1. Disclaimer banner (dismissible for the session, always available in footer/About).
2. KPI row (max four): locations watched, open alerts, highest score, last engine run time.
3. Map + ranked list.

**Cluster / location panel (on pin click):**

- Location name, type (village/PHC), block.
- Large risk score + band (Low / Watch / High).
- “Why this score” — bullet list of factors with relative bars.
- Mini time-series (7–14 days) of ASHA vs OPD vs pharmacy (Recharts).
- Cluster membership: neighbouring locations in the same `cluster_id`.
- Footer note: *Statistical unusualness, not a confirmed outbreak.*

**Empty / loading:** Skeleton map + “Loading synthetic district…” — never a blank white page.

---

## 7. Map design (React Leaflet)

- Base: a readable light map (Carto Positron or similar) so choropleth/circles stand out.
- **Points:** village centroids as circles; radius by signal volume or fixed + colour by risk.
- **Clusters:** optional convex hull or polyline for `cluster_id` (keep it light; do not paint the whole district red).
- Popup: name, score, top 1 factor, “View details”.
- Legend: Low / Watch / High + “Synthetic demo”.
- Default view: fitted to demo district bounds, not world zoom.
- No real-time GPS of workers.

If polygon GeoJSON is too heavy for MVP, **coloured circle markers** are enough.

---

## 8. Risk indicators

| Band | Score | Label | Visual |
| --- | --- | --- | --- |
| Low | 0–39 | Low | Teal fill, “Low” text |
| Watch | 40–69 | Watch | Amber fill, “Watch” text |
| High | 70–100 | High | Coral fill, “High” text |

Always show the **number** (e.g. 82) next to the label. Include `model_version` in a tooltip for evaluators.

Do **not** use words like “Cholera confirmed” or “Patient positive.”

---

## 9. Alert design

- List page or dashboard tab: time, location, score, top factor, status (Open / Acknowledged).
- High alerts: coral left border; still include reasons.
- Acknowledge is a **demo** control; no workflow engine beyond SQLite status.
- Notification copy (n8n): short, geographic, factor-based. Example: *Watch: Rampur PHC area — 7-day diarrhea signals and ORS sales above baseline (score 78). Demo data.*

---

## 10. Charts (Recharts)

- **Line or area:** counts over time, one series per source; shared x-axis (dates).
- **Bar:** factor contributions for one location (horizontal bars, labelled).
- **Do not:** 3D, pie charts for syndromes (hard to compare), dual-axis tricks that hide scale.
- Tooltips: date, source, count. Units on the axis.
- Colours match the signal tokens in section 3.

---

## 11. Responsive design

| Viewport | Behaviour |
| --- | --- |
| ≥ 1024px | Map + list side by side |
| 768–1023px | Map on top, list below, panel as bottom sheet |
| < 768px | Map full width; list in a tab; accept that SIH demo is primarily laptop |

Touch targets ≥ 44px on mobile. Do not hide the disclaimer on small screens.

---

## 12. Accessibility

- Contrast: body text on mist/card meets WCAG AA; risk coral/amber must be paired with text labels.
- Keyboard: location list and alert rows focusable; map popup closable with Escape.
- `aria-label` on risk badges: “Risk 82 out of 100, high”.
- Do not convey risk by colour alone.
- Reduced-motion: respect `prefers-reduced-motion` for chart animation (Phase 1–2 can skip fancy motion entirely).
- Language: plain English; expand acronyms on first view (ASHA, OPD, PHC).

---

## 13. Prototype demo experience

The dashboard should be designed for a **5-minute SIH demonstration**. Spoken lines live in `DEMO_SCRIPT.md`; this section is what the **UI must make obvious** without extra slides.

**Demo flow:**

| Step | What happens on screen |
| --- | --- |
| 1 | Officer opens the dashboard (map-first command centre). |
| 2 | Synthetic-data disclaimer is visible (banner + badge). |
| 3 | Map shows village risk distribution (Low / Watch / High). |
| 4 | Officer clicks a **high-risk cluster**. |
| 5 | System displays: risk score, risk category, contributing factors, trend chart, cluster information. |
| 6 | An **alert** is visible (list and/or generated notification path). |
| 7 | System explains in plain language that **risk increased because multiple signals changed together** — not because of a named diagnosis. |

Example explanation line (template, driven by factors): *“Risk increased because multiple signals changed together.”*

**Design goal:**

- Immediate understanding (hotspot is obvious in seconds)
- Strong visual storytelling (map → score → why → alert)
- Trust (disclaimer, no fake confirmation language)
- Explainability (factors and chart match the colour)

The evaluator should understand the innovation **without reading technical documentation**.
