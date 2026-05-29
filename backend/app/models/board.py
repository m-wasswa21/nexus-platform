from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum
import secrets


class BoardType(str, enum.Enum):
    APPRECIATION = "appreciation"
    BIRTHDAY = "birthday"
    FAREWELL = "farewell"
    MILESTONE = "milestone"
    GRADUATION = "graduation"


class Board(Base):
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    board_type = Column(SQLEnum(BoardType), default=BoardType.APPRECIATION, nullable=False)

    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    recipient_name = Column(String(255), nullable=True)
    recipient_email = Column(String(255), nullable=True)

    is_public = Column(Boolean, default=True)
    share_token = Column(String(64), unique=True, index=True, default=lambda: secrets.token_urlsafe(32))
    cover_color = Column(String(20), default="#173962")
    cover_image_url = Column(String(500), nullable=True)
    view_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    creator = relationship("User", foreign_keys=[creator_id], back_populates="boards_created")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="boards_received")
    posts = relationship("BoardPost", back_populates="board", cascade="all, delete-orphan")


class BoardPost(Base):
    __tablename__ = "board_posts"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    author_name = Column(String(255), nullable=False)
    author_email = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    gif_url = Column(String(500), nullable=True)
    bg_color = Column(String(20), default="#ffffff")
    is_anonymous = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    board = relationship("Board", back_populates="posts")
    author = relationship("User", back_populates="posts")
    reactions = relationship("PostReaction", back_populates="post", cascade="all, delete-orphan")
