"""
ml/risk_engine.py — Swasthya Sentinel AI Risk Engine.

Calculates transparent, deterministic 0–100 risk scores for surveillance locations
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
        Input DataFrame enriched with:
        - asha_ratio, opd_ratio, pharmacy_ratio, mean_anomaly_ratio
        - anomaly_score (0-100)
        - sources_elevated_count
        - corroboration_score (0-100)
        - cluster_id (e.g. 'C1', or None)
        - spatial_score (0-100)
        - env_score (0-100)
        - score_0_100 (0-100)
        - risk_category ('Low', 'Watch', 'High')
        - model_version ('risk-v1.0')
    """
    result = df.copy()

    # 1. Anomaly Component (40%)
    # Compare current window volume against expected baseline (median daily * window_days)
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

    # Scale anomaly: 1.0 (baseline) -> 0, 4.0+ (outbreak-like) -> 100
    anomaly_score = np.clip((mean_ratio - 1.0) / (4.0 - 1.0) * 100.0, 0.0, 100.0)
    result["anomaly_score"] = np.round(anomaly_score, 1)

    # 2. Multi-Source Corroboration Component (30%)
    # Count independent surveillance streams elevated significantly above baseline
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
    # Run DBSCAN on geographic coordinates (lat/lng) of anomalous locations only
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
                # Anomalous but geographically isolated
                cluster_ids[loc_pos] = None
                spatial_score[loc_pos] = 25.0

    result["cluster_id"] = cluster_ids
    result["spatial_score"] = np.round(spatial_score, 1)

    # 4. Environmental Component (10%)
    # Water risk (0-1) + Rainfall (mm)
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


def save_risk_scores(df: pd.DataFrame, db_path: Path | str | None = None) -> int:
    """
    Persist calculated risk scores into the SQLite risk_scores table.

    Uses an idempotent upsert pattern to avoid duplicate records.
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

        # Check if record already exists
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


def generate_high_risk_alerts(df: pd.DataFrame, db_path: Path | str | None = None) -> dict[str, int]:
    """
    Create or maintain high-risk alerts for locations with score >= 70.

    Ensures idempotency: does not duplicate open alerts when re-run.
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
    Full end-to-end execution of the risk scoring pipeline.

    1. Extract features from SQLite
    2. Compute statistical anomalies, spatial DBSCAN clusters, and 0-100 risk scores
    3. Persist results to SQLite risk_scores table
    4. Generate high-risk alerts for scores >= 70
    5. Return execution summary
    """
    from .features import build_features

    features_df = build_features()
    scored_df = calculate_risk_scores(features_df)
    saved_count = save_risk_scores(scored_df, db_path=db_path)
    alert_summary = generate_high_risk_alerts(scored_df, db_path=db_path)

    clusters_found = scored_df["cluster_id"].dropna().unique().tolist()
    highest_score = float(scored_df["score_0_100"].max())
    high_risk_count = int((scored_df["score_0_100"] >= 70.0).sum())

    return {
        "model_version": MODEL_VERSION,
        "locations_evaluated": len(scored_df),
        "scores_saved": saved_count,
        "highest_risk_score": highest_score,
        "high_risk_locations_count": high_risk_count,
        "clusters_found": clusters_found,
        "alert_summary": alert_summary,
        "scored_dataframe": scored_df,
    }
