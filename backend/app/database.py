from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite+aiosqlite:///./wallet.db"

engine = create_async_engine(
    DATABASE_URL, echo=True, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, autocommit=False, autoflush=False
)


async def get_db():
    async with SessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        from app.models import Base

        await conn.run_sync(Base.metadata.create_all)
