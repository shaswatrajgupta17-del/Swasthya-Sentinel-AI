from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Location, RiskFactor, RiskScore
from ..services.simulation import apply_to_risk, get_status, location_effect


router = APIRouter(prefix="/risks", tags=["risks"])


def risk_response(risk: RiskScore, location: Location, factors: list[RiskFactor] | None = None) -> dict:
    simulation_effect = location_effect(risk.location_id)
    live_score = apply_to_risk(risk.location_id, risk.score_0_100)
    factor_multipliers = {
        "ASHA Syndromic Reports": simulation_effect["asha"],
        "OPD Clinical Visits": simulation_effect["opd"],
        "Pharmacy Product Demand": simulation_effect["pharmacy"],
        "Multi-Source Corroboration": (simulation_effect["asha"] + simulation_effect["opd"] + simulation_effect["pharmacy"]) / 3,
        "Spatial Cluster Grouping": 1.0,
        "Environmental Indicators": simulation_effect["environment"],
    }
    raw_live = [factor.contribution * factor_multipliers.get(factor.factor_name, 1.0) for factor in factors or []]
    live_total = sum(raw_live)
    live_contributions = []
    for contribution in raw_live:
        live_contributions.append(round(contribution / live_total * live_score, 1) if live_total else 0.0)
    if live_contributions:
        live_contributions[-1] = round(live_contributions[-1] + live_score - sum(live_contributions), 1)
    for factor, live_contribution in zip(factors or [], live_contributions):
        factor.live_contribution = live_contribution
        factor.live_percentage = round(live_contribution / live_score * 100.0, 1) if live_score else 0.0
    factor_list = [
        {
            "factor_name": factor.factor_name,
            "contribution": factor.contribution,
            "percentage": factor.percentage,
            "live_contribution": getattr(factor, "live_contribution", factor.contribution),
            "live_percentage": getattr(factor, "live_percentage", factor.percentage),
            "note": factor.note,
        }
        for factor in factors or []
    ]

    return {
        "location_id": risk.location_id,
        "location_name": location.name,
        "block": location.block,
        "district": location.district,
        "score_0_100": live_score,
        "persisted_score_0_100": risk.score_0_100,
        "cluster_id": risk.cluster_id,
        "window_start": risk.window_start,
        "window_end": risk.window_end,
        "model_version": risk.model_version,
        "factors": factor_list,
        "simulation_effect": simulation_effect,
        "simulation": get_status(),
        "data_mode": "synthetic",
        "not_a_diagnosis": True,
    }


@router.get("")
def list_risks(db: Session = Depends(get_db)):
    rows = db.execute(
        select(RiskScore, Location)
        .join(Location, Location.location_id == RiskScore.location_id)
        .order_by(RiskScore.score_0_100.desc(), Location.name)
    ).all()

    # Query all factors and group by location_id
    all_factors = db.execute(select(RiskFactor).order_by(RiskFactor.id)).scalars().all()
    factors_by_loc: dict[str, list[RiskFactor]] = {}
    for f in all_factors:
        factors_by_loc.setdefault(f.location_id, []).append(f)

    return [risk_response(risk, location, factors_by_loc.get(risk.location_id, [])) for risk, location in rows]


@router.get("/{location_id}")
def get_risk(location_id: str, db: Session = Depends(get_db)):
    row = db.execute(
        select(RiskScore, Location)
        .join(Location, Location.location_id == RiskScore.location_id)
        .where(RiskScore.location_id == location_id)
    ).one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Synthetic location risk not found")
    risk, location = row

    factors = db.execute(
        select(RiskFactor)
        .where(RiskFactor.location_id == location_id)
        .order_by(RiskFactor.id)
    ).scalars().all()

    return risk_response(risk, location, factors)
