from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Alert


router = APIRouter(prefix="/alerts", tags=["alerts"])


def alert_response(alert: Alert) -> dict:
    return {"id": alert.id, "location_id": alert.location_id, "severity": alert.severity,
            "status": alert.status, "created_at": alert.created_at.isoformat(), "data_mode": "synthetic"}


@router.get("")
def list_alerts(db: Session = Depends(get_db)):
    return [alert_response(alert) for alert in db.scalars(select(Alert).order_by(Alert.created_at.desc())).all()]


@router.post("/{alert_id}/ack")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Synthetic alert not found")
    alert.status = "acknowledged"
    db.commit()
    db.refresh(alert)
    return alert_response(alert)
