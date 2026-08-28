"""SQLAlchemy table definitions. All health-related rows are synthetic aggregates."""

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    location_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String)
    block: Mapped[str] = mapped_column(String)
    district: Mapped[str] = mapped_column(String)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)


class AshaSignal(Base):
    __tablename__ = "asha_signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    location_id: Mapped[str] = mapped_column(String, index=True)
    date: Mapped[str] = mapped_column(String, index=True)
    syndrome: Mapped[str] = mapped_column(String, index=True)
    case_count: Mapped[int] = mapped_column(Integer)


class OpdSignal(Base):
    __tablename__ = "opd_signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    location_id: Mapped[str] = mapped_column(String, index=True)
    date: Mapped[str] = mapped_column(String, index=True)
    syndrome: Mapped[str] = mapped_column(String, index=True)
    patient_count: Mapped[int] = mapped_column(Integer)


class PharmacySignal(Base):
    __tablename__ = "pharmacy_signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    location_id: Mapped[str] = mapped_column(String, index=True)
    date: Mapped[str] = mapped_column(String, index=True)
    product_group: Mapped[str] = mapped_column(String, index=True)
    units_sold: Mapped[int] = mapped_column(Integer)


class EnvironmentSignal(Base):
    __tablename__ = "environment_signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    location_id: Mapped[str] = mapped_column(String, index=True)
    date: Mapped[str] = mapped_column(String, index=True)
    rainfall_mm: Mapped[float] = mapped_column(Float)
    water_risk_index: Mapped[float] = mapped_column(Float)


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    location_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    window_start: Mapped[str | None] = mapped_column(String, nullable=True)
    window_end: Mapped[str | None] = mapped_column(String, nullable=True)
    score_0_100: Mapped[float] = mapped_column(Float, default=0)
    cluster_id: Mapped[str | None] = mapped_column(String, nullable=True)
    model_version: Mapped[str] = mapped_column(String, default="phase4-placeholder")


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    location_id: Mapped[str] = mapped_column(String, index=True)
    severity: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="open")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    location_id: Mapped[str] = mapped_column(String, index=True)
    factor_name: Mapped[str] = mapped_column(String)
    contribution: Mapped[float] = mapped_column(Float)
    percentage: Mapped[float] = mapped_column(Float)
    note: Mapped[str] = mapped_column(String)

