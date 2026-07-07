"""Pydantic-схемы события аналитики."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class EventCreate(BaseModel):
    """Тело POST /api/events — шлёт frontend/assets/js/analytics.js."""

    event: str = Field(min_length=1, max_length=64)
    page: str = Field(default="", max_length=500)
    referrer: str = Field(default="", max_length=500)
    params: Optional[dict] = None
    utm_last: Optional[dict] = None


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    event: str
    page: str
    params: Optional[dict]
    utm_last: Optional[dict]
