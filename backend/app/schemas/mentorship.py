from pydantic import BaseModel
from datetime import datetime
from app.models.mentorship import MentorshipStatus
from app.schemas.user import UserOut


class MentorshipRequest(BaseModel):
    mentor_id: int
    message: str | None = None
    goals: str | None = None


class MentorshipUpdate(BaseModel):
    status: MentorshipStatus
    goals: str | None = None


class MentorshipOut(BaseModel):
    id: int
    mentor_id: int
    mentee_id: int
    status: MentorshipStatus
    message: str | None
    goals: str | None
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None
    mentor: UserOut
    mentee: UserOut

    model_config = {"from_attributes": True}
