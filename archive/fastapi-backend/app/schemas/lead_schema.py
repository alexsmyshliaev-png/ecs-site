"""Pydantic-схемы лида: то, что присылает фронтенд, и то, что отдаём."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class LeadCreate(BaseModel):
    """Тело POST /api/leads — формируется в frontend/assets/js/leads.js."""

    model_config = ConfigDict(extra="allow")  # car, object, topic, when и т.п. — в extra

    name: str = Field(min_length=1, max_length=120)
    phone: str = Field(default="", max_length=32)
    email: str = Field(default="", max_length=120)
    product: str = Field(default="", max_length=64)
    form: str = Field(default="", max_length=64)
    comment: str = Field(default="", max_length=4000)
    page: str = Field(default="", max_length=500)
    referrer: str = Field(default="", max_length=500)
    utm_first: Optional[dict] = None
    utm_last: Optional[dict] = None


class LeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    name: str
    phone: str
    email: str
    product: str
    form: str
    comment: str
    page: str
    utm_first: Optional[dict]
    utm_last: Optional[dict]
    bitrix_status: str
    bitrix_lead_id: Optional[int]
