from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Alert, Location, RiskFactor, RiskScore


router = APIRouter(prefix="/alerts", tags=["alerts"])


def alert_response(
    alert: Alert,
    location: Location | None = None,
    risk: RiskScore | None = None,
    factors: list[RiskFactor] | None = None,
) -> dict:
    top_factors = [
        {"factor_name": factor.factor_name, "contribution": factor.contribution, "note": factor.note}
        for factor in sorted(factors or [], key=lambda factor: factor.contribution, reverse=True)[:3]
    ]
    return {
        "id": alert.id,
        "location_id": alert.location_id,
        "location_name": location.name if location else alert.location_id,
        "severity": alert.severity,
        "status": alert.status,
        "created_at": alert.created_at.isoformat() if hasattr(alert.created_at, "isoformat") else str(alert.created_at),
        "score_0_100": risk.score_0_100 if risk else None,
        "cluster_id": risk.cluster_id if risk else None,
        "model_version": risk.model_version if risk else None,
        "top_factors": top_factors,
        "data_mode": "synthetic",
        "not_a_diagnosis": True,
    }


@router.get("")
def list_alerts(status: str | None = Query(default=None), db: Session = Depends(get_db)):
    rows = db.execute(
        select(Alert, Location, RiskScore)
        .outerjoin(Location, Location.location_id == Alert.location_id)
        .outerjoin(RiskScore, RiskScore.location_id == Alert.location_id)
        .where(Alert.status == status if status else True)
        .order_by(Alert.created_at.desc())
    ).all()
    factor_rows = db.execute(select(RiskFactor).order_by(RiskFactor.contribution.desc())).scalars().all()
    factors_by_location: dict[str, list[RiskFactor]] = {}
    for factor in factor_rows:
        factors_by_location.setdefault(factor.location_id, []).append(factor)
    return [
        alert_response(alert, location, risk, factors_by_location.get(alert.location_id, []))
        for alert, location, risk in rows
    ]


@router.post("/{alert_id}/ack")
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Synthetic alert not found")
    alert.status = "acknowledged"
    db.commit()
    db.refresh(alert)
    location = db.execute(select(Location).where(Location.location_id == alert.location_id)).scalar_one_or_none()
    risk = db.execute(select(RiskScore).where(RiskScore.location_id == alert.location_id)).scalar_one_or_none()
    factors = db.execute(
        select(RiskFactor)
        .where(RiskFactor.location_id == alert.location_id)
        .order_by(RiskFactor.contribution.desc())
    ).scalars().all()
    return alert_response(alert, location, risk, factors)
