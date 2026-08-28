from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Location, RiskFactor, RiskScore
from ..services.simulation import apply_to_risk, get_status


router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("")
def get_insights(db: Session = Depends(get_db)):
    rows = db.execute(select(RiskScore, Location).join(Location, Location.location_id == RiskScore.location_id)).all()
    simulation = get_status()
    current_scores = [apply_to_risk(risk.location_id, risk.score_0_100) for risk, _ in rows]
    anomalies = [score for score in current_scores if score >= 40]
    factors = db.scalars(select(RiskFactor).order_by(RiskFactor.contribution.desc())).all()
    factor_totals: dict[str, float] = {}
    for factor in factors:
        factor_totals[factor.factor_name] = factor_totals.get(factor.factor_name, 0.0) + factor.contribution

    return {
        "model_status": "ready",
        "model_name": "Transparent weighted anomaly engine",
        "model_version": "phase5-v1",
        "last_inference": simulation["last_update"],
        "locations_analyzed": len(rows),
        "anomalies_detected": len(anomalies),
        "clusters_detected": len({risk.cluster_id for risk, _ in rows if risk.cluster_id}),
        "highest_anomaly": round(max(current_scores, default=0.0), 1),
        "top_signal_types": [name for name, _ in sorted(factor_totals.items(), key=lambda item: item[1], reverse=True)[:4]],
        "simulation": simulation,
        "logic_note": "Risk scores use persisted transparent factors; simulation adds deterministic scenario deltas without rewriting historical data.",
        "data_mode": "synthetic",
        "not_a_diagnosis": True,
    }
