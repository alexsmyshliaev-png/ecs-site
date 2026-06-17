"""Точка входа FastAPI: middleware и регистрация роутеров. Логики здесь нет."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_tables
from app.routers import events, leads


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    yield


app = FastAPI(title="ЕЦС API", description="Лиды и аналитика сайта ЕЦС", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router, prefix="/api/leads", tags=["leads"])
app.include_router(events.router, prefix="/api/events", tags=["events"])


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok"}
