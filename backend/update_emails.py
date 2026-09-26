import asyncio
from database import async_session_maker
from models import User
from sqlalchemy import update

async def update_emails():
    async with async_session_maker() as session:
        await session.execute(update(User).where(User.email == 'admin@stocksense.io').values(email='admin@stocksense.com'))
        await session.execute(update(User).where(User.email == 'manager@stocksense.io').values(email='manager@stocksense.com'))
        await session.execute(update(User).where(User.email == 'staff@stocksense.io').values(email='staff@stocksense.com'))
        await session.commit()
        print("Emails updated to .com")

if __name__ == "__main__":
    asyncio.run(update_emails())
