"""Phase 9 integration checks for the local synthetic demo."""

from __future__ import annotations

import argparse
import json
import sqlite3
from pathlib import Path
from urllib.request import urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATABASE_PATH = PROJECT_ROOT / "backend" / "data" / "sentinel.db"


def check_database() -> None:
    with sqlite3.connect(DATABASE_PATH) as connection:
        counts = {
            table: connection.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            for table in ("locations", "risk_scores", "risk_factors", "alerts")
        }
        scores = connection.execute(
            "SELECT location_id, score_0_100, cluster_id, model_version FROM risk_scores"
        ).fetchall()
        factor_totals = connection.execute(
            """
            SELECT rs.location_id, rs.score_0_100, COUNT(rf.id), ROUND(SUM(rf.contribution), 1)
            FROM risk_scores rs
            LEFT JOIN risk_factors rf ON rf.location_id = rs.location_id
            GROUP BY rs.location_id
            """
        ).fetchall()

    assert counts == {"locations": 12, "risk_scores": 12, "risk_factors": 72, "alerts": 3}, counts
    assert all(count == 6 and total == score for _, score, count, total in factor_totals)
    high_scores = [score for _, score, cluster_id, _ in scores if cluster_id == "C1"]
    quiet_scores = [score for _, score, cluster_id, _ in scores if cluster_id is None]
    assert high_scores and quiet_scores and min(high_scores) > max(quiet_scores)
    assert all(model_version == "phase5-v1" for _, _, _, model_version in scores)
    print("database: PASS")


def check_api(base_url: str) -> None:
    def get(path: str):
        with urlopen(f"{base_url.rstrip('/')}{path}") as response:
            assert response.status == 200
            return json.load(response)

    health = get("/health")
    locations = get("/locations")
    risks = get("/risks")
    detail = get("/risks/loc_002")
    alerts = get("/alerts?status=open")

    assert health["data_mode"] == "synthetic" and health["not_a_diagnosis"] is True
    assert len(locations) == 12 and len(risks) == 12
    assert detail["score_0_100"] >= 70 and detail["cluster_id"] == "C1"
    assert len(detail["factors"]) == 6 and detail["model_version"] == "phase5-v1"
    assert len(alerts) == 3 and all(alert["score_0_100"] >= 70 for alert in alerts)
    assert all(alert["not_a_diagnosis"] is True for alert in alerts)
    print("api: PASS")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--api-url", help="Running FastAPI base URL, for example http://127.0.0.1:8001")
    args = parser.parse_args()
    check_database()
    if args.api_url:
        check_api(args.api_url)
    else:
        print("api: SKIPPED (pass --api-url with a running FastAPI server)")


if __name__ == "__main__":
    main()