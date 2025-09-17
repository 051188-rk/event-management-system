from datetime import datetime, time
from typing import Optional

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship, Mapped, mapped_column

from ..db.base_class import Base

class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    time: Mapped[str] = mapped_column(String, nullable=False)  # Storing time as string in HH:MM format
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    created_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    
    # Relationships
    created_by: Mapped["User"] = relationship("User", back_populates="events")
    
    def __repr__(self) -> str:
        return f"<Event {self.title}>"
    
    @classmethod
    def create_event(cls, db, event_in, user_id: int):
        """Create a new event."""
        event_data = event_in.dict()
        db_event = cls(**event_data, created_by_id=user_id)
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event
    
    def update_event(self, db, event_in):
        """Update an existing event."""
        update_data = event_in.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(self, field, value)
            
        db.add(self)
        db.commit()
        db.refresh(self)
        return self
