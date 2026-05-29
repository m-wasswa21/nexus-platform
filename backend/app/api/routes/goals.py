from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from app.api.deps import get_db, get_current_user
from app.models.goal import MentorshipGoal, GoalStatus
from app.models.mentorship import Mentorship
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()


class GoalCreate(BaseModel):
    title: str
    description: str | None = None
    due_date: str | None = None


class GoalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: GoalStatus | None = None
    due_date: str | None = None


class GoalOut(BaseModel):
    id: int
    mentorship_id: int
    title: str
    description: str | None
    status: GoalStatus
    due_date: str | None
    completed_at: str | None
    created_at: str

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, g: MentorshipGoal):
        return cls(
            id=g.id, mentorship_id=g.mentorship_id, title=g.title,
            description=g.description, status=g.status,
            due_date=g.due_date.isoformat() if g.due_date else None,
            completed_at=g.completed_at.isoformat() if g.completed_at else None,
            created_at=g.created_at.isoformat() if g.created_at else "",
        )


async def _check_member(mentorship_id: int, user: User, db: AsyncSession) -> Mentorship:
    result = await db.execute(select(Mentorship).where(Mentorship.id == mentorship_id))
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Mentorship not found")
    if m.mentor_id != user.id and m.mentee_id != user.id:
        raise HTTPException(status_code=403, detail="Not a member of this mentorship")
    return m


@router.get("/{mentorship_id}/goals", response_model=list[GoalOut])
async def list_goals(mentorship_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _check_member(mentorship_id, current_user, db)
    result = await db.execute(
        select(MentorshipGoal).where(MentorshipGoal.mentorship_id == mentorship_id)
        .order_by(MentorshipGoal.created_at)
    )
    return [GoalOut.from_orm(g) for g in result.scalars().all()]


@router.post("/{mentorship_id}/goals", response_model=GoalOut, status_code=201)
async def create_goal(mentorship_id: int, data: GoalCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _check_member(mentorship_id, current_user, db)
    due = datetime.fromisoformat(data.due_date) if data.due_date else None
    goal = MentorshipGoal(mentorship_id=mentorship_id, title=data.title, description=data.description, due_date=due)
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return GoalOut.from_orm(goal)


@router.patch("/{mentorship_id}/goals/{goal_id}", response_model=GoalOut)
async def update_goal(mentorship_id: int, goal_id: int, data: GoalUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _check_member(mentorship_id, current_user, db)
    result = await db.execute(select(MentorshipGoal).where(MentorshipGoal.id == goal_id, MentorshipGoal.mentorship_id == mentorship_id))
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if data.title is not None:      goal.title = data.title
    if data.description is not None: goal.description = data.description
    if data.due_date is not None:   goal.due_date = datetime.fromisoformat(data.due_date)
    if data.status is not None:
        goal.status = data.status
        if data.status == GoalStatus.COMPLETED and not goal.completed_at:
            goal.completed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(goal)
    return GoalOut.from_orm(goal)


@router.delete("/{mentorship_id}/goals/{goal_id}", status_code=204)
async def delete_goal(mentorship_id: int, goal_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await _check_member(mentorship_id, current_user, db)
    result = await db.execute(select(MentorshipGoal).where(MentorshipGoal.id == goal_id))
    goal = result.scalar_one_or_none()
    if goal:
        await db.delete(goal)
        await db.commit()
