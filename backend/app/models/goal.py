from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class GoalStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED   = "completed"


class MentorshipGoal(Base):
    __tablename__ = "mentorship_goals"

    id = Column(Integer, primary_key=True, index=True)
    mentorship_id = Column(Integer, ForeignKey("mentorships.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(GoalStatus), default=GoalStatus.NOT_STARTED)
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    mentorship = relationship("Mentorship", back_populates="goals_list")
