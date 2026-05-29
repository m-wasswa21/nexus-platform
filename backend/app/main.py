from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from app.api.router import api_router
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
import app.models  # noqa — register all models
import os

# Columns added after the initial release; safe to re-run (duplicate errors are swallowed)
_MIGRATIONS = [
    "ALTER TABLE boards ADD COLUMN cover_image_url VARCHAR(500)",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        for stmt in _MIGRATIONS:
            try:
                await conn.execute(text(stmt))
            except OperationalError:
                pass  # column already exists
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Nexus — Mentorship & Appreciation Platform for CIO/CxO Africa",
    openapi_url=f"{settings.API_V1_STR}/docs/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    lifespan=lifespan,
    redirect_slashes=False,  # Prevent 307 redirects (trailing-slash ↔ no-slash) that drop auth headers
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://(board|backendboard)\.cio-cxo\.africa",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

os.makedirs("uploads/posts", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/health")
async def health():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
