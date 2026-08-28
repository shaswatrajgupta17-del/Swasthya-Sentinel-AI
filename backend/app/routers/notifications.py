import os
from datetime import datetime, timezone

import httpx
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
        "message": "Notification service not connected. Set SENTINEL_NOTIFICATION_WEBHOOK_URL to enable." if not configured else "Webhook configured. n8n will receive alerts automatically.",
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "data_mode": "synthetic",
        "not_a_diagnosis": True,
    }


@router.post("/test")
async def test_notification():
    """Send a test payload to the configured webhook. Returns result honestly."""
    webhook_url = os.getenv("SENTINEL_NOTIFICATION_WEBHOOK_URL")
    if not webhook_url:
        return {
            "success": False,
            "message": "Notification service not connected. Set SENTINEL_NOTIFICATION_WEBHOOK_URL environment variable to enable.",
            "sent_at": None,
            "data_mode": "synthetic",
        }

    test_payload = {
        "alert_type": "test",
        "alert_id": 0,
        "location_id": "loc_001",
        "location_name": "Rampur (Test)",
        "severity": "test",
        "risk_score": 0.0,
        "message": "This is a test notification from Swasthya Sentinel AI (SIH Demo).",
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "data_mode": "synthetic_demonstration",
        "not_a_diagnosis": True,
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(webhook_url, json=test_payload)
            success = resp.status_code < 400
            return {
                "success": success,
                "http_status": resp.status_code,
                "message": "Test notification sent successfully." if success else f"Webhook responded with HTTP {resp.status_code}.",
                "sent_at": test_payload["sent_at"],
                "data_mode": "synthetic",
            }
    except Exception as exc:
        return {
            "success": False,
            "message": f"Could not reach webhook: {type(exc).__name__}.",
            "sent_at": test_payload["sent_at"],
            "data_mode": "synthetic",
        }