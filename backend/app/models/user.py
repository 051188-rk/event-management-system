from typing import TYPE_CHECKING
from sqlalchemy import Boolean, Integer, String, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column, Session

from ..db.base_class import Base
from ..enums.user import UserRole

# Import types only during type checking to avoid circular imports
if TYPE_CHECKING:
    from ..schemas.user import UserCreate, UserUpdate

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.NORMAL, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    
    # Relationships
    events: Mapped[list["Event"]] = relationship("Event", back_populates="created_by")
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"
    
    @classmethod
    def get_by_email(cls, db: Session, email: str) -> 'User':
        return db.query(cls).filter(cls.email == email).first()
    
    @classmethod
    def create_user(cls, db: Session, user_in: 'UserCreate') -> 'User':
        from ..core.security import get_password_hash
        
        hashed_password = get_password_hash(user_in.password)
        db_user = cls(
            email=user_in.email,
            name=user_in.name,
            hashed_password=hashed_password,
            role=user_in.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def update_user(self, db: Session, user_in: 'UserUpdate') -> 'User':
        update_data = user_in.dict(exclude_unset=True)
        if "password" in update_data:
            from ..core.security import get_password_hash
            update_data["hashed_password"] = get_password_hash(update_data["password"])
            del update_data["password"]
            
        for field, value in update_data.items():
            setattr(self, field, value)
            
        db.add(self)
        db.commit()
        db.refresh(self)
        return self
