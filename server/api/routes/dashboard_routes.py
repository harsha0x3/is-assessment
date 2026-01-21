from api.controllers import dashboard_controller as dc
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.connection import get_db_conn
from schemas.auth_schemas import UserOut
from services.auth.deps import get_current_user
from typing import Annotated

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def dashboard_stats(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    return dc.get_dashboard_status_stats(db)


@router.get("/stats/priority-wise")
def priority_wise_stats(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    return dc.get_priority_wise_grouped_stats(db=db)
