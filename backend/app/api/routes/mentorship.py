from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from app.api.deps import get_db, get_current_user
from app.models.mentorship import Mentorship, MentorshipStatus
from app.models.notification import Notification
from app.models.user import User, UserRole
from app.schemas.mentorship import MentorshipRequest, MentorshipUpdate, MentorshipOut

router = APIRouter()


async def _notify(db: AsyncSession, user_id: int, type: str, title: str, message: str, link: str):
    n = Notification(user_id=user_id, type=type, title=title, message=message, link=link)
    db.add(n)


def _q():
    return select(Mentorship).options(
        selectinload(Mentorship.mentor),
        selectinload(Mentorship.mentee),
    )


@router.post("", response_model=MentorshipOut, status_code=201)
async def request_mentorship(
    data: MentorshipRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.MENTEE, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only mentees can request mentorship")
    existing = await db.execute(
        select(Mentorship).where(
            Mentorship.mentor_id == data.mentor_id,
            Mentorship.mentee_id == current_user.id,
            Mentorship.status.in_([MentorshipStatus.PENDING, MentorshipStatus.ACTIVE]),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Request already exists")
    m = Mentorship(mentor_id=data.mentor_id, mentee_id=current_user.id, message=data.message, goals=data.goals)
    db.add(m)
    await db.flush()

    # Notify mentor
    await _notify(db, data.mentor_id, "mentorship_request",
                  f"New mentorship request from {current_user.name}",
                  data.message or "Wants to connect with you as a mentor.",
                  "/mentorship")
    await db.commit()
    await db.refresh(m)
    result = await db.execute(_q().where(Mentorship.id == m.id))
    return MentorshipOut.model_validate(result.scalar_one())


@router.get("", response_model=list[MentorshipOut])
async def my_mentorships(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        _q().where((Mentorship.mentor_id == current_user.id) | (Mentorship.mentee_id == current_user.id))
        .order_by(Mentorship.created_at.desc())
    )
    return [MentorshipOut.model_validate(m) for m in result.scalars().all()]


@router.patch("/{mentorship_id}", response_model=MentorshipOut)
async def update_mentorship(
    mentorship_id: int,
    data: MentorshipUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(_q().where(Mentorship.id == mentorship_id))
    m = result.scalar_one_or_none()
    if not m:
        raise HTTPException(status_code=404, detail="Not found")
    if m.mentor_id != current_user.id and m.mentee_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    prev_status = m.status
    m.status = data.status
    if data.goals:
        m.goals = data.goals
    if data.status == MentorshipStatus.ACTIVE and not m.started_at:
        m.started_at = datetime.now(timezone.utc)
    if data.status == MentorshipStatus.COMPLETED and not m.completed_at:
        m.completed_at = datetime.now(timezone.utc)

    # Notify the other party
    if prev_status != data.status:
        if data.status == MentorshipStatus.ACTIVE:
            await _notify(db, m.mentee_id, "mentorship_accepted",
                          f"{m.mentor.name} accepted your mentorship request! 🎉",
                          "Your mentorship journey begins now.",
                          "/mentorship")
        elif data.status == MentorshipStatus.DECLINED:
            await _notify(db, m.mentee_id, "mentorship_declined",
                          f"{m.mentor.name} declined your request",
                          "Consider connecting with another mentor.",
                          "/mentors")
        elif data.status == MentorshipStatus.COMPLETED:
            notify_id = m.mentee_id if current_user.id == m.mentor_id else m.mentor_id
            await _notify(db, notify_id, "mentorship_completed",
                          "Mentorship marked as completed 🏆",
                          "Congratulations on completing the journey!",
                          "/mentorship")

    await db.commit()
    result = await db.execute(_q().where(Mentorship.id == m.id))
    return MentorshipOut.model_validate(result.scalar_one())
