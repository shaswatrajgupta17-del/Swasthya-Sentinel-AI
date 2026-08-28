"""
ml/ — Swasthya Sentinel AI risk engine package.

This package computes synthetic-data anomaly scores, spatial clusters, and
0-100 risk scores. It writes results to the shared SQLite database and is
called by FastAPI and the CLI runner. It never handles patient-level data
and does not diagnose disease.
"""

from .features import build_features, load_locations
from .risk_engine import (
    MODEL_VERSION,
    calculate_risk_scores,
    generate_high_risk_alerts,
    run_risk_pipeline,
    save_risk_scores,
)

__all__ = [
    "MODEL_VERSION",
    "build_features",
    "load_locations",
    "calculate_risk_scores",
    "save_risk_scores",
    "generate_high_risk_alerts",
    "run_risk_pipeline",
]
