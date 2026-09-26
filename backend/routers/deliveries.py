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


from fastapi import HTTPException
@router.post("/{delivery_id}/advance")
async def advance_delivery(delivery_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Delivery).where(models.Delivery.id == delivery_id))
    delivery = res.scalars().first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
        
    current = delivery.status.upper()
    next_status = "Packed" if current == "DRAFT" else "Shipped" if current == "PACKED" else None
    
    if not next_status:
        return {"status": "Already shipped"}
        
    delivery.status = next_status
    
    # If it's being shipped, deduct from ledger
    if next_status == "Shipped":
        item_res = await db.execute(select(models.DeliveryItem).where(models.DeliveryItem.delivery_id == delivery_id))
        items = item_res.scalars().all()
        loc_res = await db.execute(select(models.Location).limit(1))
        loc = loc_res.scalars().first()
        
        for item in items:
            ledger = models.StockLedger(
                product_id=item.product_id,
                location_id=loc.id if loc else 1,
                operation_type="DELIVERY",
                quantity=-item.quantity,
                reference_id=f"SO-{delivery.id}"
            )
            db.add(ledger)
            
            bal_res = await db.execute(select(models.StockBalance).where(
                models.StockBalance.product_id == item.product_id,
                models.StockBalance.location_id == (loc.id if loc else 1)
            ))
            balance = bal_res.scalars().first()
            if balance:
                balance.quantity -= item.quantity
                
    await db.commit()
    return {"status": "success", "new_status": next_status}

from pydantic import BaseModel
class DeliveryCreate(BaseModel):
    customer_name: str = "New Customer"
    status: str = "Draft"
    product_id: int = 1
    quantity: int = 5

@router.post("/create")
async def create_delivery(data: DeliveryCreate, db: AsyncSession = Depends(get_db)):
    d = models.Delivery(customer_name=data.customer_name, status=data.status)
    db.add(d)
    await db.flush()
    di = models.DeliveryItem(delivery_id=d.id, product_id=data.product_id, quantity=data.quantity)
    db.add(di)
    await db.commit()
    return {"id": d.id}
