from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from models.users import User
from services.auth.deps import get_current_user, require_admin
from schemas.department_schemas import NewUserDepartmentAssign
from api.controllers.department_controller import add_user_to_multiple_departments
from db.connection import get_db_conn
from schemas.auth_schemas import (
    RegisterRequest,
    UserUpdateRequest,
    UserOut,
)
from api.controllers import user_management_controller as usr_ctrl

router = APIRouter(prefix="/user-management", tags=["auth"])


@router.post("/register")
async def register(
    payload: Annotated[RegisterRequest, "User registration form fields"],
    db: Annotated[Session, Depends(get_db_conn)],
    response: Annotated[Response, "response to pass down to set cookies"],
    current_user: Annotated[
        UserOut, Depends(require_admin), "Fetching logged in user details"
    ],
) -> Annotated[
    dict[str, Any], "Registers users and returns mfa uri and registration status"
]:
    try:
        data = usr_ctrl.admin_create_user(payload=payload, db=db)

        return {"msg": "User created successfully", "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding new user",
        )


@router.get("/all")
async def list_all_users(
    current_user: Annotated[
        User, Depends(require_admin), "Fetching logged in user details"
    ],
    db: Annotated[Session, Depends(get_db_conn)],
):
    data = usr_ctrl.get_all_users(db=db)
    return {"msg": "All users fetched successfully", "data": data}


@router.patch("/profile/{editing_user_id}")
def update_profile(
    editing_user_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db_conn)],
    request: UserUpdateRequest,
):
    try:
        dept_payload = NewUserDepartmentAssign(user_id=editing_user_id)
        department_ids = request.department_ids if request.department_ids else []
        add_user_to_multiple_departments(
            payload=dept_payload, department_ids=department_ids, db=db
        )
        curr_usr = UserOut.model_validate(current_user)
        return usr_ctrl.update_user_profile(
            current_user=curr_usr,
            user_id=editing_user_id,
            db=db,
            payload=request,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user details",
        )
