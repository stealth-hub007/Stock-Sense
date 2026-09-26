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


from fastapi import HTTPException
@router.post("/{receipt_id}/receive")
async def receive_receipt(receipt_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Get receipt
    res = await db.execute(select(models.Receipt).where(models.Receipt.id == receipt_id))
    receipt = res.scalars().first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    if receipt.status.upper() == 'VALIDATED':
        return {"status": "Already received"}
        
    receipt.status = 'Validated'
    
    # 2. Get items
    item_res = await db.execute(select(models.ReceiptItem).where(models.ReceiptItem.receipt_id == receipt_id))
    items = item_res.scalars().all()
    
    loc_res = await db.execute(select(models.Location).limit(1))
    loc = loc_res.scalars().first()
    
    for item in items:
        # Ledger entry
        ledger = models.StockLedger(
            product_id=item.product_id,
            location_id=loc.id if loc else 1,
            operation_type="RECEIPT",
            quantity=item.quantity,
            reference_id=f"PO-{receipt.id}"
        )
        db.add(ledger)
        
        # Balance update
        bal_res = await db.execute(select(models.StockBalance).where(
            models.StockBalance.product_id == item.product_id,
            models.StockBalance.location_id == (loc.id if loc else 1)
        ))
        balance = bal_res.scalars().first()
        if balance:
            balance.quantity += item.quantity
        else:
            new_bal = models.StockBalance(product_id=item.product_id, location_id=loc.id if loc else 1, quantity=item.quantity)
            db.add(new_bal)
            
    await db.commit()
    return {"status": "success"}
