"""Create reproducible, privacy-safe demo data for Swasthya Sentinel AI.

The output is deliberately aggregate-only: one row per location, day and signal.
All village names, coordinates and counts are fictional and must not be used for
medical or public-health decisions.
"""

from __future__ import annotations

import math
import random
from datetime import date, timedelta
from pathlib import Path

import pandas as pd


# A fixed seed lets every teammate recreate the same demo story.
SEED = 20260828
START_DATE = date(2026, 7, 1)
DAY_COUNT = 60
OUTBREAK_START_DAY = 46  # Final 14 days have a planted, multi-signal rise.

OUTPUT_DIR = Path(__file__).resolve().parents[1] / "data" / "synthetic"


# These are fictional village-centre coordinates, not patient or worker GPS data.
LOCATIONS = [
    {"location_id": "loc_001", "location_name": "Rampur", "location_type": "village", "block": "East Block", "district": "Kalyanpur Demo District", "latitude": 23.1840, "longitude": 79.9520, "cluster": True},
    {"location_id": "loc_002", "location_name": "Lakshmipur", "location_type": "village", "block": "East Block", "district": "Kalyanpur Demo District", "latitude": 23.1900, "longitude": 79.9600, "cluster": True},
    {"location_id": "loc_003", "location_name": "Devgaon", "location_type": "village", "block": "East Block", "district": "Kalyanpur Demo District", "latitude": 23.1780, "longitude": 79.9610, "cluster": True},
    {"location_id": "loc_004", "location_name": "Madhavpur", "location_type": "village", "block": "West Block", "district": "Kalyanpur Demo District", "latitude": 23.2050, "longitude": 79.9150, "cluster": False},
    {"location_id": "loc_005", "location_name": "Bansipur", "location_type": "village", "block": "West Block", "district": "Kalyanpur Demo District", "latitude": 23.2200, "longitude": 79.9380, "cluster": False},
    {"location_id": "loc_006", "location_name": "Chandpur", "location_type": "village", "block": "North Block", "district": "Kalyanpur Demo District", "latitude": 23.2120, "longitude": 79.9800, "cluster": False},
    {"location_id": "loc_007", "location_name": "Gokulwadi", "location_type": "village", "block": "North Block", "district": "Kalyanpur Demo District", "latitude": 23.1650, "longitude": 79.9250, "cluster": False},
    {"location_id": "loc_008", "location_name": "Sundarpur", "location_type": "village", "block": "South Block", "district": "Kalyanpur Demo District", "latitude": 23.1550, "longitude": 79.9870, "cluster": False},
    {"location_id": "loc_009", "location_name": "Haripur", "location_type": "village", "block": "South Block", "district": "Kalyanpur Demo District", "latitude": 23.1450, "longitude": 79.9450, "cluster": False},
    {"location_id": "loc_010", "location_name": "Neemkheda", "location_type": "village", "block": "Central Block", "district": "Kalyanpur Demo District", "latitude": 23.1980, "longitude": 79.9450, "cluster": False},
    {"location_id": "loc_011", "location_name": "Kesaritola", "location_type": "village", "block": "Central Block", "district": "Kalyanpur Demo District", "latitude": 23.1940, "longitude": 79.9820, "cluster": False},
    {"location_id": "loc_012", "location_name": "Sonapur", "location_type": "village", "block": "West Block", "district": "Kalyanpur Demo District", "latitude": 23.2320, "longitude": 79.9050, "cluster": False},
]

SYNDROME_BASELINES = {"fever": 4, "diarrhea": 3, "cough": 3, "rash": 1}
PRODUCT_BASELINES = {"ORS": 9, "fever_medicine": 13, "cough_medicine": 8}


def bounded_count(rng: random.Random, baseline: float, variation: int = 2) -> int:
    """Return a small, non-negative daily fluctuation around a baseline."""
    return max(0, round(baseline + rng.randint(-variation, variation)))


def cluster_multiplier(day_index: int) -> float:
    """Smoothly grow the planted cluster in the last 14 days, rather than jumping once."""
    if day_index < OUTBREAK_START_DAY:
        return 1.0
    progress = (day_index - OUTBREAK_START_DAY + 1) / (DAY_COUNT - OUTBREAK_START_DAY)
    return 1.0 + 5.0 * progress


def build_asha_rows(rng: random.Random, dates: list[date]) -> list[dict]:
    rows = []
    signal_number = 1
    for location in LOCATIONS:
        for day_index, current_date in enumerate(dates):
            for syndrome, baseline in SYNDROME_BASELINES.items():
                # Cluster villages begin with a moderately higher aggregate baseline.
                base = baseline * (5 if location["cluster"] and syndrome in {"fever", "diarrhea"} else 1)
                multiplier = cluster_multiplier(day_index) if location["cluster"] and syndrome in {"fever", "diarrhea"} else 1
                count = bounded_count(rng, base * multiplier, variation=3 if multiplier > 1 else 2)
                rows.append({"signal_id": f"asha_{signal_number:06d}", "location_id": location["location_id"], "date": current_date.isoformat(), "syndrome": syndrome, "case_count": count})
                signal_number += 1
    return rows


def build_opd_rows(rng: random.Random, dates: list[date]) -> list[dict]:
    rows = []
    signal_number = 1
    for location in LOCATIONS:
        for day_index, current_date in enumerate(dates):
            for syndrome, baseline in SYNDROME_BASELINES.items():
                base = baseline * (4 if location["cluster"] and syndrome in {"fever", "diarrhea"} else 1.4)
                multiplier = cluster_multiplier(day_index) if location["cluster"] and syndrome in {"fever", "diarrhea"} else 1
                count = bounded_count(rng, base * multiplier, variation=3 if multiplier > 1 else 2)
                rows.append({"signal_id": f"opd_{signal_number:06d}", "location_id": location["location_id"], "date": current_date.isoformat(), "syndrome": syndrome, "patient_count": count})
                signal_number += 1
    return rows


def build_pharmacy_rows(rng: random.Random, dates: list[date]) -> list[dict]:
    rows = []
    signal_number = 1
    for location in LOCATIONS:
        for day_index, current_date in enumerate(dates):
            for product, baseline in PRODUCT_BASELINES.items():
                is_cluster_product = location["cluster"] and product in {"ORS", "fever_medicine"}
                base = baseline * (2.2 if location["cluster"] and product in {"ORS", "fever_medicine"} else 1)
                multiplier = cluster_multiplier(day_index) if is_cluster_product else 1
                units = bounded_count(rng, base * multiplier, variation=6 if multiplier > 1 else 3)
                rows.append({"signal_id": f"pharmacy_{signal_number:06d}", "location_id": location["location_id"], "date": current_date.isoformat(), "product_group": product, "units_sold": units})
                signal_number += 1
    return rows


def build_environment_rows(rng: random.Random, dates: list[date]) -> list[dict]:
    rows = []
    signal_number = 1
    for location in LOCATIONS:
        for day_index, current_date in enumerate(dates):
            # A gentle monsoon-like seasonal wave keeps normal baselines non-flat.
            seasonal_rain = 14 + 10 * math.sin((day_index / DAY_COUNT) * math.pi)
            cluster_rain = 28 * ((day_index - OUTBREAK_START_DAY + 1) / (DAY_COUNT - OUTBREAK_START_DAY)) if location["cluster"] and day_index >= OUTBREAK_START_DAY else 0
            rainfall = max(0, round(seasonal_rain + cluster_rain + rng.uniform(-4, 4), 1))
            water_risk = 0.28 + rainfall / 140 + rng.uniform(-0.04, 0.04)
            if location["cluster"] and day_index >= OUTBREAK_START_DAY:
                water_risk += 0.22 * ((day_index - OUTBREAK_START_DAY + 1) / (DAY_COUNT - OUTBREAK_START_DAY))
            rows.append({"signal_id": f"environment_{signal_number:06d}", "location_id": location["location_id"], "date": current_date.isoformat(), "rainfall_mm": rainfall, "water_risk_index": round(min(0.99, max(0.05, water_risk)), 2)})
            signal_number += 1
    return rows


def write_csvs() -> None:
    """Generate each dataset with consistent dates and required values."""
    rng = random.Random(SEED)
    dates = [START_DATE + timedelta(days=offset) for offset in range(DAY_COUNT)]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # `cluster` is an authoring-only helper and is never released in locations.csv.
    location_rows = [{key: value for key, value in location.items() if key != "cluster"} for location in LOCATIONS]
    pd.DataFrame(location_rows).to_csv(OUTPUT_DIR / "locations.csv", index=False)
    pd.DataFrame(build_asha_rows(rng, dates)).to_csv(OUTPUT_DIR / "asha_signals.csv", index=False)
    pd.DataFrame(build_opd_rows(rng, dates)).to_csv(OUTPUT_DIR / "opd_signals.csv", index=False)
    pd.DataFrame(build_pharmacy_rows(rng, dates)).to_csv(OUTPUT_DIR / "pharmacy_signals.csv", index=False)
    pd.DataFrame(build_environment_rows(rng, dates)).to_csv(OUTPUT_DIR / "environment_signals.csv", index=False)

    print(f"Wrote reproducible synthetic CSVs to: {OUTPUT_DIR}")


if __name__ == "__main__":
    write_csvs()
