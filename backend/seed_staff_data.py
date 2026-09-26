import asyncio
from datetime import datetime, timedelta
from database import engine, async_session_maker
import models
from sqlalchemy import select

async def seed():
    async with async_session_maker() as session:
        # Get existing products and locations
        res = await session.execute(select(models.Product))
        products = res.scalars().all()
        if not products:
            print("No products found")
            return
            
        res = await session.execute(select(models.Location))
        loc = res.scalars().first()
        
        res = await session.execute(select(models.Supplier))
        supp = res.scalars().first()
        if not supp:
            supp = models.Supplier(name="Acme Corp", contact_email="acme@corp.com")
            session.add(supp)
            await session.commit()

        # Dummy Receipts
        receipt1 = models.Receipt(supplier_id=supp.id, status="Draft", created_at=datetime.utcnow())
        receipt2 = models.Receipt(supplier_id=supp.id, status="Validated", created_at=datetime.utcnow() - timedelta(days=1))
        session.add_all([receipt1, receipt2])
        await session.commit()
        
        # Receipt Items
        if len(products) > 0:
            ri1 = models.ReceiptItem(receipt_id=receipt1.id, product_id=products[0].id, quantity=100)
            session.add(ri1)
        if len(products) > 1:
            ri2 = models.ReceiptItem(receipt_id=receipt2.id, product_id=products[1].id, quantity=250)
            session.add(ri2)

        # Dummy Deliveries
        delivery1 = models.Delivery(customer_name="Tech Solutions Inc", status="Draft", created_at=datetime.utcnow())
        delivery2 = models.Delivery(customer_name="Global Enterprises", status="Packed", created_at=datetime.utcnow() - timedelta(hours=5))
        delivery3 = models.Delivery(customer_name="Local Shop", status="Shipped", created_at=datetime.utcnow() - timedelta(days=2))
        session.add_all([delivery1, delivery2, delivery3])
        await session.commit()
        
        # Delivery Items
        if len(products) > 0:
            di1 = models.DeliveryItem(delivery_id=delivery1.id, product_id=products[0].id, quantity=20)
            session.add(di1)
        if len(products) > 1:
            di2 = models.DeliveryItem(delivery_id=delivery2.id, product_id=products[1].id, quantity=15)
            session.add(di2)
        if len(products) > 2:
            di3 = models.DeliveryItem(delivery_id=delivery3.id, product_id=products[2].id, quantity=5)
            session.add(di3)

        # Dummy Transfers
        transfer1 = models.Transfer(source_location_id=loc.id, destination_location_id=loc.id, status="Draft", created_at=datetime.utcnow())
        transfer2 = models.Transfer(source_location_id=loc.id, destination_location_id=loc.id, status="Completed", created_at=datetime.utcnow() - timedelta(hours=1))
        session.add_all([transfer1, transfer2])
        await session.commit()
        
        # Transfer Items
        if len(products) > 0:
            ti1 = models.TransferItem(transfer_id=transfer1.id, product_id=products[0].id, quantity=10)
            session.add(ti1)
        if len(products) > 1:
            ti2 = models.TransferItem(transfer_id=transfer2.id, product_id=products[1].id, quantity=30)
            session.add(ti2)

        await session.commit()
        print("Staff operations dummy data successfully linked and stored in database!")

if __name__ == "__main__":
    asyncio.run(seed())
