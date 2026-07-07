"""Бизнес-логика событий аналитики: сохранение и сводка."""
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.event_model import Event
from app.schemas.event_schema import EventCreate


class EventService:
    def create(self, db: Session, data: EventCreate) -> Event:
        event = Event(**data.model_dump())
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    def get_all(self, db: Session, limit: int = 500) -> list[Event]:
        return list(db.query(Event).order_by(Event.id.desc()).limit(limit))

    def summary(self, db: Session) -> list[dict]:
        """Сводка: сколько раз случилось каждое событие (для быстрых отчётов)."""
        rows = (
            db.query(Event.event, func.count(Event.id))
            .group_by(Event.event)
            .order_by(func.count(Event.id).desc())
            .all()
        )
        return [{"event": e, "count": c} for e, c in rows]
