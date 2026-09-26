import asyncio
from database import async_session_maker, engine, Base
from models import User, RoleEnum
from sqlalchemy.future import select

async def seed_users():
    async with async_session_maker() as session:
        # Check if users already exist
        result = await session.execute(select(User))
        users_exist = result.scalars().first()
        
        if not users_exist:
            print("Seeding users...")
            users = [
                User(
                    username="marcus",
                    email="admin@stocksense.io",
                    hashed_password="admin123", # Plain text for this hackathon
                    role=RoleEnum.ADMIN
                ),
                User(
                    username="sarah",
                    email="manager@stocksense.io",
                    hashed_password="manager123",
                    role=RoleEnum.MANAGER
                ),
                User(
                    username="alex",
                    email="staff@stocksense.io",
                    hashed_password="staff123",
                    role=RoleEnum.STAFF
                )
            ]
            session.add_all(users)
            await session.commit()
            print("Users seeded.")
        else:
            print("Users already seeded.")
            
if __name__ == "__main__":
    asyncio.run(seed_users())
