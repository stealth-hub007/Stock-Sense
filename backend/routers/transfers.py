from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(
    prefix="/transfers",
    tags=["Transfers"]
)

@router.get("/", response_model=List[schemas.TransferResponse])
async def list_transfers(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Transfer).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/source_location")
async def source_location():
    return {"source_location": "Not implemented"}

@router.post("/destination_location")
async def destination_location():
    return {"destination_location": "Not implemented"}

@router.post("/move_stock")
async def move_stock():
    return {"move_stock": "Not implemented"}

