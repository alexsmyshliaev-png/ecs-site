"""HTTP-слой лидов: POST с сайта, GET для владельца (по токену)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.auth import require_admin
from app.dependencies.db import get_db
from app.schemas.lead_schema import LeadCreate, LeadResponse
from app.services.lead_service import LeadService

router = APIRouter()


@router.post("/", response_model=LeadResponse, status_code=201)
async def create_lead(
    data: LeadCreate,
    db: Session = Depends(get_db),
    service: LeadService = Depends(),
):
    return await service.create(db, data)


@router.get("/", response_model=list[LeadResponse], dependencies=[Depends(require_admin)])
async def list_leads(
    limit: int = 200,
    db: Session = Depends(get_db),
    service: LeadService = Depends(),
):
    return service.get_all(db, limit=limit)
