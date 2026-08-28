from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Location, RiskFactor, RiskScore


router = APIRouter(prefix="/risks", tags=["risks"])


def risk_response(risk: RiskScore, location: Location, factors: list[RiskFactor] | None = None) -> dict:
    factor_list = []
    if factors:
        factor_list = [
            {
                "factor_name": f.factor_name,
                "contribution": f.contribution,
                "percentage": f.percentage,
                "note": f.note,
            }
            for f in factors
        ]

    return {
        "location_id": risk.location_id,
        "location_name": location.name,
        "block": location.block,
        "district": location.district,
        "score_0_100": risk.score_0_100,
        "cluster_id": risk.cluster_id,
        "window_start": risk.window_start,
        "window_end": risk.window_end,
        "model_version": risk.model_version,
        "factors": factor_list,
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
