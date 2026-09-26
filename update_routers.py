import re

def update_receipts():
    with open('backend/routers/receipts.py', 'r') as f:
        content = f.read()

    new_endpoint = """
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
"""
    # Replace everything from @router.post("/create") onwards
    content = re.sub(r'@router\.post\("/create"\).*', new_endpoint, content, flags=re.DOTALL)
    with open('backend/routers/receipts.py', 'w') as f:
        f.write(content)


def update_deliveries():
    with open('backend/routers/deliveries.py', 'r') as f:
        content = f.read()

    new_endpoint = """
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
"""
    content = re.sub(r'@router\.post\("/create"\).*', new_endpoint, content, flags=re.DOTALL)
    with open('backend/routers/deliveries.py', 'w') as f:
        f.write(content)

def update_transfers():
    with open('backend/routers/transfers.py', 'r') as f:
        content = f.read()

    new_endpoint = """
from fastapi import HTTPException
@router.post("/{transfer_id}/execute")
async def execute_transfer(transfer_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Transfer).where(models.Transfer.id == transfer_id))
    transfer = res.scalars().first()
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
        
    if transfer.status.upper() == 'COMPLETED':
        return {"status": "Already completed"}
        
    transfer.status = 'Completed'
    
    item_res = await db.execute(select(models.TransferItem).where(models.TransferItem.transfer_id == transfer_id))
    items = item_res.scalars().all()
    
    for item in items:
        # OUT from source
        ledger_out = models.StockLedger(
            product_id=item.product_id,
            location_id=transfer.source_location_id,
            operation_type="TRANSFER_OUT",
            quantity=-item.quantity,
            reference_id=f"TR-{transfer.id}"
        )
        db.add(ledger_out)
        
        # IN to destination
        ledger_in = models.StockLedger(
            product_id=item.product_id,
            location_id=transfer.destination_location_id,
            operation_type="TRANSFER_IN",
            quantity=item.quantity,
            reference_id=f"TR-{transfer.id}"
        )
        db.add(ledger_in)
        
        # Deduct source
        bal_out = await db.execute(select(models.StockBalance).where(
            models.StockBalance.product_id == item.product_id,
            models.StockBalance.location_id == transfer.source_location_id
        ))
        bo = bal_out.scalars().first()
        if bo:
            bo.quantity -= item.quantity
            
        # Add destination
        bal_in = await db.execute(select(models.StockBalance).where(
            models.StockBalance.product_id == item.product_id,
            models.StockBalance.location_id == transfer.destination_location_id
        ))
        bi = bal_in.scalars().first()
        if bi:
            bi.quantity += item.quantity
        else:
            new_bi = models.StockBalance(product_id=item.product_id, location_id=transfer.destination_location_id, quantity=item.quantity)
            db.add(new_bi)
            
    await db.commit()
    return {"status": "success"}
"""
    content = re.sub(r'@router\.post\("/create"\).*', new_endpoint, content, flags=re.DOTALL)
    with open('backend/routers/transfers.py', 'w') as f:
        f.write(content)

update_receipts()
update_deliveries()
update_transfers()
