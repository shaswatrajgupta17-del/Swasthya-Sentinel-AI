from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Location, RiskScore


router = APIRouter(prefix="/risks", tags=["risks"])


def risk_response(risk: RiskScore, location: Location) -> dict:
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
    return [risk_response(risk, location) for risk, location in rows]


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
    return risk_response(risk, location)
