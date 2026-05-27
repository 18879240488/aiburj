"""数据库连接"""
import os

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# Resolve relative path to absolute for reliable file creation
_db_url = settings.DATABASE_URL
if _db_url.startswith("sqlite") and "/./" in _db_url:
    # Extract the relative path part
    _, rel_part = _db_url.split("/./", 1)
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    abs_path = os.path.join(backend_dir, rel_part)
    _db_url = f"sqlite+aiosqlite:///{abs_path}"
    print(f"[DB] Resolved database path: {abs_path}")

engine = create_async_engine(_db_url, echo=settings.DEBUG)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)