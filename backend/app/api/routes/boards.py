from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from app.api.deps import get_db, get_current_user
from app.models.board import Board, BoardPost
from app.models.reaction import PostReaction
from app.models.notification import Notification
from app.models.user import User
from app.schemas.board import (
    BoardCreate, BoardOut, BoardPostCreate, BoardPostOut,
    ReactionCreate, ReactionOut,
)
from app.core.config import settings
import aiofiles
import os
import uuid

router = APIRouter()

UPLOAD_DIR = "uploads/posts"
COVERS_DIR = "uploads/covers"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(COVERS_DIR, exist_ok=True)


def _board_query():
    return select(Board).options(
        selectinload(Board.creator),
        selectinload(Board.recipient),
        selectinload(Board.posts).options(
            selectinload(BoardPost.author),
            selectinload(BoardPost.reactions),
        ),
    )


@router.get("", response_model=list[BoardOut])
async def list_boards(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = _board_query().where(
        (Board.creator_id == current_user.id) | (Board.recipient_id == current_user.id)
    ).order_by(Board.created_at.desc())
    result = await db.execute(q)
    return [BoardOut.model_validate(b) for b in result.scalars().all()]


@router.post("", response_model=BoardOut, status_code=201)
async def create_board(data: BoardCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    board = Board(
        title=data.title,
        description=data.description,
        board_type=data.board_type,
        creator_id=current_user.id,
        recipient_id=data.recipient_id,
        recipient_name=data.recipient_name,
        recipient_email=data.recipient_email,
        is_public=data.is_public,
        cover_color=data.cover_color,
        cover_image_url=data.cover_image_url,
    )
    db.add(board)
    await db.commit()
    await db.refresh(board)
    result = await db.execute(_board_query().where(Board.id == board.id))
    return BoardOut.model_validate(result.scalar_one())


@router.get("/token/{token}", response_model=BoardOut)
async def get_board_by_token(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(_board_query().where(Board.share_token == token))
    board = result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return BoardOut.model_validate(board)


@router.get("/{board_id}", response_model=BoardOut)
async def get_board(
    board_id: int,
    count_view: bool = False,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(_board_query().where(Board.id == board_id))
    board = result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    # Only count when the caller explicitly signals a real first visit
    if count_view:
        await db.execute(update(Board).where(Board.id == board_id).values(view_count=Board.view_count + 1))
        await db.commit()
    return BoardOut.model_validate(board)


@router.post("/{board_id}/posts", response_model=BoardPostOut, status_code=201)
async def add_post(board_id: int, data: BoardPostCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Board).where(Board.id == board_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Board not found")

    display_name = "Anonymous" if data.is_anonymous else data.author_name
    post = BoardPost(
        board_id=board_id,
        author_name=display_name,
        author_email=None if data.is_anonymous else data.author_email,
        message=data.message,
        image_url=data.image_url,
        gif_url=data.gif_url,
        bg_color=data.bg_color,
        is_anonymous=data.is_anonymous,
    )
    db.add(post)
    await db.flush()

    # Notify board creator (if different from poster)
    board_q = await db.execute(select(Board).where(Board.id == board_id))
    board = board_q.scalar_one()
    if board.creator_id and (post.author_id is None or post.author_id != board.creator_id):
        n = Notification(
            user_id=board.creator_id,
            type="board_post",
            title=f'New message on \"{board.title}\"',
            message=f"{display_name} added a message to your board.",
            link=f"/boards/{board_id}",
        )
        db.add(n)

    await db.commit()
    await db.refresh(post)
    q = select(BoardPost).options(
        selectinload(BoardPost.author),
        selectinload(BoardPost.reactions),
    ).where(BoardPost.id == post.id)
    result = await db.execute(q)
    return BoardPostOut.model_validate(result.scalar_one())


@router.post("/upload-cover")
async def upload_cover_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB)")

    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(COVERS_DIR, filename)

    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)

    return {"url": f"/uploads/covers/{filename}"}


@router.post("/{board_id}/posts/upload-image")
async def upload_post_image(board_id: int, file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5 MB)")

    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)

    return {"url": f"/uploads/posts/{filename}"}


@router.post("/{board_id}/posts/{post_id}/reactions", response_model=ReactionOut, status_code=201)
async def add_reaction(board_id: int, post_id: int, data: ReactionCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BoardPost).where(BoardPost.id == post_id, BoardPost.board_id == board_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Post not found")

    # One reaction per emoji per author_name per post
    existing = await db.execute(
        select(PostReaction).where(
            PostReaction.post_id == post_id,
            PostReaction.emoji == data.emoji,
            PostReaction.author_name == data.author_name,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already reacted")

    reaction = PostReaction(post_id=post_id, emoji=data.emoji, author_name=data.author_name)
    db.add(reaction)
    await db.commit()
    await db.refresh(reaction)
    return ReactionOut.model_validate(reaction)


@router.delete("/{board_id}/posts/{post_id}/reactions/{emoji}")
async def remove_reaction(board_id: int, post_id: int, emoji: str, author_name: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PostReaction).where(
            PostReaction.post_id == post_id,
            PostReaction.emoji == emoji,
            PostReaction.author_name == author_name,
        )
    )
    reaction = result.scalar_one_or_none()
    if reaction:
        await db.delete(reaction)
        await db.commit()
    return JSONResponse(content={"ok": True})


@router.delete("/{board_id}/posts/{post_id}", status_code=204)
async def delete_post(board_id: int, post_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(BoardPost).where(BoardPost.id == post_id, BoardPost.board_id == board_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    board_result = await db.execute(select(Board).where(Board.id == board_id))
    board = board_result.scalar_one()
    if post.author_id != current_user.id and board.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    await db.delete(post)
    await db.commit()


@router.delete("/{board_id}", status_code=204)
async def delete_board(board_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Board).where(Board.id == board_id))
    board = result.scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    if board.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")
    await db.delete(board)
    await db.commit()
