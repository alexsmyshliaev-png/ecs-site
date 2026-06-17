"""Зависимость FastAPI: простая защита читающих эндпоинтов токеном.

Заголовок: Authorization: Bearer <ADMIN_TOKEN из .env>.
Если токен в настройках пуст — чтение закрыто полностью.
"""
from fastapi import Header, HTTPException

from app.core.config import settings


async def require_admin(authorization: str = Header(default="")) -> None:
    if not settings.ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Чтение выключено: задайте ADMIN_TOKEN в .env")
    if authorization != f"Bearer {settings.ADMIN_TOKEN}":
        raise HTTPException(status_code=401, detail="Неверный токен")
