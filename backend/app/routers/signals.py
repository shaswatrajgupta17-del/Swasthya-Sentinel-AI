from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import AshaSignal, EnvironmentSignal, OpdSignal, PharmacySignal


router = APIRouter(prefix="/signals", tags=["signals"])


@router.get("/summary")
def signal_summary(db: Session = Depends(get_db)):
    """Return aggregate totals only; individual health records do not exist in this prototype."""
    asha_total = db.scalar(select(func.coalesce(func.sum(AshaSignal.case_count), 0)))
    opd_total = db.scalar(select(func.coalesce(func.sum(OpdSignal.patient_count), 0)))
    pharmacy_total = db.scalar(select(func.coalesce(func.sum(PharmacySignal.units_sold), 0)))
    date_start = db.scalar(select(func.min(AshaSignal.date)))
    date_end = db.scalar(select(func.max(AshaSignal.date)))
    environment_days = db.scalar(select(func.count(EnvironmentSignal.id)))

    return {
        "data_mode": "synthetic", "not_a_diagnosis": True,
        "date_range": {"start": date_start, "end": date_end},
        "totals": {"asha_case_count": asha_total, "opd_patient_count": opd_total,
                   "pharmacy_units_sold": pharmacy_total, "environment_observations": environment_days},
    }
