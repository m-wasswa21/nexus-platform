from fastapi import APIRouter
from app.api.routes import auth, users, boards, mentorship, notifications, goals, bookmarks

api_router = APIRouter()
api_router.include_router(auth.router,          prefix="/auth",          tags=["auth"])
api_router.include_router(users.router,         prefix="/users",         tags=["users"])
api_router.include_router(boards.router,        prefix="/boards",        tags=["boards"])
api_router.include_router(mentorship.router,    prefix="/mentorship",    tags=["mentorship"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(goals.router,         prefix="/mentorship",    tags=["goals"])
api_router.include_router(bookmarks.router,     prefix="/bookmarks",     tags=["bookmarks"])
