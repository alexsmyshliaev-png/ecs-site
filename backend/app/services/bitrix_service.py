"""Интеграция с Битрикс24: создание лида через входящий вебхук.

Вебхук хранится в .env на сервере и никогда не попадает в браузер.

Используется универсальный метод crm.item.add (entityTypeId=1 — лид):
прежний crm.lead.add объявлен устаревшим в документации REST API
(https://apidocs.bitrix24.com, api-reference/crm/universal/crm-item-add).
"""
from typing import Optional
import logging

import httpx

from app.core.config import settings
from app.models.lead_model import Lead

logger = logging.getLogger(__name__)

LEAD_ENTITY_TYPE_ID = 1  # системный тип CRM «Лид»


class BitrixService:
    async def send_lead(self, lead: Lead) -> Optional[int]:
        """Создаёт лид в CRM. Возвращает ID лида в Битрикс24 или None."""
        if not settings.BITRIX_WEBHOOK_URL:
            return None

        utm = lead.utm_last or lead.utm_first or {}
        fields: dict = {
            "title": f"Сайт ЕЦС: {lead.product or 'заявка'} — {lead.name}",
            "name": lead.name,
            "comments": f"{lead.comment}\nФорма: {lead.form}\nСтраница: {lead.page}",
            "sourceId": "WEB",
            "sourceDescription": f"Форма «{lead.form}» на сайте",
            "utmSource": utm.get("utm_source", ""),
            "utmMedium": utm.get("utm_medium", ""),
            "utmCampaign": utm.get("utm_campaign", ""),
            "utmContent": utm.get("utm_content", ""),
            "utmTerm": utm.get("utm_term", ""),
        }
        # телефон и email — мультиполя, передаются массивом fm
        fm = []
        if lead.phone:
            fm.append({"typeId": "PHONE", "valueType": "WORK", "value": lead.phone})
        if lead.email:
            fm.append({"typeId": "EMAIL", "valueType": "WORK", "value": lead.email})
        if fm:
            fields["fm"] = fm

        url = settings.BITRIX_WEBHOOK_URL.rstrip("/") + "/crm.item.add.json"
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                url,
                json={"entityTypeId": LEAD_ENTITY_TYPE_ID, "fields": fields},
            )
            resp.raise_for_status()
            data = resp.json()
            if "error" in data:
                logger.error("Bitrix24 error: %s", data)
                raise RuntimeError(data.get("error_description", "Bitrix24 error"))
            return (data.get("result") or {}).get("item", {}).get("id")
