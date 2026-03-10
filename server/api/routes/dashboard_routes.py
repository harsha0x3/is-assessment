from api.controllers import dashboard_controller as dc
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.orm import Session
from db.connection import get_db_conn
from schemas.auth_schemas import UserOut
from services.auth.deps import get_current_user
from typing import Annotated
from schemas.dashboard_schemas import AppSummaryQueryParams, StatusPerDepartmentParams

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary/applications")
def dashboard_summary(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    severity: Annotated[str | None, Query()] = None,
    priority: Annotated[str | None, Query()] = None,
    sla: Annotated[int | None, Query()] = None,
):
    int_severity_list = []
    int_priority_list = []
    if severity and severity.strip() != "":

        severity_list = severity.split(",")
        int_severity_list = [int(s) for s in severity_list]
    
    if priority and priority.strip() != "":
        priority_list = priority.split(",")

        int_priority_list = [int(s) for s in priority_list]
    
    params = AppSummaryQueryParams(severity=int_severity_list, priority=int_priority_list, sla=sla)
    return dc.get_app_status_summary(db, params=params)


@router.get("/summary/departments")
def get_department_status_summary(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    status_filter: Annotated[str | None, Query(...)] = None,
    sla_filter: Annotated[int | None, Query(...)] = None,
):
    return dc.get_department_status_summary(
        db=db, status_filter=status_filter, sla_filter=sla_filter
    )


@router.get("/summary/department/{department_id}/category")
def get_department_category_status_summary(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    dept_status: Annotated[str, Query(...)],
    department_id: Annotated[int, Path(...)],
    app_status: Annotated[str, Query(...)],
    sla_filter: Annotated[int | None, Query(...)] = None,
):
    return dc.get_department_sub_category(
        db=db,
        app_status=app_status,
        sla_filter=sla_filter,
        department_id=department_id,
        dept_status=dept_status,
    )


@router.get("/summary/priority-wise")
def priority_wise_summary(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    status_filter: Annotated[str | None, Query(...)] = None,
):
    return dc.get_priority_wise_grouped_summary(db=db, status_filter=status_filter)


@router.get("/summary/vertical-wise")
def vertical_wise_summary(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    return dc.get_vertical_wise_app_statuses(db=db)


@router.get("/summary/departments/status")
def get_statuses_per_department(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    app_status: Annotated[str, Query(...)],
    dept_status: Annotated[str, Query(...)],
    sla_filter: Annotated[int | None, Query(...)] = None,
    severity: Annotated[str | None, Query()] = None,
    priority: Annotated[str | None, Query()] = None,
    app_sla: Annotated[int | None, Query()] = None,
):
    
    int_severity_list = []
    int_priority_list = []
    if severity and severity.strip() != "":

        severity_list = severity.split(",")
        int_severity_list = [int(s) for s in severity_list]
    
    if priority and priority.strip() != "":
        priority_list = priority.split(",")

        int_priority_list = [int(s) for s in priority_list]
    
    params = StatusPerDepartmentParams(app_sla=app_sla, severity=int_severity_list, priority=int_priority_list, dept_status=dept_status, app_status=app_status, sla_filter=sla_filter)
    return dc.get_statuses_per_dept(
        db=db, params = params
    )
