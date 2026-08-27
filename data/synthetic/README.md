# Synthetic health signals

These CSV files form the **Phase 3 demo dataset** for Swasthya Sentinel AI. They support early-warning demonstrations only; they are not clinical, surveillance, or production data.

> **This dataset contains fictional aggregate signals only and does not represent real patients.**

## Purpose and story

The data covers 60 consecutive days (2026-07-01 through 2026-08-29) in the fictional **Kalyanpur Demo District**. The final 14 days contain one deliberate, geographically close multi-signal pattern:

- **Rampur, Lakshmipur, and Devgaon** have rising fever and diarrhea aggregates.
- The same three villages have higher OPD counts for those syndromes.
- Their ORS and fever-medicine sales rise at the same time.
- Rainfall and water-risk index also increase there.
- The other nine villages stay near small, fluctuating baselines.

This makes a transparent test case for a later risk engine: identify *unusual signals moving together across neighbouring places*. It does **not** assert that an outbreak or any disease is confirmed.

## Files and columns

### `locations.csv`

| Column | Meaning |
| --- | --- |
| `location_id` | Fictional, stable village identifier. |
| `location_name` | Fictional village name. |
| `location_type` | Always `village` in this dataset. |
| `block` | Fictional administrative grouping. |
| `district` | `Kalyanpur Demo District`, a fictional district. |
| `latitude`, `longitude` | Fictional village-centre map points; never a person or household. |

### `asha_signals.csv`

| Column | Meaning |
| --- | --- |
| `signal_id` | Synthetic signal row identifier. |
| `location_id`, `date` | Village and daily aggregation date. |
| `syndrome` | One of `fever`, `diarrhea`, `cough`, `rash`. |
| `case_count` | Aggregate ASHA-reported syndrome count. |

### `opd_signals.csv`

| Column | Meaning |
| --- | --- |
| `signal_id` | Synthetic signal row identifier. |
| `location_id`, `date`, `syndrome` | Same aggregate grain as ASHA signals. |
| `patient_count` | Aggregate OPD symptom count. It is not a patient record. |

### `pharmacy_signals.csv`

| Column | Meaning |
| --- | --- |
| `signal_id`, `location_id`, `date` | Synthetic product signal identity and grain. |
| `product_group` | `ORS`, `fever_medicine`, or `cough_medicine`. |
| `units_sold` | Aggregate fictional units sold. |

### `environment_signals.csv`

| Column | Meaning |
| --- | --- |
| `signal_id`, `location_id`, `date` | Synthetic environmental signal identity and grain. |
| `rainfall_mm` | Fictional daily rainfall in millimetres. |
| `water_risk_index` | Fictional 0–1 contextual index; not a laboratory measurement. |

## Simulated sources

- ASHA worker aggregate reports
- OPD aggregate symptom counts
- Pharmacy product-group trends
- Environmental rainfall and water-risk context

## Reproducibility

Run the generator from the repository root:

```bash
python scripts/generate_synthetic_data.py
```

The script uses Python's fixed random seed `20260828` and pandas, so it recreates the same CSVs. It deliberately contains no personal identifiers: no names, addresses, phone numbers, household IDs, Aadhaar numbers, clinical notes, or person-level GPS.
