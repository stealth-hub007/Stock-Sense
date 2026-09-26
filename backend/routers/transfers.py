from fastapi import APIRouter

router = APIRouter(
    prefix="/transfers",
    tags=["Transfers"]
)

@router.post("/source_location")
async def source_location():
    return {"source_location": "Not implemented"}

@router.post("/destination_location")
async def destination_location():
    return {"destination_location": "Not implemented"}

@router.post("/move_stock")
async def move_stock():
    return {"move_stock": "Not implemented"}

