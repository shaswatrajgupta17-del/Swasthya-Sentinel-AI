"""
scripts/verify_phase5.py — Comprehensive automated verification script for Phase 5.
"""

from __future__ import annotations

import sqlite3
import sys
from pathlib import Path

# Add project root to sys.path
_PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

import pandas as pd
import numpy as np

from backend.app.db import DATABASE_PATH, SessionLocal
from backend.app.services.seed_service import reset_and_seed_database
from ml.risk_engine import run_risk_pipeline, calculate_risk_scores
from ml.features import build_features
from backend.app.routers.risks import list_risks, get_risk
from backend.app.routers.alerts import list_alerts


def main() -> None:
    print("=" * 70)
    print("PHASE 5 COMPREHENSIVE VERIFICATION")
    print("=" * 70)

    # 1. Inspect Synthetic Dataset Syndromes
    print("\n1. INSPECT SYNTHETIC DATASET SYNDROMES")
    print("-" * 50)
    conn = sqlite3.connect(str(DATABASE_PATH))
    asha_df = pd.read_sql_query("SELECT * FROM asha_signals", conn)
    opd_df = pd.read_sql_query("SELECT * FROM opd_signals", conn)
    pharm_df = pd.read_sql_query("SELECT * FROM pharmacy_signals", conn)
    env_df = pd.read_sql_query("SELECT * FROM environment_signals", conn)
    conn.close()

    print("ASHA syndromes present      :", sorted(asha_df["syndrome"].unique().tolist()))
    print("OPD syndromes present       :", sorted(opd_df["syndrome"].unique().tolist()))
    print("Pharmacy product groups     :", sorted(pharm_df["product_group"].unique().tolist()))

    asha_df["date"] = pd.to_datetime(asha_df["date"])
    cluster_locs = ["loc_001", "loc_002", "loc_003"]
    recent_cluster = asha_df[(asha_df["location_id"].isin(cluster_locs)) & (asha_df["date"] >= "2026-08-16")]
    recent_quiet = asha_df[(~asha_df["location_id"].isin(cluster_locs)) & (asha_df["date"] >= "2026-08-16")]

    cluster_counts = recent_cluster.groupby("syndrome")["case_count"].sum().to_dict()
    quiet_counts_avg = (recent_quiet.groupby("syndrome")["case_count"].sum() / 3.0).round(1).to_dict()

    print("\nPlanted Cluster (14-day total across 3 villages):", cluster_counts)
    print("Quiet Baseline (14-day average across 3 villages) :", quiet_counts_avg)

    fever_surge = cluster_counts.get("fever", 0) / max(1, quiet_counts_avg.get("fever", 1))
    diarrhea_surge = cluster_counts.get("diarrhea", 0) / max(1, quiet_counts_avg.get("diarrhea", 1))
    cough_surge = cluster_counts.get("cough", 0) / max(1, quiet_counts_avg.get("cough", 1))
    rash_surge = cluster_counts.get("rash", 0) / max(1, quiet_counts_avg.get("rash", 1))

    print(f"Surge Multipliers in Outbreak -> Fever: {fever_surge:.1f}x | Diarrhea: {diarrhea_surge:.1f}x | Cough: {cough_surge:.1f}x | Rash: {rash_surge:.1f}x")
    print(">> CONCLUSION: Planted outbreak syndromes are FEVER and DIARRHEA (with ORS and fever medicine spikes). Cough and Rash are background baseline signals.")

    # 2 & 3. Legitimate Calculated Reasons
    print("\n2 & 3. LEGITIMATE CALCULATED REASONS (Planted Cluster)")
    print("-" * 50)
    feats = build_features()
    scored = calculate_risk_scores(feats)

    for loc in cluster_locs:
        row = scored.loc[loc]
        print(f"[{loc}] {row['name']:<12}: Anomaly={row['anomaly_score']:>5.1f} | Corrob={row['corroboration_score']:>5.1f} | Spatial={row['spatial_score']:>5.1f} | Env={row['env_score']:>5.1f} ==> Total={row['score_0_100']:>5.1f} ({row['risk_category']}, Cluster {row['cluster_id']})")
        assert row["score_0_100"] >= 70.0, f"Planted location {loc} score too low"
        assert row["cluster_id"] == "C1", f"Planted location {loc} not in cluster C1"
        assert row["risk_category"] == "High"

    # 4. Quiet / Background Locations
    print("\n4. QUIET / BACKGROUND LOCATIONS")
    print("-" * 50)
    quiet_scored = scored[~scored.index.isin(cluster_locs)]
    print(f"Quiet score range: {quiet_scored['score_0_100'].min()} to {quiet_scored['score_0_100'].max()}")
    print("Quiet locations risk bands:", quiet_scored["risk_category"].value_counts().to_dict())
    assert quiet_scored["score_0_100"].max() < 40.0, "Quiet locations should remain in Low band (<40)"
    assert set(quiet_scored["risk_category"].unique()) == {"Low"}
    assert quiet_scored["cluster_id"].isna().all(), "Quiet locations should not have a cluster ID"

    # 5. Repeatability Test
    print("\n5. REPEATABILITY & DETERMINISM")
    print("-" * 50)
    run1 = run_risk_pipeline()
    run2 = run_risk_pipeline()
    assert run1["highest_risk_score"] == run2["highest_risk_score"]
    assert run1["high_risk_locations_count"] == run2["high_risk_locations_count"]
    assert run2["alert_summary"]["alerts_created"] == 0
    assert run2["alert_summary"]["total_active_alerts"] == 3
    print(f"Run 1 Top Score: {run1['highest_risk_score']} == Run 2 Top Score: {run2['highest_risk_score']}")
    print(f"Run 2 New Alerts: {run2['alert_summary']['alerts_created']} (No duplicates created)")
    print(">> Repeatability check: PASS")

    # 6, 7, 8. SQLite Persistence & Schema
    print("\n6, 7, 8. SQLITE PERSISTENCE & METADATA")
    print("-" * 50)
    conn = sqlite3.connect(str(DATABASE_PATH))
    db_risks = pd.read_sql_query("SELECT * FROM risk_scores", conn)
    conn.close()

    print(f"risk_scores rows in DB : {len(db_risks)}")
    print(f"model_version in DB    : {db_risks['model_version'].unique().tolist()}")
    print(f"cluster_ids in DB      : {db_risks['cluster_id'].dropna().unique().tolist()}")
    assert len(db_risks) == 12
    assert set(db_risks["model_version"]) == {"phase5-v1"}
    print(">> SQLite persistence check: PASS")

    # 9 & 10. API Verification
    print("\n9 & 10. API ENDPOINT VERIFICATION")
    print("-" * 50)
    session = SessionLocal()
    api_risks = list_risks(session)
    assert len(api_risks) == 12
    print(f"GET /risks count: {len(api_risks)} | Top 1: {api_risks[0]['location_name']} (Score: {api_risks[0]['score_0_100']}, Cluster: {api_risks[0]['cluster_id']})")

    r_rampur = get_risk("loc_001", session)
    print(f"GET /risks/loc_001: {r_rampur['location_name']}, Score: {r_rampur['score_0_100']}, Cluster: {r_rampur['cluster_id']}, Model: {r_rampur['model_version']}")
    assert r_rampur["score_0_100"] == 98.5
    assert r_rampur["cluster_id"] == "C1"
    assert r_rampur["model_version"] == "phase5-v1"
    print(">> API verification check: PASS")

    # 11. Alerts Verification
    print("\n11. ALERTS THRESHOLD VERIFICATION")
    print("-" * 50)
    api_alerts = list_alerts(status=None, db=session)
    print(f"Active alerts count: {len(api_alerts)}")
    assert len(api_alerts) == 3
    for a in api_alerts:
        assert a["location_id"] in cluster_locs
        assert a["severity"] == "high"
        assert a["status"] == "open"
        print(f"  - Alert ID {a['id']}: {a['location_name']} ({a['location_id']}) -> Severity: {a['severity']}, Status: {a['status']}")
    session.close()
    print(">> Alerts verification check: PASS")

    print("\n" + "=" * 70)
    print("ALL PHASE 5 VERIFICATIONS PASSED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    main()
