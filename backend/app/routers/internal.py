from fastapi import APIRouter
from ml.risk_engine import run_risk_pipeline

router = APIRouter(prefix="/internal", tags=["internal"])


@router.post("/run-risk")
def trigger_risk_run():
    """Dev-only endpoint: recompute risk scores from database signals."""
    result = run_risk_pipeline()
    return {
        "status": "success",
        "model_version": result["model_version"],
        "locations_evaluated": result["locations_evaluated"],
        "scores_saved": result["scores_saved"],
        "highest_risk_score": result["highest_risk_score"],
        "high_risk_locations_count": result["high_risk_locations_count"],
        "clusters_found": result["clusters_found"],
        "alert_summary": result["alert_summary"],
        "data_mode": "synthetic",
        "not_a_diagnosis": True,
    }
