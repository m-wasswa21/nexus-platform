from __future__ import annotations
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import UserRole


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.MENTEE
    title: str | None = None
    company: str | None = None
    bio: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str | None = None
    title: str | None = None
    company: str | None = None
    bio: str | None = None
    skills: str | None = None
    linkedin_url: str | None = None
    is_available: bool | None = None
    avatar_url: str | None = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    title: str | None
    company: str | None
    bio: str | None
    skills: str | None
    linkedin_url: str | None
    avatar_url: str | None
    is_available: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
