from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class BookmarkedMentor(Base):
    __tablename__ = "bookmarked_mentors"
    __table_args__ = (UniqueConstraint("user_id", "mentor_id", name="uq_bookmark"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], backref="bookmarks")
    mentor = relationship("User", foreign_keys=[mentor_id])
