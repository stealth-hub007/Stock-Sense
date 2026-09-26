import asyncio
from database import engine, async_session_maker
import models

async def seed():
    async with async_session_maker() as session:
        # Create Category
        cat = models.Category(name="Electronics")
        session.add(cat)
        
        # Create UOM
        uom = models.UOM(name="Piece")
        session.add(uom)
        
        await session.commit()
        await session.refresh(cat)
        await session.refresh(uom)

        # Create Products
        prod1 = models.Product(sku="SKU001", name="Laptop", category_id=cat.id, uom_id=uom.id, price=999.99)
        prod2 = models.Product(sku="SKU002", name="Mouse", category_id=cat.id, uom_id=uom.id, price=49.99)
        session.add(prod1)
        session.add(prod2)

        # Create Warehouse & Location
        wh = models.Warehouse(name="Main Warehouse", address="123 Tech Lane")
        session.add(wh)
        await session.commit()
        await session.refresh(wh)

        loc = models.Location(warehouse_id=wh.id, name="A1-Rack", type="Internal")
        session.add(loc)
        
        await session.commit()
        print("Dummy data successfully added!")

if __name__ == "__main__":
    asyncio.run(seed())
