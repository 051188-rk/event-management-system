import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy.future import select

from .db.base import async_session_maker
from .models.user import User, UserRole
from .models.event import Event
from .core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_initial_data():
    """Create initial data for development and testing."""
    async with async_session_maker() as session:
        # Check if we already have users
        result = await session.execute(select(User))
        if result.scalars().first() is not None:
            logger.info("Database already has data, skipping initial data creation.")
            return
        
        logger.info("Creating initial data...")
        
        # Create admin user
        admin = User(
            email="admin@example.com",
            name="Admin User",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        
        # Create normal user
        user = User(
            email="user@example.com",
            name="Normal User",
            hashed_password=get_password_hash("user123"),
            role=UserRole.NORMAL,
            is_active=True
        )
        
        session.add_all([admin, user])
        await session.commit()
        
        # Create some sample events
        now = datetime.utcnow()
        events = [
            Event(
                title="Team Building Workshop",
                description="A fun team building activity for all employees.",
                date=now + timedelta(days=7),
                time="14:00",
                created_by_id=admin.id,
                image_url="https://example.com/team-building.jpg"
            ),
            Event(
                title="Product Launch",
                description="Launch of our new product line.",
                date=now + timedelta(days=14),
                time="10:00",
                created_by_id=admin.id,
                image_url="https://example.com/product-launch.jpg"
            ),
            Event(
                title="Holiday Party",
                description="Annual company holiday celebration.",
                date=now + timedelta(days=30),
                time="19:00",
                created_by_id=user.id,
                image_url="https://example.com/holiday-party.jpg"
            )
        ]
        
        session.add_all(events)
        await session.commit()
        
        logger.info("Initial data created successfully.")

if __name__ == "__main__":
    asyncio.run(create_initial_data())
