from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class PostReaction(Base):
    __tablename__ = "post_reactions"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("board_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    emoji = Column(String(10), nullable=False)
    author_name = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("BoardPost", back_populates="reactions")
