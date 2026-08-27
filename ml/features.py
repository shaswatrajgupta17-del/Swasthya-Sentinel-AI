"""
ml/features.py — Feature extraction for the Swasthya Sentinel AI risk engine.

Loads aggregate synthetic signals from SQLite and produces a feature DataFrame
(one row per location) for the scoring window. No patient-level data. No
disease diagnosis. All signals are fictional aggregates for demo purposes.

Feature set (per location, last WINDOW_DAYS days):
    asha_fever_sum      : total ASHA-reported fever cases
    asha_diarrhea_sum   : total ASHA-reported diarrhea cases
    asha_total          : fever + diarrhea combined
    opd_fever_sum       : OPD fever patient count
    opd_diarrhea_sum    : OPD diarrhea patient count
    opd_total           : fever + diarrhea OPD combined
    pharmacy_ors_sum    : ORS units sold
    pharmacy_fever_sum  : fever medicine units sold
    pharmacy_total      : ORS + fever medicine combined
    env_rainfall_mean   : mean daily rainfall (mm)
    env_water_risk_mean : mean daily water-risk index (0-1)
    source_count        : number of independent sources elevated above baseline
    lat, lng            : location coordinates (for DBSCAN)
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

import pandas as pd

# Resolve DB path relative to this file: ml/ -> project root -> backend/data/
_DB_PATH = Path(__file__).resolve().parents[1] / "backend" / "data" / "sentinel.db"

# Rolling window used for risk scoring
WINDOW_DAYS = 7

# Baseline window used to estimate the expected background level
BASELINE_DAYS = 30


def _connect() -> sqlite3.Connection:
    """Return a read-only SQLite connection. The ML engine never writes via this module."""
    if not _DB_PATH.exists():
        raise FileNotFoundError(
            f"SQLite database not found at {_DB_PATH}. "
            "Run python backend/seed_database.py first."
        )
    return sqlite3.connect(str(_DB_PATH))


def load_locations() -> pd.DataFrame:
    """Load all locations with coordinates. Returns columns: location_id, name, block, lat, lng."""
    conn = _connect()
    df = pd.read_sql_query(
        "SELECT location_id, name, block, latitude AS lat, longitude AS lng FROM locations",
        conn,
    )
    conn.close()
    return df


def _load_table(table: str, conn: sqlite3.Connection) -> pd.DataFrame:
    df = pd.read_sql_query(f"SELECT * FROM {table}", conn)
    df["date"] = pd.to_datetime(df["date"])
    return df


def _latest_date(asha: pd.DataFrame) -> pd.Timestamp:
    """Use the latest date in the ASHA signals as the reference point for windows."""
    return asha["date"].max()


def build_features(window_days: int = WINDOW_DAYS, baseline_days: int = BASELINE_DAYS) -> pd.DataFrame:
    """
    Build a per-location feature DataFrame for the scoring window.

    Parameters
    ----------
    window_days   : number of recent days forming the scoring window (default 7)
    baseline_days : number of prior days used to calculate the expected baseline (default 30)

    Returns
    -------
    DataFrame indexed by location_id with feature columns plus lat/lng.
    Also returns window metadata via DataFrame attrs:
        df.attrs['window_start'], df.attrs['window_end']
    """
    conn = _connect()
    asha = _load_table("asha_signals", conn)
    opd = _load_table("opd_signals", conn)
    pharmacy = _load_table("pharmacy_signals", conn)
    env = _load_table("environment_signals", conn)
    locations = load_locations()
    conn.close()

    ref_date = _latest_date(asha)
    window_end = ref_date
    window_start = ref_date - pd.Timedelta(days=window_days - 1)
    baseline_end = window_start - pd.Timedelta(days=1)
    baseline_start = baseline_end - pd.Timedelta(days=baseline_days - 1)

    # --- ASHA window aggregates ---
    asha_win = asha[asha["date"].between(window_start, window_end)]
    asha_fever = (
        asha_win[asha_win["syndrome"] == "fever"]
        .groupby("location_id")["case_count"].sum()
        .rename("asha_fever_sum")
    )
    asha_diarrhea = (
        asha_win[asha_win["syndrome"] == "diarrhea"]
        .groupby("location_id")["case_count"].sum()
        .rename("asha_diarrhea_sum")
    )

    # --- OPD window aggregates ---
    opd_win = opd[opd["date"].between(window_start, window_end)]
    opd_fever = (
        opd_win[opd_win["syndrome"] == "fever"]
        .groupby("location_id")["patient_count"].sum()
        .rename("opd_fever_sum")
    )
    opd_diarrhea = (
        opd_win[opd_win["syndrome"] == "diarrhea"]
        .groupby("location_id")["patient_count"].sum()
        .rename("opd_diarrhea_sum")
    )

    # --- Pharmacy window aggregates ---
    pharm_win = pharmacy[pharmacy["date"].between(window_start, window_end)]
    pharm_ors = (
        pharm_win[pharm_win["product_group"] == "ORS"]
        .groupby("location_id")["units_sold"].sum()
        .rename("pharmacy_ors_sum")
    )
    pharm_fever = (
        pharm_win[pharm_win["product_group"] == "fever_medicine"]
        .groupby("location_id")["units_sold"].sum()
        .rename("pharmacy_fever_sum")
    )

    # --- Environment window aggregates ---
    env_win = env[env["date"].between(window_start, window_end)]
    env_rain = (
        env_win.groupby("location_id")["rainfall_mm"].mean().rename("env_rainfall_mean")
    )
    env_risk = (
        env_win.groupby("location_id")["water_risk_index"].mean().rename("env_water_risk_mean")
    )

    # --- Baseline aggregates (per location per day, then median across days) ---
    asha_base = asha[asha["date"].between(baseline_start, baseline_end)]
    opd_base = opd[opd["date"].between(baseline_start, baseline_end)]
    pharm_base = pharmacy[pharmacy["date"].between(baseline_start, baseline_end)]

    # Symptom daily totals (fever + diarrhea) in the baseline period
    asha_base_daily = (
        asha_base[asha_base["syndrome"].isin(["fever", "diarrhea"])]
        .groupby(["location_id", "date"])["case_count"].sum()
        .reset_index()
    )
    asha_baseline_median = (
        asha_base_daily.groupby("location_id")["case_count"]
        .median()
        .rename("asha_baseline_median")
    )

    opd_base_daily = (
        opd_base[opd_base["syndrome"].isin(["fever", "diarrhea"])]
        .groupby(["location_id", "date"])["patient_count"].sum()
        .reset_index()
    )
    opd_baseline_median = (
        opd_base_daily.groupby("location_id")["patient_count"]
        .median()
        .rename("opd_baseline_median")
    )

    pharm_base_daily = (
        pharm_base[pharm_base["product_group"].isin(["ORS", "fever_medicine"])]
        .groupby(["location_id", "date"])["units_sold"].sum()
        .reset_index()
    )
    pharm_baseline_median = (
        pharm_base_daily.groupby("location_id")["units_sold"]
        .median()
        .rename("pharm_baseline_median")
    )

    # --- Assemble into one DataFrame ---
    feat = locations.set_index("location_id")
    for series in [
        asha_fever, asha_diarrhea,
        opd_fever, opd_diarrhea,
        pharm_ors, pharm_fever,
        env_rain, env_risk,
        asha_baseline_median, opd_baseline_median, pharm_baseline_median,
    ]:
        feat = feat.join(series, how="left")

    feat = feat.fillna(0)

    # Derived totals
    feat["asha_total"] = feat["asha_fever_sum"] + feat["asha_diarrhea_sum"]
    feat["opd_total"] = feat["opd_fever_sum"] + feat["opd_diarrhea_sum"]
    feat["pharmacy_total"] = feat["pharmacy_ors_sum"] + feat["pharmacy_fever_sum"]

    # Attach window metadata as DataFrame attributes
    feat.attrs["window_start"] = window_start.strftime("%Y-%m-%d")
    feat.attrs["window_end"] = window_end.strftime("%Y-%m-%d")

    return feat
