from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Location, RiskScore


router = APIRouter(prefix="/locations", tags=["locations"])


@router.get("")
def list_locations(db: Session = Depends(get_db)):
    locations = db.scalars(select(Location).order_by(Location.name)).all()
    return [
        {"location_id": item.location_id, "name": item.name, "type": item.type, "block": item.block,
         "district": item.district, "latitude": item.latitude, "longitude": item.longitude,
         "data_mode": "synthetic"}
        for item in locations
    ]


@router.get("/{location_id}")
def get_location(location_id: str, db: Session = Depends(get_db)):
    location = db.scalar(select(Location).where(Location.location_id == location_id))
    if location is None:
        raise HTTPException(status_code=404, detail="Synthetic location not found")
    risk = db.scalar(select(RiskScore).where(RiskScore.location_id == location_id))
    return {
        "location_id": location.location_id, "name": location.name, "type": location.type,
        "block": location.block, "district": location.district, "latitude": location.latitude,
        "longitude": location.longitude, "risk_score": risk.score_0_100 if risk else None,
        "model_version": risk.model_version if risk else None, "data_mode": "synthetic",
        "not_a_diagnosis": True,
    }
