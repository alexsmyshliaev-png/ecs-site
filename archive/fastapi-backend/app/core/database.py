"""Подключение к базе данных (SQLite через SQLAlchemy)."""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def create_tables() -> None:
    # Импорт моделей нужен, чтобы они зарегистрировались в metadata
    from app.models import event_model, lead_model  # noqa: F401

    Base.metadata.create_all(bind=engine)
