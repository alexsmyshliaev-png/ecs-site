"""ORM-модель события аналитики (действия посетителей)."""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import JSON, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    event: Mapped[str] = mapped_column(String(64))
    page: Mapped[str] = mapped_column(String(500), default="")
    referrer: Mapped[str] = mapped_column(String(500), default="")
    params: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    utm_last: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
