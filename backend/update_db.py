import asyncio
from database import engine, async_session_maker
import models
from sqlalchemy import update

async def run():
    async with async_session_maker() as session:
        # Set first 5 receipts to Draft
        await session.execute(update(models.Receipt).where(models.Receipt.id <= 5).values(status='Draft'))
        # Set some deliveries to Draft and Packed
        await session.execute(update(models.Delivery).where(models.Delivery.id <= 5).values(status='Draft'))
        await session.execute(update(models.Delivery).where(models.Delivery.id.in_([6, 7, 8])).values(status='Packed'))
        
        await session.commit()
        print("Updated DB statuses to ensure non-zero queues.")

if __name__ == "__main__":
    asyncio.run(run())
