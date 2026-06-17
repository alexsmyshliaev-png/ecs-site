"""ORM-модель лида (заявки с сайта)."""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import JSON, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str] = mapped_column(String(32), default="")
    email: Mapped[str] = mapped_column(String(120), default="")
    product: Mapped[str] = mapped_column(String(64), default="")
    form: Mapped[str] = mapped_column(String(64), default="")
    comment: Mapped[str] = mapped_column(Text, default="")
    extra: Mapped[dict] = mapped_column(JSON, default=dict)  # car, object, topic, when…

    page: Mapped[str] = mapped_column(String(500), default="")
    referrer: Mapped[str] = mapped_column(String(500), default="")
    utm_first: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    utm_last: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Статус пересылки в Битрикс24: pending / sent / failed / disabled
    bitrix_status: Mapped[str] = mapped_column(String(16), default="pending")
    bitrix_lead_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
