from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class MentorshipStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    DECLINED = "declined"


class Mentorship(Base):
    __tablename__ = "mentorships"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    mentee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    status = Column(SQLEnum(MentorshipStatus), default=MentorshipStatus.PENDING, index=True)
    message = Column(Text, nullable=True)
    goals = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="mentorships_as_mentor")
    mentee = relationship("User", foreign_keys=[mentee_id], back_populates="mentorships_as_mentee")
    goals_list = relationship("MentorshipGoal", back_populates="mentorship", cascade="all, delete-orphan")
