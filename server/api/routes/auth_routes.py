from typing import Annotated, Any

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from api.controllers.auth_controller import (
    clear_jwt_cookies,
    login_user,
    refresh_access_token,
    register_user,
    update_user_profile,
    get_all_users,
)
from db.connection import get_db_conn
from schemas.auth_schemas import (
    LoginRequest,
    RegisterRequest,
    UserUpdateRequest,
    AllUsersWithDepartments,
    UserWithDepartmentInfo,
    DepartmentInAuth,
    CompleteUserOut,
    RegisterResponse,
)
from models.core.users import User
from services.auth.deps import get_current_user, require_admin
from services.auth.csrf_handler import clear_csrf_cookie
from schemas.auth_schemas import UserOut
from schemas.department_schemas import NewUserDepartmentAssign
from api.controllers.department_controller import add_user_to_multiple_departments


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(
    payload: Annotated[RegisterRequest, "User registration form fields"],
    db: Annotated[Session, Depends(get_db_conn)],
    response: Annotated[Response, "response to pass down to set cookies"],
    current_user: Annotated[
        UserOut, Depends(get_current_user), "Fetching logged in user details"
    ],
) -> Annotated[
    dict[str, Any], "Registers users and returns mfa uri and registration status"
]:
    try:
        new_user_res = register_user(reg_user=payload, db=db, response=response)
        if new_user_res:
            user_depts = NewUserDepartmentAssign(
                user_id=new_user_res.id, role="moderator"
            )
            add_user_to_multiple_departments(
                payload=user_depts, department_ids=payload.department_ids, db=db
            )

        user_depts_data: list[DepartmentInAuth] = []
        for usr_dept, dept in zip(
            new_user_res.department_links, new_user_res.departments
        ):
            user_dept_info = DepartmentInAuth(
                user_dept_id=usr_dept.id,
                department_role=usr_dept.role,
                department_id=dept.id,
                department_name=dept.name,
                department_description=dept.description,
            )
            user_depts_data.append(user_dept_info)
        data = RegisterResponse(
            departments=user_depts_data,
            user=CompleteUserOut.model_validate(new_user_res),
        )
        return {"msg": "User created successfully", "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding new user",
        )


@router.post("/login")
async def login(
    db: Annotated[Session, Depends(get_db_conn)],
    response: Annotated[Response, "response to pass down to set cookies"],
    login_data: Annotated[
        LoginRequest, "Login form fields, including email/username and password"
    ],
) -> dict[str, str | UserWithDepartmentInfo]:
    log_user = LoginRequest(
        email_or_username=login_data.email_or_username,
        password=login_data.password,
        mfa_code=login_data.mfa_code,
    )

    data = login_user(log_user=log_user, db=db, response=response)
    return {"msg": "Login Successfull", "data": data}


@router.post("/refresh")
async def refresh_auth_tokens(
    response: Annotated[Response, "response to pass down to set cookies"],
    db: Annotated[Session, Depends(get_db_conn)],
    refresh_token: Annotated[str | None, ""] = Cookie(default=None),
) -> Annotated[
    dict[str, Any],
    "Refreshes the access token before it expires and while the refresh token exists",
]:
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token"
        )
    return refresh_access_token(refresh_token=refresh_token, db=db, response=response)


@router.get("/all")
async def list_all_users(
    current_user: Annotated[
        User, Depends(require_admin), "Fetching logged in user details"
    ],
    db: Annotated[Session, Depends(get_db_conn)],
):
    data = get_all_users(db=db)
    return {"msg": "All users fetched successfully", "data": data}


@router.get("/me")
def get_me(
    current_user: Annotated[
        UserOut, Depends(get_current_user), "Fetching logged in user details"
    ],
    db: Annotated[Session, Depends(get_db_conn)],
):
    try:
        user = db.get(User, current_user.id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
            )
        user_depts_data: list[DepartmentInAuth] = []

        for usr_dept, dept in zip(user.department_links, user.departments):
            user_dept_info = DepartmentInAuth(
                user_dept_id=usr_dept.id,
                department_role=usr_dept.role,
                department_id=dept.id,
                department_name=dept.name,
                department_description=dept.description,
            )
            user_depts_data.append(user_dept_info)
        result = UserWithDepartmentInfo(
            departments=user_depts_data, user=UserOut.model_validate(user)
        )

        return {"msg": "", "data": result}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error geting profile details",
        )


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
        return update_user_profile(
            current_user_id=current_user.id,
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


@router.post("/logout")
def logout_user(response: Response):
    """
    Logs out the user by clearing the JWT cookies.
    """
    clear_jwt_cookies(response)
    clear_csrf_cookie(response)
