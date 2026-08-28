"""Load Phase 3 synthetic CSVs into the Phase 4 SQLite database."""

from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

from ..models import AshaSignal, EnvironmentSignal, Location, OpdSignal, PharmacySignal, RiskFactor, RiskScore


SYNTHETIC_DATA_DIR = Path(__file__).resolve().parents[3] / "data" / "synthetic"


def read_csv(name: str) -> list[dict]:
    """Read a CSV as simple dictionaries and convert NaN values to None."""
    return pd.read_csv(SYNTHETIC_DATA_DIR / name).where(pd.notna, None).to_dict("records")


def without_source_signal_id(rows: list[dict]) -> list[dict]:
    """Keep the database's SQLite `id`; CSV signal_id is source metadata only."""
    return [{key: value for key, value in row.items() if key != "signal_id"} for row in rows]


def reset_and_seed_database() -> dict[str, int]:
    """Drop existing demo tables, recreate them, and insert the current CSV data.

    Dropping the small local database schema is intentional for this prototype:
    it makes repeated seed runs deterministic and prevents duplicate rows.
    """
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    location_rows = read_csv("locations.csv")
    asha_rows = read_csv("asha_signals.csv")
    opd_rows = read_csv("opd_signals.csv")
    pharmacy_rows = read_csv("pharmacy_signals.csv")
    environment_rows = read_csv("environment_signals.csv")

    with Session(engine) as session:
        session.add_all([
            Location(
                location_id=row["location_id"], name=row["location_name"], type=row["location_type"],
                block=row["block"], district=row["district"], latitude=row["latitude"], longitude=row["longitude"],
            )
            for row in location_rows
        ])
        session.add_all([AshaSignal(**row) for row in without_source_signal_id(asha_rows)])
        session.add_all([OpdSignal(**row) for row in without_source_signal_id(opd_rows)])
        session.add_all([PharmacySignal(**row) for row in without_source_signal_id(pharmacy_rows)])
        session.add_all([EnvironmentSignal(**row) for row in without_source_signal_id(environment_rows)])

        # Phase 4 owns storage only. Phase 5 replaces these with calculated risk scores.
        session.add_all([
            RiskScore(location_id=row["location_id"], score_0_100=0, cluster_id=None, model_version="phase4-placeholder")
            for row in location_rows
        ])
        session.commit()

    return {
        "locations": len(location_rows), "asha_signals": len(asha_rows), "opd_signals": len(opd_rows),
        "pharmacy_signals": len(pharmacy_rows), "environment_signals": len(environment_rows),
        "placeholder_risk_scores": len(location_rows),
    }
