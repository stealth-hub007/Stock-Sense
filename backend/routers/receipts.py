from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

from database import get_db
import models

router = APIRouter(
    prefix="/receipts",
    tags=["Receipts"]
)

class ReceiptEnrichedResponse(BaseModel):
    id: int
    supplier_id: int
    supplier_name: str
    status: str
    created_at: datetime
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    expected_qty: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

@router.get("/", response_model=List[ReceiptEnrichedResponse])
async def list_receipts(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Receipt).offset(skip).limit(limit))
    receipts = result.scalars().all()

    enriched = []
    for r in receipts:
        # Get supplier name
        sup_res = await db.execute(select(models.Supplier).where(models.Supplier.id == r.supplier_id))
        supplier = sup_res.scalars().first()

        # Get first receipt item
        item_res = await db.execute(select(models.ReceiptItem).where(models.ReceiptItem.receipt_id == r.id).limit(1))
        item = item_res.scalars().first()

        product_name = None
        product_sku = None
        expected_qty = None
        if item:
            prod_res = await db.execute(select(models.Product).where(models.Product.id == item.product_id))
            product = prod_res.scalars().first()
            if product:
                product_name = product.name
                product_sku = product.sku
            expected_qty = item.quantity

        enriched.append({
            "id": r.id,
            "supplier_id": r.supplier_id,
            "supplier_name": supplier.name if supplier else f"Supplier {r.supplier_id}",
            "status": r.status,
            "created_at": r.created_at,
            "product_name": product_name,
            "product_sku": product_sku,
            "expected_qty": expected_qty,
        })

    return enriched

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

