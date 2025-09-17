from pydantic_settings import BaseSettings
from typing import List, Optional, Any, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "Event Management System"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "admin123"
    POSTGRES_DB: str = "event_management"
    POSTGRES_PORT: str = "5432"
    DATABASE_URI: Optional[str] = ""
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]  # React's default port
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security Headers
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "0.0.0.0"]
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"  # This will ignore extra fields in .env

# Compute DATABASE_URI if not set
settings = Settings()
if not settings.DATABASE_URI:
    settings.DATABASE_URI = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
