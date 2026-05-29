from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class UserRole(str, enum.Enum):
    MENTOR = "mentor"
    MENTEE = "mentee"
    SPONSOR = "sponsor"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.MENTEE, nullable=False)

    bio = Column(Text, nullable=True)
    title = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    skills = Column(Text, nullable=True)         # comma-separated
    linkedin_url = Column(String(500), nullable=True)
    is_available = Column(Boolean, default=True)  # mentor available for new mentees
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    boards_created = relationship("Board", foreign_keys="Board.creator_id", back_populates="creator")
    boards_received = relationship("Board", foreign_keys="Board.recipient_id", back_populates="recipient")
    posts = relationship("BoardPost", back_populates="author")
    mentorships_as_mentor = relationship("Mentorship", foreign_keys="Mentorship.mentor_id", back_populates="mentor")
    mentorships_as_mentee = relationship("Mentorship", foreign_keys="Mentorship.mentee_id", back_populates="mentee")
