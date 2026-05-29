from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.schemas.user import UserOut

router = APIRouter()


@router.get("/mentors", response_model=list[UserOut])
async def list_mentors(
    db: AsyncSession = Depends(get_db),
    available_only: bool = Query(False),
    skill: str | None = Query(None),
):
    q = select(User).where(User.role == UserRole.MENTOR, User.is_active == True)
    if available_only:
        q = q.where(User.is_available == True)
    result = await db.execute(q)
    mentors = result.scalars().all()
    if skill:
        mentors = [m for m in mentors if m.skills and skill.lower() in m.skills.lower()]
    return [UserOut.model_validate(m) for m in mentors]


@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut.model_validate(user)
