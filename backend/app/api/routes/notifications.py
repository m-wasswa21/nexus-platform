from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.api.deps import get_db, get_current_user
from app.models.notification import Notification
from app.models.user import User
from pydantic import BaseModel

router = APIRouter()


class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    message: str | None
    link: str | None
    is_read: bool
    created_at: str

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_dt(cls, n: Notification):
        return cls(
            id=n.id, type=n.type, title=n.title, message=n.message,
            link=n.link, is_read=n.is_read,
            created_at=n.created_at.isoformat() if n.created_at else "",
        )


@router.get("", response_model=list[NotificationOut])
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    return [NotificationOut.from_orm_dt(n) for n in result.scalars().all()]


@router.patch("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)  # noqa
        .values(is_read=True)
    )
    await db.commit()
    return {"ok": True}


@router.patch("/{notif_id}/read")
async def mark_read(
    notif_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await db.execute(
        update(Notification)
        .where(Notification.id == notif_id, Notification.user_id == current_user.id)
        .values(is_read=True)
    )
    await db.commit()
    return {"ok": True}
