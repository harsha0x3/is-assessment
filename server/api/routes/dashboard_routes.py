from api.controllers import dashboard_controller as dc
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from db.connection import get_db_conn
from schemas.auth_schemas import UserOut
from services.auth.deps import get_current_user
from typing import Annotated

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary/applications")
def dashboard_summary(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    return dc.get_app_status_summary(db)


@router.get("/summary/departments")
def get_department_status_summary(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    status_filter: Annotated[str | None, Query(...)] = None,
):
    return dc.get_department_status_summary(db=db, status_filter=status_filter)


@router.get("/summary/priority-wise")
def priority_wise_summary(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    return dc.get_priority_wise_grouped_summary(db=db)


@router.get("/summary/vertical-wise")
def vertical_wise_summary(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    return dc.get_vertical_wise_app_statuses(db=db)
