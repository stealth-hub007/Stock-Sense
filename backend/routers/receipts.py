from fastapi import APIRouter

router = APIRouter(
    prefix="/receipts",
    tags=["Receipts"]
)

@router.post("/create")
async def create():
    return {"create": "Not implemented"}

@router.post("/add_products")
async def add_products():
    return {"add_products": "Not implemented"}

@router.post("/validate")
async def validate():
    return {"validate": "Not implemented"}

@router.post("/increase_stock")
async def increase_stock():
    return {"increase_stock": "Not implemented"}

