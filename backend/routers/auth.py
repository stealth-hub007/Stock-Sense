from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/login")
async def login():
    return {"login": "Not implemented"}

@router.post("/signup")
async def signup():
    return {"signup": "Not implemented"}

@router.post("/otp")
async def otp():
    return {"otp": "Not implemented"}

@router.post("/roles")
async def roles():
    return {"roles": "Not implemented"}

