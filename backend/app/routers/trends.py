from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import AshaSignal, EnvironmentSignal, Location, OpdSignal, PharmacySignal, RiskScore
from ..services.simulation import location_effect


router = APIRouter(prefix="/signals", tags=["trends"])


def percent_change(current: float, baseline: float) -> float:
    if baseline == 0:
        return 0.0
    return round((current - baseline) / baseline * 100.0, 1)


@router.get("/trends/{location_id}")
def signal_trends(location_id: str, days: int = 14, db: Session = Depends(get_db)):
    location = db.scalar(select(Location).where(Location.location_id == location_id))
    if location is None:
        raise HTTPException(status_code=404, detail="Synthetic location not found")
    risk = db.scalar(select(RiskScore).where(RiskScore.location_id == location_id))
    if risk is None:
        raise HTTPException(status_code=404, detail="Synthetic location risk not found")

    asha_rows = db.scalars(select(AshaSignal).where(AshaSignal.location_id == location_id)).all()
    opd_rows = db.scalars(select(OpdSignal).where(OpdSignal.location_id == location_id)).all()
    pharmacy_rows = db.scalars(select(PharmacySignal).where(PharmacySignal.location_id == location_id)).all()
    environment_rows = db.scalars(select(EnvironmentSignal).where(EnvironmentSignal.location_id == location_id)).all()
    dates = sorted({row.date for row in asha_rows})
    end_date = datetime.fromisoformat(dates[-1]).date()
    start_date = end_date - timedelta(days=max(1, days) - 1)
    baseline_start = start_date - timedelta(days=30)

    def in_range(value: str, start, end) -> bool:
        current = datetime.fromisoformat(value).date()
        return start <= current <= end

    def daily_values(rows, value_field: str, predicate) -> dict[str, float]:
        values: dict[str, float] = defaultdict(float)
        for row in rows:
            if predicate(row) and in_range(row.date, baseline_start, end_date):
                values[row.date] += float(getattr(row, value_field))
        return values

    asha = daily_values(asha_rows, "case_count", lambda row: row.syndrome in {"fever", "diarrhea"})
    opd = daily_values(opd_rows, "patient_count", lambda row: row.syndrome in {"fever", "diarrhea"})
    pharmacy = daily_values(pharmacy_rows, "units_sold", lambda row: row.product_group in {"ORS", "fever_medicine"})
    rainfall = daily_values(environment_rows, "rainfall_mm", lambda row: True)
    water_risk = daily_values(environment_rows, "water_risk_index", lambda row: True)

    def median(values: list[float]) -> float:
        ordered = sorted(values)
        if not ordered:
            return 0.0
        middle = len(ordered) // 2
        return ordered[middle] if len(ordered) % 2 else (ordered[middle - 1] + ordered[middle]) / 2

    baseline_dates = [(start_date - timedelta(days=index)).isoformat() for index in range(1, 31)]
    baselines = {
        "asha": median([asha[date] for date in baseline_dates if date in asha]),
        "opd": median([opd[date] for date in baseline_dates if date in opd]),
        "pharmacy": median([pharmacy[date] for date in baseline_dates if date in pharmacy]),
        "rainfall": median([rainfall[date] for date in baseline_dates if date in rainfall]),
        "water_risk": median([water_risk[date] for date in baseline_dates if date in water_risk]),
    }
    effect = location_effect(location_id)
    series = []
    for index in range(max(1, days)):
        date = (start_date + timedelta(days=index)).isoformat()
        values = {
            "asha_reports": round(asha.get(date, 0.0) * effect["asha"], 1),
            "opd_visits": round(opd.get(date, 0.0) * effect["opd"], 1),
            "pharmacy_demand": round(pharmacy.get(date, 0.0) * effect["pharmacy"], 1),
            "rainfall_mm": round(rainfall.get(date, 0.0) * effect["environment"], 1),
            "water_risk_index": round(water_risk.get(date, 0.0) * effect["environment"], 3),
        }
        series.append({"date": date, **values})

    current = series[-1]
    comparisons = {
        "asha_reports": {"current": current["asha_reports"], "baseline": round(baselines["asha"], 1), "percent_change": percent_change(current["asha_reports"], baselines["asha"])},
        "opd_visits": {"current": current["opd_visits"], "baseline": round(baselines["opd"], 1), "percent_change": percent_change(current["opd_visits"], baselines["opd"])},
        "pharmacy_demand": {"current": current["pharmacy_demand"], "baseline": round(baselines["pharmacy"], 1), "percent_change": percent_change(current["pharmacy_demand"], baselines["pharmacy"])},
        "rainfall_mm": {"current": current["rainfall_mm"], "baseline": round(baselines["rainfall"], 1), "percent_change": percent_change(current["rainfall_mm"], baselines["rainfall"])},
        "water_risk_index": {"current": current["water_risk_index"], "baseline": round(baselines["water_risk"], 3), "percent_change": percent_change(current["water_risk_index"], baselines["water_risk"])},
    }
    risk_trend = []
    for point in series:
        trend_ratio = point["asha_reports"] / max(baselines["asha"], 1.0)
        trend_score = risk.score_0_100 * (0.7 + 0.3 * trend_ratio)
        risk_trend.append({
            "date": point["date"],
            "score_0_100": round(min(100.0, max(0.0, trend_score)), 1),
        })
    return {
        "location_id": location_id,
        "window_days": days,
        "series": series,
        "risk_trend": risk_trend,
        "comparisons": comparisons,
        "simulation_effect": effect,
        "data_mode": "synthetic_simulation",
        "not_a_diagnosis": True,
    }