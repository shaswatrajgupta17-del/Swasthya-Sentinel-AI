"""
ml/run.py — CLI entry point for the Swasthya Sentinel AI risk engine & explainability (Phases 5 & 6).

Usage:
    python -m ml.run

Performs:
    1. Loads SQLite surveillance data
    2. Builds features across 7-day scoring window vs 30-day baseline
    3. Calculates statistical anomalies (ASHA, OPD, Pharmacy)
    4. Calculates DBSCAN spatial clusters of anomalous locations
    5. Calculates multi-source corroboration and environmental signals
    6. Calculates deterministic 0–100 risk scores
    7. Decomposes scores into 6 transparent risk factors (Phase 6)
    8. Persists risk_scores and risk_factors into SQLite
    9. Generates High severity alerts for locations with score >= 70
    10. Prints execution summary and factor decomposition table
"""

from __future__ import annotations

import sys
from pathlib import Path

# Add project root to sys.path if needed
_PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from ml.risk_engine import run_risk_pipeline


def main() -> None:
    print("=" * 70)
    print("SWASTHYA SENTINEL AI — RISK ENGINE & EXPLAINABILITY (PHASE 5 & 6)")
    print("=" * 70)
    print("Surveillance: Synthetic multi-source health signals (aggregates only)")
    print("Disclaimer: Risk scores indicate statistical unusualness, not diagnosis.")
    print("-" * 70)

    try:
        results = run_risk_pipeline()
    except Exception as exc:
        print(f"[ERROR] Risk engine pipeline failed: {exc}", file=sys.stderr)
        sys.exit(1)

    scored_df = results["scored_dataframe"]
    alert_summary = results["alert_summary"]
    factors_by_loc = results["factors_by_location"]

    print("\n[EVALUATION RESULTS BY LOCATION]")
    print("-" * 70)
    header = f"{'Location ID':<12} {'Location Name':<14} {'Block':<14} {'Score':>6} {'Band':<6} {'Cluster':<8} {'Alert':<6}"
    print(header)
    print("-" * 70)

    # Sort locations descending by risk score
    sorted_df = scored_df.sort_values(by="score_0_100", ascending=False)

    for loc_id, row in sorted_df.iterrows():
        cluster_str = str(row["cluster_id"]) if pd_not_na(row["cluster_id"]) else "—"
        score_val = f"{row['score_0_100']:>5.1f}"
        band_str = row["risk_category"]
        alert_str = "YES" if row["score_0_100"] >= 70.0 else "—"
        print(f"{str(loc_id):<12} {row['name']:<14} {row['block']:<14} {score_val:>6} {band_str:<6} {cluster_str:<8} {alert_str:<6}")

    print("-" * 70)

    high_count = int((scored_df["risk_category"] == "High").sum())
    watch_count = int((scored_df["risk_category"] == "Watch").sum())
    low_count = int((scored_df["risk_category"] == "Low").sum())
    top_row = sorted_df.iloc[0]
    top_loc_id = str(sorted_df.index[0])
    top_factors = factors_by_loc.get(top_loc_id, [])

    print(f"\n[PHASE 6 EXPLAINABILITY — TOP LOCATION: {top_row['name']} ({top_row['score_0_100']}/100)]")
    print("-" * 70)
    print(f"{'Factor Name':<30} {'Points':>8} {'Share':>8}   {'Note'}")
    print("-" * 70)
    for f in top_factors:
        print(f"{f['factor_name']:<30} {f['contribution']:>7.1f}p {f['percentage']:>7.1f}%   {f['note']}")
    print("-" * 70)

    print("\nRisk engine completed.")
    print(f"Model version: {results['model_version']}")
    print(f"Locations scored: {results['locations_evaluated']}")
    print(f"Scores saved to DB: {results['scores_saved']}")
    print(f"Factors saved to DB: {results['factors_saved']}")
    print(f"High: {high_count}")
    print(f"Watch: {watch_count}")
    print(f"Low: {low_count}")
    print(f"Top location: {top_row['name']} ({top_row['block']})")
    print(f"Top score: {top_row['score_0_100']}")
    print(f"Spatial clusters: {', '.join(results['clusters_found']) if results['clusters_found'] else 'None'}")
    print(f"Active alerts: {alert_summary['total_active_alerts']}")
    print("=" * 70 + "\n")


def pd_not_na(val: object) -> bool:
    if val is None:
        return False
    try:
        import pandas as pd
        return pd.notna(val)
    except ImportError:
        return True


if __name__ == "__main__":
    main()
