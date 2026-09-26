import asyncio
from database import engine, async_session_maker
import models

async def seed():
    async with async_session_maker() as session:
        # Get existing data
        from sqlalchemy import select
        res = await session.execute(select(models.Product))
        products = res.scalars().all()
        if not products:
            print("No products found")
            return
            
        res = await session.execute(select(models.Location))
        loc = res.scalars().first()

        # Add Stock Balances and Ledgers
        if len(products) > 0:
            prod1 = products[0]
            bal1 = models.StockBalance(
                product_id=prod1.id,
                location_id=loc.id,
                quantity=150
            )
            ledger1 = models.StockLedger(
                product_id=prod1.id,
                location_id=loc.id,
                operation_type="RECEIPT",
                quantity=150,
                reference_id="PO-1001"
            )
            session.add_all([bal1, ledger1])

        if len(products) > 1:
            prod2 = products[1]
            bal2 = models.StockBalance(
                product_id=prod2.id,
                location_id=loc.id,
                quantity=300
            )
            ledger2 = models.StockLedger(
                product_id=prod2.id,
                location_id=loc.id,
                operation_type="RECEIPT",
                quantity=300,
                reference_id="PO-1002"
            )
            session.add_all([bal2, ledger2])

        await session.commit()
        print("More dummy data added!")

if __name__ == "__main__":
    asyncio.run(seed())
