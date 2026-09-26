from fastapi import APIRouter

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

@router.post("/management")
async def management():
    return {"management": "Not implemented"}

@router.post("/categories")
async def categories():
    return {"categories": "Not implemented"}

@router.post("/uom")
async def uom():
    return {"uom": "Not implemented"}

@router.post("/reorder_rules")
async def reorder_rules():
    return {"reorder_rules": "Not implemented"}

