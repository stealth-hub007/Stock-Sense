from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from database import get_db
import models

router = APIRouter(
    prefix="/deliveries",
    tags=["Deliveries"]
)

class DeliveryEnrichedResponse(BaseModel):
    id: int
    customer_name: str
    status: str
    created_at: datetime
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    qty: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

@router.get("/", response_model=List[DeliveryEnrichedResponse])
async def list_deliveries(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Delivery).offset(skip).limit(limit))
    deliveries = result.scalars().all()

    enriched = []
    for d in deliveries:
        # Get first delivery item
        item_res = await db.execute(select(models.DeliveryItem).where(models.DeliveryItem.delivery_id == d.id).limit(1))
        item = item_res.scalars().first()

        product_name = None
        product_sku = None
        qty = None
        if item:
            prod_res = await db.execute(select(models.Product).where(models.Product.id == item.product_id))
            product = prod_res.scalars().first()
            if product:
                product_name = product.name
                product_sku = product.sku
            qty = item.quantity

        enriched.append({
            "id": d.id,
            "customer_name": d.customer_name,
            "status": d.status,
            "created_at": d.created_at,
            "product_name": product_name,
            "product_sku": product_sku,
            "qty": qty,
        })

    return enriched

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

