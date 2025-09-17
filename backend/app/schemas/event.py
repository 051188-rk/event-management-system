from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, time

class EventBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    date: datetime
    time: str  # Format: "HH:MM"
    image_url: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    date: Optional[datetime] = None
    time: Optional[str] = None  # Format: "HH:MM"
    image_url: Optional[str] = None

class EventInDBBase(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by_id: int

    class Config:
        from_attributes = True

class Event(EventInDBBase):
    pass

class EventInDB(EventInDBBase):
    pass
