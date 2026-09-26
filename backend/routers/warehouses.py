from fastapi import APIRouter

router = APIRouter(
    prefix="/warehouses",
    tags=["Warehouses"]
)

@router.post("/warehouse_management")
async def warehouse_management():
    return {"warehouse_management": "Not implemented"}

@router.post("/location_management")
async def location_management():
    return {"location_management": "Not implemented"}

