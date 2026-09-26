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
async def list_products(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Product).offset(skip).limit(limit))
    products = result.scalars().all()
    
    # Get stock balances for these products
    if not products:
        return []
        
    product_ids = [p.id for p in products]
    balances_result = await db.execute(
        select(models.StockBalance).where(models.StockBalance.product_id.in_(product_ids))
    )
    balances = balances_result.scalars().all()
    
    # Map balances to products
    stock_map = {}
    for b in balances:
        stock_map[b.product_id] = stock_map.get(b.product_id, 0) + b.quantity
        
    response = []
    for p in products:
        p_dict = {
            "id": p.id,
            "sku": p.sku,
            "name": p.name,
            "category_id": p.category_id,
            "uom_id": p.uom_id,
            "price": p.price,
            "current_stock": stock_map.get(p.id, 0)
        }
        response.append(p_dict)
        
    return response

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
