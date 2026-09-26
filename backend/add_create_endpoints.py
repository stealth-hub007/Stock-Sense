import re

def insert_before_receive(filename, endpoint_code):
    with open(filename, 'r') as f:
        content = f.read()
    
    if "def receive_receipt" in content:
        content = content.replace("def receive_receipt", f"{endpoint_code}\n\n@router.post")
        # Fix the replace slightly since it replaces def receive... wait, better regex
    
    # Actually just append to the file
    with open(filename, 'a') as f:
        f.write(endpoint_code)


receipt_code = """
from pydantic import BaseModel
class ReceiptCreate(BaseModel):
    supplier_id: int = 1
    status: str = "Draft"
    product_id: int = 1
    quantity: int = 10

@router.post("/create")
async def create_receipt(data: ReceiptCreate, db: AsyncSession = Depends(get_db)):
    r = models.Receipt(supplier_id=data.supplier_id, status=data.status)
    db.add(r)
    await db.flush()
    ri = models.ReceiptItem(receipt_id=r.id, product_id=data.product_id, quantity=data.quantity)
    db.add(ri)
    await db.commit()
    return {"id": r.id}
"""

delivery_code = """
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
"""

transfer_code = """
from pydantic import BaseModel
class TransferCreate(BaseModel):
    source_location_id: int = 1
    destination_location_id: int = 2
    status: str = "Scheduled"
    product_id: int = 1
    quantity: int = 10

@router.post("/create")
async def create_transfer(data: TransferCreate, db: AsyncSession = Depends(get_db)):
    t = models.Transfer(source_location_id=data.source_location_id, destination_location_id=data.destination_location_id, status=data.status)
    db.add(t)
    await db.flush()
    ti = models.TransferItem(transfer_id=t.id, product_id=data.product_id, quantity=data.quantity)
    db.add(ti)
    await db.commit()
    return {"id": t.id}
"""

insert_before_receive('backend/routers/receipts.py', receipt_code)
insert_before_receive('backend/routers/deliveries.py', delivery_code)
insert_before_receive('backend/routers/transfers.py', transfer_code)

