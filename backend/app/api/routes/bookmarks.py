from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.api.deps import get_db, get_current_user
from app.models.bookmark import BookmarkedMentor
from app.models.user import User
from app.schemas.user import UserOut

router = APIRouter()


@router.get("", response_model=list[UserOut])
async def list_bookmarks(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(BookmarkedMentor)
        .options(selectinload(BookmarkedMentor.mentor))
        .where(BookmarkedMentor.user_id == current_user.id)
        .order_by(BookmarkedMentor.created_at.desc())
    )
    return [UserOut.model_validate(b.mentor) for b in result.scalars().all()]


@router.post("/{mentor_id}", status_code=201)
async def bookmark(mentor_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = await db.execute(
        select(BookmarkedMentor).where(
            BookmarkedMentor.user_id == current_user.id,
            BookmarkedMentor.mentor_id == mentor_id,
        )
    )
    if existing.scalar_one_or_none():
        return {"bookmarked": True}
    bm = BookmarkedMentor(user_id=current_user.id, mentor_id=mentor_id)
    db.add(bm)
    await db.commit()
    return {"bookmarked": True}


@router.delete("/{mentor_id}", status_code=204)
async def unbookmark(mentor_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(BookmarkedMentor).where(
            BookmarkedMentor.user_id == current_user.id,
            BookmarkedMentor.mentor_id == mentor_id,
        )
    )
    bm = result.scalar_one_or_none()
    if bm:
        await db.delete(bm)
        await db.commit()
