"""
ml/ — Swasthya Sentinel AI risk engine package.

This package computes synthetic-data anomaly scores, spatial clusters, and
0-100 risk scores. It writes results to the shared SQLite database and is
called by FastAPI and the CLI runner. It never handles patient-level data
and does not diagnose disease.
"""
