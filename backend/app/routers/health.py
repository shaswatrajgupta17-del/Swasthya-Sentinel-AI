from fastapi import APIRouter


router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    return {"status": "ok", "data_mode": "synthetic", "not_a_diagnosis": True}
