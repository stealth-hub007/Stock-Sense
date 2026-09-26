import asyncio
from sqlalchemy import text
from database import engine

async def main():
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
        tables = [r[0] for r in res.fetchall()]
        print("Tables currently in DB:", tables)

if __name__ == "__main__":
    asyncio.run(main())
