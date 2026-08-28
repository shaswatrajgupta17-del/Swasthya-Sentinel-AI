from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Alert, Location


router = APIRouter(prefix="/alerts", tags=["alerts"])


def alert_response(alert: Alert, location: Location | None = None) -> dict:
    return {
        "id": alert.id,
        "location_id": alert.location_id,
        "location_name": location.name if location else alert.location_id,
        "severity": alert.severity,
        "status": alert.status,
        "created_at": alert.created_at.isoformat() if hasattr(alert.created_at, "isoformat") else str(alert.created_at),
        "data_mode": "synthetic",
        "not_a_diagnosis": True,
    }


@router.get("")
def list_alerts(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Alert, Location)
        .outerjoin(Location, Location.location_id == Alert.location_id)
        .order_by(Alert.created_at.desc())
    ).all()
    return [alert_response(alert, location) for alert, location in rows]


@router.post("/{alert_id}/ack")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Synthetic alert not found")
    alert.status = "acknowledged"
    db.commit()
    db.refresh(alert)
    location = db.execute(select(Location).where(Location.location_id == alert.location_id)).scalar_one_or_none()
    return alert_response(alert, location)
