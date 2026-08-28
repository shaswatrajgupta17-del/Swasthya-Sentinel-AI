from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..services.simulation import SCENARIOS, get_status, pause, reset, start


router = APIRouter(prefix="/simulation", tags=["simulation"])


class SimulationRequest(BaseModel):
    scenario: str = "NORMAL"
    speed: float = Field(default=1.0, ge=0.25, le=10.0)


def validate_scenario(scenario: str) -> str:
    normalized = scenario.upper()
    if normalized not in SCENARIOS:
        raise HTTPException(status_code=422, detail=f"Unknown synthetic scenario: {scenario}")
    return normalized


@router.get("/status")
def simulation_status():
    return get_status()


@router.post("/start")
def simulation_start(request: SimulationRequest):
    return start(validate_scenario(request.scenario), request.speed)


@router.post("/pause")
def simulation_pause():
    return pause()


@router.post("/reset")
def simulation_reset():
    return reset()
