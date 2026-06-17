"""HTTP-слой событий аналитики: POST с сайта, чтение — по токену."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import require_admin
from app.dependencies.db import get_db
from app.schemas.event_schema import EventCreate, EventResponse
from app.services.event_service import EventService

router = APIRouter()


@router.post("/", response_model=EventResponse, status_code=201)
async def create_event(
    data: EventCreate,
    db: Session = Depends(get_db),
    service: EventService = Depends(),
):
    return service.create(db, data)


@router.get("/", response_model=list[EventResponse], dependencies=[Depends(require_admin)])
async def list_events(
    limit: int = 500,
    db: Session = Depends(get_db),
    service: EventService = Depends(),
):
    return service.get_all(db, limit=limit)


@router.get("/summary", dependencies=[Depends(require_admin)])
async def events_summary(
    db: Session = Depends(get_db),
    service: EventService = Depends(),
):
    return service.summary(db)
