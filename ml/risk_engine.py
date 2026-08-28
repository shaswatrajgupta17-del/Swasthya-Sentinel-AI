"""
ml/risk_engine.py — Swasthya Sentinel AI Risk Engine & Factor Decomposition (Phases 5 & 6).

Calculates transparent, deterministic 0–100 risk scores and factor contributions for surveillance locations
using synthetic multi-source health signals (ASHA, OPD, Pharmacy, Environment).

Risk Bands:
    0–39  : Low
    40–69 : Watch
    70–100: High

Weights:
    40% Anomaly / Signal Unusualness (ASHA, OPD, Pharmacy vs baseline)
    30% Multi-Source Corroboration (independent signal streams elevated)
    20% Spatial Clustering (DBSCAN geographic clustering of anomalous locations)
    10% Environmental Context (rainfall and water-risk index)

Explainability (Phase 6):
    Decomposes the final score into 6 factual factor contributions:
    - ASHA Syndromic Reports
    - OPD Clinical Visits
    - Pharmacy Product Demand
    - Multi-Source Corroboration
    - Spatial Cluster Grouping
    - Environmental Context

DISCLAIMER:
    This engine computes statistical risk of unusual clustered signals for decision support.
    It does NOT diagnose disease, identify patients, or confirm disease outbreaks.
"""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN

# Resolve DB path: ml/ -> project root -> backend/data/sentinel.db
_DEFAULT_DB_PATH = Path(__file__).resolve().parents[1] / "backend" / "data" / "sentinel.db"

# Model metadata
MODEL_VERSION = "phase5-v1"

# Component weights (sum = 1.0)
WEIGHT_ANOMALY = 0.40
WEIGHT_CORROBORATION = 0.30
WEIGHT_SPATIAL = 0.20
WEIGHT_ENVIRONMENT = 0.10

# Thresholds
ELEVATION_RATIO_THRESHOLD = 1.5
ANOMALY_CLUSTER_THRESHOLD = 1.5
DBSCAN_EPS_KM = 2.5
EARTH_RADIUS_KM = 6371.0
DBSCAN_MIN_SAMPLES = 2
ALERT_SCORE_THRESHOLD = 70.0


def calculate_risk_scores(df: pd.DataFrame, window_days: int = 7) -> pd.DataFrame:
    """
    Calculate component scores, spatial clusters, and final 0-100 risk scores.

    Parameters
    ----------
    df : pd.DataFrame
        Per-location feature DataFrame produced by ml.features.build_features().
    window_days : int
        Duration of the scoring window in days (default: 7).

    Returns
    -------
    pd.DataFrame
        Input DataFrame enriched with calculated scores, cluster IDs, and risk categories.
    """
    result = df.copy()

    # 1. Anomaly Component (40%)
    asha_expected = np.maximum(1.0, result["asha_baseline_median"] * window_days)
    opd_expected = np.maximum(1.0, result["opd_baseline_median"] * window_days)
    pharm_expected = np.maximum(1.0, result["pharmacy_baseline_median"] * window_days)

    r_asha = result["asha_total"] / asha_expected
    r_opd = result["opd_total"] / opd_expected
    r_pharm = result["pharmacy_total"] / pharm_expected

    result["asha_ratio"] = np.round(r_asha, 2)
    result["opd_ratio"] = np.round(r_opd, 2)
    result["pharmacy_ratio"] = np.round(r_pharm, 2)

    mean_ratio = (r_asha + r_opd + r_pharm) / 3.0
    result["mean_anomaly_ratio"] = np.round(mean_ratio, 2)

    anomaly_score = np.clip((mean_ratio - 1.0) / (4.0 - 1.0) * 100.0, 0.0, 100.0)
    result["anomaly_score"] = np.round(anomaly_score, 1)

    # 2. Multi-Source Corroboration Component (30%)
    elev_asha = (r_asha >= ELEVATION_RATIO_THRESHOLD).astype(int)
    elev_opd = (r_opd >= ELEVATION_RATIO_THRESHOLD).astype(int)
    elev_pharm = (r_pharm >= ELEVATION_RATIO_THRESHOLD).astype(int)
    elev_env = (
        (result["env_water_risk_mean"] >= 0.55) | (result["env_rainfall_mean"] >= 25.0)
    ).astype(int)

    sources_elevated = elev_asha + elev_opd + elev_pharm + elev_env
    result["sources_elevated_count"] = sources_elevated
    corroboration_score = sources_elevated * 25.0
    result["corroboration_score"] = np.round(corroboration_score, 1)

    # 3. Spatial Clustering Component (20%)
    anom_mask = mean_ratio >= ANOMALY_CLUSTER_THRESHOLD
    cluster_ids: list[str | None] = [None] * len(result)
    spatial_score = np.zeros(len(result), dtype=float)

    if anom_mask.sum() >= DBSCAN_MIN_SAMPLES:
        anom_indices = result.index[anom_mask]
        coords_rad = np.radians(result.loc[anom_mask, ["lat", "lng"]].values)
        db = DBSCAN(
            eps=DBSCAN_EPS_KM / EARTH_RADIUS_KM,
            min_samples=DBSCAN_MIN_SAMPLES,
            metric="haversine",
        ).fit(coords_rad)

        for idx, loc_id in enumerate(anom_indices):
            lbl = db.labels_[idx]
            loc_pos = result.index.get_loc(loc_id)
            if lbl != -1:
                cluster_ids[loc_pos] = f"C{lbl + 1}"
                spatial_score[loc_pos] = 95.0
            else:
                cluster_ids[loc_pos] = None
                spatial_score[loc_pos] = 25.0

    result["cluster_id"] = cluster_ids
    result["spatial_score"] = np.round(spatial_score, 1)

    # 4. Environmental Component (10%)
    env_score = np.clip(
        (result["env_water_risk_mean"] - 0.35) / 0.40 * 60.0
        + (result["env_rainfall_mean"] - 15.0) / 25.0 * 40.0,
        0.0,
        100.0,
    )
    result["env_score"] = np.round(env_score, 1)

    # 5. Final Combined 0–100 Risk Score
    final_score = np.clip(
        WEIGHT_ANOMALY * anomaly_score
        + WEIGHT_CORROBORATION * corroboration_score
        + WEIGHT_SPATIAL * spatial_score
        + WEIGHT_ENVIRONMENT * env_score,
        0.0,
        100.0,
    )
    result["score_0_100"] = np.round(final_score, 1)

    # 6. Risk Band Categorization
    result["risk_category"] = pd.cut(
        result["score_0_100"],
        bins=[-0.1, 39.9, 69.9, 100.0],
        labels=["Low", "Watch", "High"],
    ).astype(str)

    result["model_version"] = MODEL_VERSION

    # Preserve window metadata
    if "window_start" in df.attrs:
        result.attrs["window_start"] = df.attrs["window_start"]
    if "window_end" in df.attrs:
        result.attrs["window_end"] = df.attrs["window_end"]

    return result


def extract_risk_factors(scored_df: pd.DataFrame, window_days: int = 7) -> dict[str, list[dict[str, Any]]]:
    """
    Decompose calculated risk scores into explainable, factual factor contributions (Phase 6).

    Parameters
    ----------
    scored_df : pd.DataFrame
        DataFrame produced by calculate_risk_scores().
    window_days : int
        Duration of the scoring window in days (default: 7).

    Returns
    -------
    dict[str, list[dict]]
        Dictionary mapping location_id -> list of factor dictionaries:
        - factor_name: str
        - contribution: float (points contributed)
        - percentage: float (relative % of total risk score)
        - note: str (factual, non-diagnostic explanation)
    """
    factors_by_location: dict[str, list[dict[str, Any]]] = {}

    for loc_id, row in scored_df.iterrows():
        total_score = float(row["score_0_100"])
        anom_total_pts = WEIGHT_ANOMALY * float(row["anomaly_score"])

        r_a = float(row["asha_ratio"])
        r_o = float(row["opd_ratio"])
        r_p = float(row["pharmacy_ratio"])

        excess_a = max(0.0, r_a - 1.0)
        excess_o = max(0.0, r_o - 1.0)
        excess_p = max(0.0, r_p - 1.0)
        excess_sum = excess_a + excess_o + excess_p

        if excess_sum > 0:
            asha_pts = round(anom_total_pts * (excess_a / excess_sum), 1)
            opd_pts = round(anom_total_pts * (excess_o / excess_sum), 1)
            pharm_pts = round(anom_total_pts * (excess_p / excess_sum), 1)
        else:
            asha_pts = round(anom_total_pts / 3.0, 1)
            opd_pts = round(anom_total_pts / 3.0, 1)
            pharm_pts = round(anom_total_pts / 3.0, 1)

        corrob_pts = WEIGHT_CORROBORATION * float(row["corroboration_score"])
        spatial_pts = WEIGHT_SPATIAL * float(row["spatial_score"])
        env_pts = WEIGHT_ENVIRONMENT * float(row["env_score"])

        # Baseline expected counts for factual notes
        asha_exp = int(round(float(row["asha_baseline_median"]) * window_days))
        asha_act = int(row["asha_total"])
        opd_exp = int(round(float(row["opd_baseline_median"]) * window_days))
        opd_act = int(row["opd_total"])
        pharm_exp = int(round(float(row["pharmacy_baseline_median"]) * window_days))
        pharm_act = int(row["pharmacy_total"])

        # Notes
        asha_note = (
            f"ASHA fever and diarrhea reports {r_a:.1f}x above historical baseline ({asha_act:,} cases vs expected {asha_exp:,})"
            if r_a >= ELEVATION_RATIO_THRESHOLD
            else f"ASHA syndromic reports within expected baseline range ({asha_act:,} cases vs expected {asha_exp:,})"
        )

        opd_note = (
            f"OPD clinic syndromic patient counts {r_o:.1f}x above historical baseline ({opd_act:,} visits vs expected {opd_exp:,})"
            if r_o >= ELEVATION_RATIO_THRESHOLD
            else f"OPD clinic patient counts within expected baseline range ({opd_act:,} visits vs expected {opd_exp:,})"
        )

        pharm_note = (
            f"Pharmacy ORS and fever medicine sales {r_p:.1f}x above historical baseline ({pharm_act:,} units vs expected {pharm_exp:,})"
            if r_p >= ELEVATION_RATIO_THRESHOLD
            else f"Pharmacy product sales within expected baseline range ({pharm_act:,} units vs expected {pharm_exp:,})"
        )

        count_elev = int(row["sources_elevated_count"])
        corrob_note = (
            f"{count_elev} of 4 independent surveillance channels jointly elevated above threshold"
            if count_elev >= 2
            else f"{count_elev} of 4 surveillance channels elevated (no joint multi-source surge)"
        )

        cluster_id = row["cluster_id"] if pd.notna(row["cluster_id"]) else None
        spatial_note = (
            f"Part of spatial cluster {cluster_id} with neighbouring elevated villages in {row['block']}"
            if cluster_id
            else "No spatial clustering detected with neighbouring elevated anomalies"
        )

        rain = float(row["env_rainfall_mean"])
        water = float(row["env_water_risk_mean"])
        env_note = (
            f"Elevated environmental risk: water risk index {water:.2f}, rainfall {rain:.1f} mm mean"
            if (water >= 0.55 or rain >= 25.0)
            else f"Environmental metrics within seasonal baseline (water risk {water:.2f}, rainfall {rain:.1f} mm)"
        )

        raw_factors = [
            ("ASHA Syndromic Reports", asha_pts, asha_note),
            ("OPD Clinical Visits", opd_pts, opd_note),
            ("Pharmacy Product Demand", pharm_pts, pharm_note),
            ("Multi-Source Corroboration", corrob_pts, corrob_note),
            ("Spatial Cluster Grouping", spatial_pts, spatial_note),
            ("Environmental Indicators", env_pts, env_note),
        ]

        factor_list = []
        rounded_points = [round(pts, 1) for _, pts, _ in raw_factors]
        rounding_adjustment = round(total_score - sum(rounded_points), 1)
        if rounding_adjustment:
            rounded_points[-1] = round(rounded_points[-1] + rounding_adjustment, 1)

        for (name, _, note), pts in zip(raw_factors, rounded_points):
            pct = round((pts / total_score) * 100.0, 1) if total_score > 0 else 0.0
            factor_list.append({
                "factor_name": name,
                "contribution": pts,
                "percentage": pct,
                "note": note,
            })

        factors_by_location[str(loc_id)] = factor_list

    return factors_by_location


def save_risk_scores(df: pd.DataFrame, db_path: Path | str | None = None) -> int:
    """
    Persist calculated risk scores into the SQLite risk_scores table.
    """
    target_db = Path(db_path) if db_path else _DEFAULT_DB_PATH
    if not target_db.exists():
        raise FileNotFoundError(f"Database not found at {target_db}")

    window_start = df.attrs.get("window_start")
    window_end = df.attrs.get("window_end")

    conn = sqlite3.connect(str(target_db))
    cursor = conn.cursor()

    rows_updated = 0
    for loc_id, row in df.iterrows():
        cluster_val = row["cluster_id"] if pd.notna(row["cluster_id"]) else None
        score_val = float(row["score_0_100"])

        cursor.execute("SELECT id FROM risk_scores WHERE location_id = ?", (str(loc_id),))
        existing = cursor.fetchone()

        if existing:
            cursor.execute(
                """
                UPDATE risk_scores
                SET score_0_100 = ?, cluster_id = ?, model_version = ?,
                    window_start = ?, window_end = ?
                WHERE location_id = ?
                """,
                (score_val, cluster_val, MODEL_VERSION, window_start, window_end, str(loc_id)),
            )
        else:
            cursor.execute(
                """
                INSERT INTO risk_scores (location_id, window_start, window_end, score_0_100, cluster_id, model_version)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (str(loc_id), window_start, window_end, score_val, cluster_val, MODEL_VERSION),
            )
        rows_updated += 1

    conn.commit()
    conn.close()
    return rows_updated


def save_risk_factors(factors_by_loc: dict[str, list[dict[str, Any]]], db_path: Path | str | None = None) -> int:
    """
    Persist risk factor decompositions into the SQLite risk_factors table (Phase 6).
    """
    target_db = Path(db_path) if db_path else _DEFAULT_DB_PATH
    if not target_db.exists():
        raise FileNotFoundError(f"Database not found at {target_db}")

    conn = sqlite3.connect(str(target_db))
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS risk_factors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_id TEXT NOT NULL,
            factor_name TEXT NOT NULL,
            contribution REAL NOT NULL,
            percentage REAL NOT NULL,
            note TEXT NOT NULL
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_risk_factors_location_id ON risk_factors (location_id)")

    # Idempotent refresh of factor rows
    cursor.execute("DELETE FROM risk_factors")

    total_inserted = 0
    for loc_id, factors in factors_by_loc.items():
        for factor in factors:
            cursor.execute(
                """
                INSERT INTO risk_factors (location_id, factor_name, contribution, percentage, note)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    str(loc_id),
                    factor["factor_name"],
                    float(factor["contribution"]),
                    float(factor["percentage"]),
                    factor["note"],
                ),
            )
            total_inserted += 1

    conn.commit()
    conn.close()
    return total_inserted


def generate_high_risk_alerts(df: pd.DataFrame, db_path: Path | str | None = None) -> dict[str, int]:
    """
    Create or maintain high-risk alerts for locations with score >= 70.
    """
    target_db = Path(db_path) if db_path else _DEFAULT_DB_PATH
    if not target_db.exists():
        raise FileNotFoundError(f"Database not found at {target_db}")

    conn = sqlite3.connect(str(target_db))
    cursor = conn.cursor()

    high_risk_df = df[df["score_0_100"] >= ALERT_SCORE_THRESHOLD]
    created_count = 0
    existing_open_count = 0

    now_iso = datetime.now(timezone.utc).isoformat()

    for loc_id, row in high_risk_df.iterrows():
        cursor.execute(
            "SELECT id FROM alerts WHERE location_id = ? AND status = 'open'",
            (str(loc_id),),
        )
        existing = cursor.fetchone()

        if existing:
            existing_open_count += 1
        else:
            cursor.execute(
                """
                INSERT INTO alerts (location_id, severity, status, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (str(loc_id), "high", "open", now_iso),
            )
            created_count += 1

    conn.commit()
    conn.close()

    return {
        "high_risk_locations": len(high_risk_df),
        "alerts_created": created_count,
        "existing_open_alerts": existing_open_count,
        "total_active_alerts": created_count + existing_open_count,
    }


def run_risk_pipeline(db_path: Path | str | None = None) -> dict[str, Any]:
    """
    Full end-to-end execution of the risk scoring & explainability pipeline.
    """
    from .features import build_features

    features_df = build_features()
    scored_df = calculate_risk_scores(features_df)
    saved_scores_count = save_risk_scores(scored_df, db_path=db_path)
    
    # Phase 6: Factor decomposition & persistence
    factors_by_loc = extract_risk_factors(scored_df)
    saved_factors_count = save_risk_factors(factors_by_loc, db_path=db_path)
    
    alert_summary = generate_high_risk_alerts(scored_df, db_path=db_path)

    clusters_found = scored_df["cluster_id"].dropna().unique().tolist()
    highest_score = float(scored_df["score_0_100"].max())
    high_risk_count = int((scored_df["score_0_100"] >= 70.0).sum())

    return {
        "model_version": MODEL_VERSION,
        "locations_evaluated": len(scored_df),
        "scores_saved": saved_scores_count,
        "factors_saved": saved_factors_count,
        "highest_risk_score": highest_score,
        "high_risk_locations_count": high_risk_count,
        "clusters_found": clusters_found,
        "alert_summary": alert_summary,
        "scored_dataframe": scored_df,
        "factors_by_location": factors_by_loc,
    }
