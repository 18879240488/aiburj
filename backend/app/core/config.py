from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "aiburj API"
    database_url: str = "sqlite:///./aiburj.db"
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    class Config:
        env_file = ".env"


settings = Settings()
