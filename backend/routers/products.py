from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

@router.get("/", response_model=List[schemas.ProductResponse])
async def list_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Product))
    return result.scalars().all()

@router.post("/", response_model=schemas.ProductResponse)
async def create_product(product: schemas.ProductCreate, db: AsyncSession = Depends(get_db)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    try:
        await db.commit()
        await db.refresh(db_product)
        return db_product
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail="SKU might already exist")

@router.post("/categories")
async def categories():
    return {"categories": "Not implemented"}

@router.post("/uom")
async def uom():
    return {"uom": "Not implemented"}

@router.post("/reorder_rules")
async def reorder_rules():
    return {"reorder_rules": "Not implemented"}
