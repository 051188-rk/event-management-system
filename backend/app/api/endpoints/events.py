from typing import List, Optional, Union
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from ...db.base import get_db
from ...models.user import User, UserRole
from ...models.event import Event
from ...schemas.event import Event as EventSchema, EventCreate, EventUpdate, EventInDB
from ...schemas.user import UserInDB
from ...core.security import get_current_active_user, get_current_admin_user

router = APIRouter()

@router.get("/", response_model=List[EventSchema])
async def read_events(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Retrieve all events with pagination.
    """
    # Eager load the created_by relationship to avoid N+1 queries
    result = await db.execute(
        select(Event)
        .options(selectinload(Event.created_by))
        .offset(skip)
        .limit(limit)
    )
    events = result.scalars().all()
    return events

@router.post("/", response_model=EventSchema, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_in: EventCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """
    Create a new event (admin only).
    """
    # Convert time string to time object
    try:
        # Validate time format (HH:MM)
        time_parts = event_in.time.split(":")
        if len(time_parts) != 2 or not all(part.isdigit() for part in time_parts):
            raise ValueError("Time must be in HH:MM format")
        hours, minutes = map(int, time_parts)
        if not (0 <= hours < 24 and 0 <= minutes < 60):
            raise ValueError("Invalid time")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid time format: {str(e)}. Please use HH:MM format."
        )
    
    # Create the event
    db_event = Event(
        **event_in.dict(exclude={"time"}),
        time=event_in.time,  # Store as string in HH:MM format
        created_by_id=current_user.id
    )
    
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    
    # Eager load the created_by relationship
    result = await db.execute(
        select(Event)
        .options(selectinload(Event.created_by))
        .filter(Event.id == db_event.id)
    )
    db_event = result.scalars().first()
    
    return db_event

@router.put("/{event_id}", response_model=EventSchema)
async def update_event(
    event_id: int,
    event_in: EventUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """
    Update an event (admin only).
    """
    # Get the event with the created_by relationship loaded
    result = await db.execute(
        select(Event)
        .options(selectinload(Event.created_by))
        .filter(Event.id == event_id)
    )
    db_event = result.scalars().first()
    
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Update event data
    update_data = event_in.dict(exclude_unset=True)
    
    # If time is being updated, validate it
    if "time" in update_data:
        try:
            time_parts = update_data["time"].split(":")
            if len(time_parts) != 2 or not all(part.isdigit() for part in time_parts):
                raise ValueError("Time must be in HH:MM format")
            hours, minutes = map(int, time_parts)
            if not (0 <= hours < 24 and 0 <= minutes < 60):
                raise ValueError("Invalid time")
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid time format: {str(e)}. Please use HH:MM format."
            )
    
    # Update the event
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    
    return db_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: UserInDB = Depends(get_current_admin_user)
):
    """
    Delete an event (admin only).
    """
    # Get the event
    result = await db.execute(select(Event).filter(Event.id == event_id))
    db_event = result.scalars().first()
    
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    await db.delete(db_event)
    await db.commit()
    
    return None
