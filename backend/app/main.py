from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import alerts, health, locations, risks, signals


app = FastAPI(
    title="Swasthya Sentinel AI API",
    description="Synthetic rural health signal prototype. Not a medical diagnosis service.",
    version="0.1.0",
)

# Vite's usual local ports. Do not open this development API to arbitrary origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(health.router)
app.include_router(locations.router)
app.include_router(signals.router)
app.include_router(risks.router)
app.include_router(alerts.router)
