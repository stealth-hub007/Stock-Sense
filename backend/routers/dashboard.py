from fastapi import APIRouter

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.post("/kpi_calculation")
async def kpi_calculation():
    return {"kpi_calculation": "Not implemented"}

@router.post("/stock_summary")
async def stock_summary():
    return {"stock_summary": "Not implemented"}

@router.post("/pending_operations")
async def pending_operations():
    return {"pending_operations": "Not implemented"}

