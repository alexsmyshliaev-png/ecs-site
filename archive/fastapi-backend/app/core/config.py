"""Настройки приложения. Все секреты — только через .env, не в коде."""
from pathlib import Path

from pydantic_settings import BaseSettings

# Папка backend/ — чтобы пути не зависели от того, откуда запущен процесс
BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    # Входящий вебхук Битрикс24 (права CRM), вид:
    # https://portal.bitrix24.ru/rest/1/xxxxxxxx/
    BITRIX_WEBHOOK_URL: str = ""

    # SQLite-файл в папке backend/
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'ecs.db'}"

    # Откуда разрешаем запросы браузера (адреса фронтенда)
    CORS_ORIGINS: list[str] = ["http://localhost:8765", "http://127.0.0.1:8765"]

    # Токен для чтения лидов/событий (GET-эндпоинты). Пусто = чтение выключено.
    ADMIN_TOKEN: str = ""

    model_config = {"env_file": str(BASE_DIR / ".env")}


settings = Settings()
