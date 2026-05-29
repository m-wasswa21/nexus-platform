from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexus Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    SECRET_KEY: str = "nexus-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    DATABASE_URL: str = "sqlite+aiosqlite:///./nexus.db"

    BACKEND_CORS_ORIGINS: str = (
        "http://localhost:3000,"
        "http://localhost:3001,"
        "https://board.cio-cxo.africa"
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
