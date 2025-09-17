import asyncio
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from .base import Base
from ..core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create async engine
ASYNC_DATABASE_URL = settings.DATABASE_URI.replace("postgresql://", "postgresql+asyncpg://")
async_engine = create_async_engine(ASYNC_DATABASE_URL)

# Create async session
async_session_maker = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

# Create sync engine for migrations
SYNC_DATABASE_URL = settings.DATABASE_URI
engine = create_engine(SYNC_DATABASE_URL)

async def create_tables():
    """Create database tables."""
    async with async_engine.begin() as conn:
        logger.info("Creating database tables...")
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully.")

async def drop_tables():
    """Drop all database tables."""
    async with async_engine.begin() as conn:
        logger.warning("Dropping all database tables...")
        await conn.run_sync(Base.metadata.drop_all)
        logger.warning("All database tables dropped.")

def reset_database():
    ""
    Reset the database by dropping and recreating all tables.
    WARNING: This will delete all data in the database!
    """
    logger.warning("Resetting database...")
    
    # Drop all tables
    Base.metadata.drop_all(engine)
    
    # Create all tables
    Base.metadata.create_all(engine)
    
    logger.info("Database reset complete.")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Database management utility")
    parser.add_argument(
        "--reset", 
        action="store_true", 
        help="Reset the database by dropping and recreating all tables (WARNING: deletes all data!)"
    )
    
    args = parser.parse_args()
    
    if args.reset:
        confirm = input("WARNING: This will delete all data in the database! Are you sure? (y/n): ")
        if confirm.lower() == 'y':
            reset_database()
        else:
            print("Database reset cancelled.")
    else:
        print("No action specified. Use --help for usage information.")
