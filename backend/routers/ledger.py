from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(
    prefix="/stock_ledger",
    tags=["Ledger"]
)

@router.get("/", response_model=List[schemas.StockLedgerResponse])
async def list_ledger(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.StockLedger).offset(skip).limit(limit))
    return result.scalars().all()
