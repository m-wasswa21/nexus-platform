from pydantic import BaseModel
from datetime import datetime
from app.models.board import BoardType
from app.schemas.user import UserOut


class BoardCreate(BaseModel):
    title: str
    description: str | None = None
    board_type: BoardType = BoardType.APPRECIATION
    recipient_id: int | None = None
    recipient_name: str | None = None
    recipient_email: str | None = None
    is_public: bool = True
    cover_color: str = "#173962"
    cover_image_url: str | None = None


class BoardPostCreate(BaseModel):
    author_name: str
    author_email: str | None = None
    message: str
    image_url: str | None = None
    gif_url: str | None = None
    bg_color: str = "#ffffff"
    is_anonymous: bool = False


class ReactionCreate(BaseModel):
    emoji: str
    author_name: str


class ReactionOut(BaseModel):
    id: int
    post_id: int
    emoji: str
    author_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReactionSummary(BaseModel):
    emoji: str
    count: int


class BoardPostOut(BaseModel):
    id: int
    board_id: int
    author_name: str
    author_email: str | None
    message: str
    image_url: str | None
    gif_url: str | None
    bg_color: str
    author_id: int | None
    is_anonymous: bool
    created_at: datetime
    author: UserOut | None = None
    reactions: list[ReactionOut] = []

    model_config = {"from_attributes": True}


class BoardOut(BaseModel):
    id: int
    title: str
    description: str | None
    board_type: BoardType
    creator_id: int
    recipient_id: int | None
    recipient_name: str | None
    recipient_email: str | None
    is_public: bool
    share_token: str
    cover_color: str
    cover_image_url: str | None = None
    view_count: int
    created_at: datetime
    creator: UserOut
    recipient: UserOut | None = None
    posts: list[BoardPostOut] = []

    model_config = {"from_attributes": True}
