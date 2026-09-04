import os
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter


router = APIRouter(prefix="/notifications", tags=["notifications"])

POLLER_NOTE = (
    "n8n is an optional independent poller of GET /alerts?status=open. "
    "FastAPI does not push alerts to n8n and cannot observe whether n8n is running."
)


@router.get("/status")
def notification_status():
    """Phase 7 poller status. Env on this process is not an n8n connection."""
    webhook_configured = bool(os.getenv("SENTINEL_NOTIFICATION_WEBHOOK_URL"))
    return {
        "runtime": "n8n_poll",
        # Frontend uses `configured` as "n8n connected". FastAPI cannot observe the poller.
        "configured": False,
        "connection_state": "not_observed",
        "webhook_configured": webhook_configured,
        "last_execution": None,
        "recent_events": [],
        "poll_endpoint": "/alerts?status=open",
        "pushes_alerts_to_n8n": False,
        "message": (
            POLLER_NOTE
            + (
                " SENTINEL_NOTIFICATION_WEBHOOK_URL is set on FastAPI only for POST /notifications/test "
                "(a demo catcher). That does not mean n8n is connected or receiving alerts."
                if webhook_configured
                else " SENTINEL_NOTIFICATION_WEBHOOK_URL is unset on FastAPI, which is expected for polling. "
                "If n8n should POST a demo notification, set that variable on the n8n process, not as proof of connection here."
            )
        ),
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "data_mode": "synthetic",
        "not_a_diagnosis": True,
    }


@router.post("/test")
async def test_notification():
    """POST a synthetic test payload to an optional FastAPI-side demo webhook.

    This does not notify n8n, does not create alerts, and does not prove the poller is running.
    """
    webhook_url = os.getenv("SENTINEL_NOTIFICATION_WEBHOOK_URL")
    if not webhook_url:
        return {
            "success": False,
            "message": (
                "No FastAPI-side demo webhook is set (SENTINEL_NOTIFICATION_WEBHOOK_URL). "
                "This test does not talk to n8n. n8n polls GET /alerts?status=open independently."
            ),
            "sent_at": None,
            "data_mode": "synthetic",
            "not_a_diagnosis": True,
        }

    test_payload = {
        "alert_type": "test",
        "alert_id": 0,
        "location_id": "loc_001",
        "location_name": "Rampur (Test)",
        "severity": "test",
        "risk_score": 0.0,
        "message": (
            "This is a test notification from Swasthya Sentinel AI (SIH Demo). "
            "It is not an n8n poll and not a diagnosis."
        ),
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
                "message": (
                    "Test payload posted to the FastAPI-side demo webhook. "
                    "This is not n8n and does not mean the poller received alerts."
                    if success
                    else (
                        f"Demo webhook responded with HTTP {resp.status_code}. "
                        "This test does not talk to n8n."
                    )
                ),
                "sent_at": test_payload["sent_at"],
                "data_mode": "synthetic",
                "not_a_diagnosis": True,
            }
    except Exception as exc:
        return {
            "success": False,
            "message": (
                f"Could not reach the FastAPI-side demo webhook: {type(exc).__name__}. "
                "This test does not talk to n8n."
            ),
            "sent_at": test_payload["sent_at"],
            "data_mode": "synthetic",
            "not_a_diagnosis": True,
        }

@router.post("/demo-receiver")
async def demo_receiver(payload: dict):
    """Receive demo notifications from n8n."""
    print("\n========== N8N DEMO NOTIFICATION ==========")
    print(f"Location : {payload.get('location_name')}")
    print(f"Score    : {payload.get('score_0_100')}")
    print(f"Severity : {payload.get('severity')}")
    print(f"Cluster  : {payload.get('cluster_id')}")
    print(f"Factors  : {payload.get('top_factors')}")
    print("============================================\n")

    return {
        "success": True,
        "message": "Demo notification received from n8n",
        "data_mode": "synthetic",
        "not_a_diagnosis": True,
    }
