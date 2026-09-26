from fastapi import APIRouter

router = APIRouter(
    prefix="/deliveries",
    tags=["Deliveries"]
)

@router.post("/create")
async def create():
    return {"create": "Not implemented"}

@router.post("/pick")
async def pick():
    return {"pick": "Not implemented"}

@router.post("/pack")
async def pack():
    return {"pack": "Not implemented"}

@router.post("/validate")
async def validate():
    return {"validate": "Not implemented"}

@router.post("/decrease_stock")
async def decrease_stock():
    return {"decrease_stock": "Not implemented"}

