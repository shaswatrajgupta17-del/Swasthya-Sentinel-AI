from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Location, RiskFactor, RiskScore
from ..services.simulation import apply_to_risk, get_status, location_effect


router = APIRouter(prefix="/risks", tags=["risks"])

# Which ASHA syndromes map to which factor names
SYNDROME_FACTOR_MAP = {
    "fever": {"ASHA Syndromic Reports", "OPD Clinical Visits", "Pharmacy Product Demand"},
    "diarrhea": {"ASHA Syndromic Reports", "OPD Clinical Visits", "Pharmacy Product Demand"},
    "cough": {"ASHA Syndromic Reports", "OPD Clinical Visits"},
    "rash": {"ASHA Syndromic Reports"},
    "all": None,  # None = no filter
}


def risk_response(
    risk: RiskScore,
    location: Location,
    factors: list[RiskFactor] | None = None,
    syndrome: str = "all",
) -> dict:
    simulation_effect = location_effect(risk.location_id)
    live_score = apply_to_risk(risk.location_id, risk.score_0_100)

    # For syndrome-specific filtering, downweight unrelated factors
    relevant_factors = SYNDROME_FACTOR_MAP.get(syndrome.lower(), None)

    factor_multipliers = {
        "ASHA Syndromic Reports": simulation_effect["asha"],
        "OPD Clinical Visits": simulation_effect["opd"],
        "Pharmacy Product Demand": simulation_effect["pharmacy"],
        "Multi-Source Corroboration": (simulation_effect["asha"] + simulation_effect["opd"] + simulation_effect["pharmacy"]) / 3,
        "Spatial Cluster Grouping": 1.0,
        "Environmental Indicators": simulation_effect["environment"],
    }

    active_factors = []
    for factor in (factors or []):
        mult = factor_multipliers.get(factor.factor_name, 1.0)
        # If syndrome filter active, non-relevant factors contribute less
        if relevant_factors is not None and factor.factor_name not in relevant_factors:
            mult *= 0.15
        active_factors.append((factor, mult))

    raw_live = [factor.contribution * mult for factor, mult in active_factors]
    live_total = sum(raw_live)

    # Recompute live_score for syndrome-filtered view
    if relevant_factors is not None and live_total > 0:
        # Scale relative to original live_score proportionally
        live_score = round(min(100.0, live_score * (live_total / sum(
            factor.contribution * factor_multipliers.get(factor.factor_name, 1.0)
            for factor in (factors or [])
        ) if sum(factor.contribution * factor_multipliers.get(factor.factor_name, 1.0) for factor in (factors or [])) else 1)), 1)

    live_contributions = []
    for raw in raw_live:
        live_contributions.append(round(raw / live_total * live_score, 1) if live_total else 0.0)
    if live_contributions:
        live_contributions[-1] = round(live_contributions[-1] + live_score - sum(live_contributions), 1)

    for (factor, _), live_contribution in zip(active_factors, live_contributions):
        factor.live_contribution = live_contribution
        factor.live_percentage = round(live_contribution / live_score * 100.0, 1) if live_score else 0.0

    factor_list = [
        {
            "factor_name": factor.factor_name,
            "contribution": factor.contribution,
            "percentage": factor.percentage,
            "live_contribution": getattr(factor, "live_contribution", factor.contribution),
            "live_percentage": getattr(factor, "live_percentage", factor.percentage),
            "note": factor.note,
        }
        for factor, _ in active_factors
    ]

    # Determine main signal for plain-language display
    main_signal = "Fever & Diarrhea"
    if syndrome != "all":
        main_signal = syndrome.capitalize()

    # Build plain-language flag reason
    flag_reason = _plain_flag_reason(live_score, factor_list)

    return {
        "location_id": risk.location_id,
        "location_name": location.name,
        "block": location.block,
        "district": location.district,
        "score_0_100": live_score,
        "persisted_score_0_100": risk.score_0_100,
        "cluster_id": risk.cluster_id,
        "window_start": risk.window_start,
        "window_end": risk.window_end,
        "model_version": risk.model_version,
        "factors": factor_list,
        "simulation_effect": simulation_effect,
        "simulation": get_status(),
        "main_signal": main_signal,
        "flag_reason": flag_reason,
        "syndrome_filter": syndrome,
        "data_mode": "synthetic",
        "not_a_diagnosis": True,
    }


def _plain_flag_reason(score: float, factors: list[dict]) -> str:
    if score < 40:
        return "Health signals are within the expected normal range."
    top = sorted(factors, key=lambda f: f["live_contribution"], reverse=True)[:2]
    names = [_plain_factor_name(f["factor_name"]) for f in top]
    if score >= 70:
        return f"ASHA reports and {', '.join(names)} are significantly above recent normal levels. This village needs review."
    return f"{names[0] if names else 'Health signals'} are moderately above normal. Continue monitoring."


def _plain_factor_name(technical_name: str) -> str:
    mapping = {
        "ASHA Syndromic Reports": "ASHA community health reports",
        "OPD Clinical Visits": "clinic visits (OPD)",
        "Pharmacy Product Demand": "pharmacy medicine purchases",
        "Multi-Source Corroboration": "multiple sources agree",
        "Spatial Cluster Grouping": "nearby villages also flagged",
        "Environmental Indicators": "environment factors",
    }
    return mapping.get(technical_name, technical_name)


@router.get("")
def list_risks(syndrome: str = Query(default="all"), db: Session = Depends(get_db)):
    rows = db.execute(
        select(RiskScore, Location)
        .join(Location, Location.location_id == RiskScore.location_id)
        .order_by(RiskScore.score_0_100.desc(), Location.name)
    ).all()

    all_factors = db.execute(select(RiskFactor).order_by(RiskFactor.id)).scalars().all()
    factors_by_loc: dict[str, list[RiskFactor]] = {}
    for f in all_factors:
        factors_by_loc.setdefault(f.location_id, []).append(f)

    return [
        risk_response(risk, location, factors_by_loc.get(risk.location_id, []), syndrome)
        for risk, location in rows
    ]


@router.get("/{location_id}")
def get_risk(location_id: str, syndrome: str = Query(default="all"), db: Session = Depends(get_db)):
    row = db.execute(
        select(RiskScore, Location)
        .join(Location, Location.location_id == RiskScore.location_id)
        .where(RiskScore.location_id == location_id)
    ).one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Synthetic location risk not found")
    risk, location = row

    factors = db.execute(
        select(RiskFactor)
        .where(RiskFactor.location_id == location_id)
        .order_by(RiskFactor.id)
    ).scalars().all()

    return risk_response(risk, location, factors, syndrome)
