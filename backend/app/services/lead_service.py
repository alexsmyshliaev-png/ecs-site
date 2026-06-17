"""Бизнес-логика лидов: сохранить в базу, переслать в Битрикс24."""
import logging

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.lead_model import Lead
from app.schemas.lead_schema import LeadCreate
from app.services.bitrix_service import BitrixService

logger = logging.getLogger(__name__)

_KNOWN = {"name", "phone", "email", "product", "form", "comment", "page", "referrer", "utm_first", "utm_last", "ts"}


class LeadService:
    def __init__(self) -> None:
        self._bitrix = BitrixService()

    async def create(self, db: Session, data: LeadCreate) -> Lead:
        """Лид сначала сохраняется локально (ни одна заявка не теряется),
        затем пересылается в Битрикс24 — статус пишем в bitrix_status."""
        payload = data.model_dump()
        extra = {k: v for k, v in payload.items() if k not in _KNOWN}

        lead = Lead(
            name=data.name,
            phone=data.phone,
            email=data.email,
            product=data.product,
            form=data.form,
            comment=data.comment,
            page=data.page,
            referrer=data.referrer,
            utm_first=data.utm_first,
            utm_last=data.utm_last,
            extra=extra,
            bitrix_status="pending" if settings.BITRIX_WEBHOOK_URL else "disabled",
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)

        if settings.BITRIX_WEBHOOK_URL:
            try:
                lead.bitrix_lead_id = await self._bitrix.send_lead(lead)
                lead.bitrix_status = "sent"
            except Exception:  # noqa: BLE001 — лид уже сохранён, падать нельзя
                logger.exception("Не удалось отправить лид %s в Битрикс24", lead.id)
                lead.bitrix_status = "failed"
            db.commit()
            db.refresh(lead)

        return lead

    def get_all(self, db: Session, limit: int = 200) -> list[Lead]:
        return list(db.query(Lead).order_by(Lead.id.desc()).limit(limit))
