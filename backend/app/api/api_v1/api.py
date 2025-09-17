from fastapi import APIRouter
from ..endpoints import auth, events

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
