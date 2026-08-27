"""Command-line entry point for recreating the local synthetic SQLite database."""

import sys
from pathlib import Path

# Let `python backend/seed_database.py` import the backend package from repo root.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.app.services.seed_service import reset_and_seed_database


if __name__ == "__main__":
    counts = reset_and_seed_database()
    print("Synthetic database seeded successfully.")
    for table, count in counts.items():
        print(f"  {table}: {count}")
