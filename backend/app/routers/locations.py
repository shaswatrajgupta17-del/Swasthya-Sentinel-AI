from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Location


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
