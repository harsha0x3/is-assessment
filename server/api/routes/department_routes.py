# routes\department_routes.py
from fastapi import APIRouter, Depends, status, Path
from sqlalchemy.orm import Session
from api.controllers import department_controller as dept_ctrl
from db.connection import get_db_conn
from schemas import department_schemas as d_schemas
from services.auth.deps import require_moderator, require_admin
from schemas.auth_schemas import UserOut
from typing import Annotated
from pydantic import BaseModel

router = APIRouter(prefix="/departments", tags=["departments"])


@router.post("", summary="Create New Department", status_code=status.HTTP_201_CREATED)
async def create_department(
    payload: Annotated[
        d_schemas.DepartmentCreate, "Request fields for creating a department"
    ],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_moderator)],
):
    data = dept_ctrl.create_new_department(payload=payload, db=db)
    return {"msg": "Department created successfukky", "data": data}


@router.post(
    "/application/{app_id}/add",
    summary="Add Departments to Application",
    status_code=status.HTTP_201_CREATED,
)
async def add_departments_to_application(
    app_id: Annotated[str, Path(..., description="The ID of the application")],
    department_ids: Annotated[list[int], ""],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_admin)],
):
    data = dept_ctrl.add_departments_to_application(
        app_id=app_id, department_ids=department_ids, db=db
    )
    return {"msg": "", "data": data}


@router.post(
    "/{department_id}/add_user",
    summary="Add User to Department",
    status_code=status.HTTP_201_CREATED,
)
async def add_user_to_department(
    department_id: Annotated[int, Path(..., description="The ID of the department")],
    payload: Annotated[
        d_schemas.NewUserDepartmentAssign,
        "Request fields for assigning user to department",
    ],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_admin)],
):
    data = dept_ctrl.add_user_to_department(
        payload=payload, department_id=department_id, db=db
    )
    return {"msg": "", "data": data}


@router.get("/all", summary="Get All Departments")
async def get_all_departments(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_moderator)],
):
    data = dept_ctrl.get_all_departments(db=db)
    return {"msg": "", "data": data}


@router.get(
    "/application/{app_id}",
    summary="Get Departments by Application ID",
    status_code=status.HTTP_200_OK,
)
async def get_departments_by_application(
    app_id: Annotated[str, Path(..., description="The ID of the application")],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_moderator)],
):
    data = dept_ctrl.get_departments_by_application(app_id=app_id, db=db)
    return {"msg": "", "data": data}


@router.get("/{dept_id}/application/{app_id}/info")
async def get_department_info(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_moderator)],
    app_id: Annotated[str, Path(..., description="The ID of the application")],
    dept_id: Annotated[int, Path(..., description="The ID of the department")],
):
    data = dept_ctrl.get_department_info(db=db, app_id=app_id, dept_id=dept_id)
    return {"msg": "", "data": data}


class StatusUpdateRequest(BaseModel):
    status_val: str


@router.patch(
    "/{dept_id}/application/{app_id}/status",
    status_code=status.HTTP_200_OK,
)
def update_department_status(
    app_id: Annotated[str, ""],
    dept_id: Annotated[int, ""],
    payload: Annotated[StatusUpdateRequest, ""],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_moderator)],
):
    data = dept_ctrl.change_department_app_status(
        app_id=app_id,
        dept_id=dept_id,
        status_val=payload.status_val,
        db=db,
    )
    return {"msg": "Department status updated successfully", "data": data}
