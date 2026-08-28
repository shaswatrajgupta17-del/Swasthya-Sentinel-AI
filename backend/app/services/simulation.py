"""Deterministic live-surveillance simulation state for the local demo."""

from __future__ import annotations

import math
import threading
import time
from datetime import datetime, timezone
from typing import Any


SCENARIOS = {
    "NORMAL": "Signals fluctuate around baseline",
    "FEVER CLUSTER": "Fever signals rise in nearby East Block locations",
    "RESPIRATORY CLUSTER": "Respiratory signals rise in nearby North Block locations",
    "PHARMACY SURGE": "Medicine demand rises before clinical signals",
    "ENVIRONMENTAL EVENT": "Environmental indicators move across selected locations",
}

_CLUSTER_LOCATIONS = {"loc_001", "loc_002", "loc_003"}
_RESPIRATORY_LOCATIONS = {"loc_005", "loc_006", "loc_007"}
_ENVIRONMENT_LOCATIONS = {"loc_004", "loc_008", "loc_009"}

_lock = threading.Lock()
_state: dict[str, Any] = {
    "running": False,
    "scenario": "NORMAL",
    "speed": 1.0,
    "tick": 0,
    "last_update": None,
    "started_monotonic": None,
    "started_tick": 0,
}


def _advance_locked() -> None:
    if not _state["running"] or _state["started_monotonic"] is None:
        return
    elapsed = time.monotonic() - _state["started_monotonic"]
    _state["tick"] = _state["started_tick"] + int(elapsed * _state["speed"] / 3)
    _state["last_update"] = datetime.now(timezone.utc).isoformat()


def _status_locked() -> dict[str, Any]:
    _advance_locked()
    tick = _state["tick"]
    return {
        "running": _state["running"],
        "scenario": _state["scenario"],
        "scenario_description": SCENARIOS[_state["scenario"]],
        "speed": _state["speed"],
        "tick": tick,
        "last_update": _state["last_update"],
        "next_update_seconds": round(max(1.0, 3.0 / _state["speed"]), 1),
        "data_mode": "synthetic_simulation",
        "not_a_diagnosis": True,
    }


def get_status() -> dict[str, Any]:
    with _lock:
        return _status_locked()


def start(scenario: str | None = None, speed: float | None = None) -> dict[str, Any]:
    with _lock:
        if scenario:
            _state["scenario"] = scenario.upper()
        if speed is not None:
            _state["speed"] = min(10.0, max(0.25, float(speed)))
        _advance_locked()
        _state["running"] = True
        _state["started_tick"] = _state["tick"]
        _state["started_monotonic"] = time.monotonic()
        _state["last_update"] = datetime.now(timezone.utc).isoformat()
        return _status_locked()


def pause() -> dict[str, Any]:
    with _lock:
        _advance_locked()
        _state["running"] = False
        _state["started_monotonic"] = None
        _state["last_update"] = datetime.now(timezone.utc).isoformat()
        return _status_locked()


def reset() -> dict[str, Any]:
    with _lock:
        _state.update({
            "running": False,
            "scenario": "NORMAL",
            "speed": 1.0,
            "tick": 0,
            "last_update": datetime.now(timezone.utc).isoformat(),
            "started_monotonic": None,
            "started_tick": 0,
        })
        return _status_locked()


def _wave(tick: int, phase: int = 0) -> float:
    return math.sin((tick + phase) / 2.0) * 0.04


def location_effect(location_id: str) -> dict[str, float]:
    """Return deterministic signal multipliers and score delta for one location."""
    with _lock:
        status = _status_locked()
        tick = status["tick"]
        scenario = status["scenario"]

    effect = {"asha": 1.0, "opd": 1.0, "pharmacy": 1.0, "environment": 1.0, "risk_delta": 0.0}
    drift = _wave(tick, sum(ord(char) for char in location_id) % 7)
    effect.update({"asha": 1.0 + drift, "opd": 1.0 + drift, "pharmacy": 1.0 + drift, "environment": 1.0 + drift})

    if scenario == "FEVER CLUSTER" and location_id in _CLUSTER_LOCATIONS:
        pulse = 0.22 + 0.05 * math.sin(tick / 2.0)
        effect.update({"asha": 1.0 + pulse, "opd": 1.0 + pulse * 0.8, "pharmacy": 1.0 + pulse * 0.55, "risk_delta": 11.0 + tick % 4})
    elif scenario == "RESPIRATORY CLUSTER" and location_id in _RESPIRATORY_LOCATIONS:
        pulse = 0.18 + 0.04 * math.sin(tick / 2.0)
        effect.update({"asha": 1.0 + pulse, "opd": 1.0 + pulse * 0.9, "pharmacy": 1.0 + pulse * 0.7, "risk_delta": 9.0 + tick % 3})
    elif scenario == "PHARMACY SURGE" and location_id in _CLUSTER_LOCATIONS:
        pulse = 0.28 + 0.06 * math.sin(tick / 2.0)
        effect.update({"pharmacy": 1.0 + pulse, "risk_delta": 7.0 + tick % 3})
    elif scenario == "ENVIRONMENTAL EVENT" and location_id in _ENVIRONMENT_LOCATIONS:
        pulse = 0.24 + 0.04 * math.sin(tick / 2.0)
        effect.update({"environment": 1.0 + pulse, "risk_delta": 6.0 + tick % 3})

    return effect


def apply_to_risk(location_id: str, score: float) -> float:
    effect = location_effect(location_id)
    return round(min(100.0, max(0.0, score + effect["risk_delta"])), 1)
