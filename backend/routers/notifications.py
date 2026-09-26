from fastapi import APIRouter

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

@router.post("/alerts")
async def alerts():
    return {"alerts": "Not implemented"}

