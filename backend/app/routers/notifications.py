import os
from datetime import datetime, timezone

from fastapi import APIRouter


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/status")
def notification_status():
    configured = bool(os.getenv("SENTINEL_NOTIFICATION_WEBHOOK_URL"))
    return {
        "runtime": "n8n",
        "configured": configured,
        "connection_state": "configured" if configured else "not_connected",
        "webhook_configured": configured,
        "last_execution": None,
        "recent_events": [],
        "message": "n8n runtime not connected" if not configured else "Webhook configured; n8n execution is external",
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "data_mode": "synthetic",
        "not_a_diagnosis": True,
    }