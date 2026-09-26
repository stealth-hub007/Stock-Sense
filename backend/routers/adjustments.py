from fastapi import APIRouter

router = APIRouter(
    prefix="/adjustments",
    tags=["Adjustments"]
)

@router.post("/physical_count")
async def physical_count():
    return {"physical_count": "Not implemented"}

@router.post("/compare_stock")
async def compare_stock():
    return {"compare_stock": "Not implemented"}

@router.post("/adjust_stock")
async def adjust_stock():
    return {"adjust_stock": "Not implemented"}

