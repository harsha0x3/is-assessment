import os
import urllib.parse
from typing import Annotated, Any

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Response, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from api.controllers.auth_controller import (
    clear_jwt_cookies,
    login_user,
    request_for_passsword_reset,
    reset_password,
    microsoft_callback_login,
    logout,
)
from db.connection import get_db_conn
from services.auth.csrf_handler import clear_csrf_cookie
from models import User, UserSession
from schemas.auth_schemas import (
    DepartmentInAuth,
    LoginRequest,
    PasswordResetRequest,
    ResetPasswordPayload,
    UserOut,
    UserWithDepartmentInfo,
)
from schemas.vertical_schemas import VerticalBase
from services.auth.deps import get_current_user
from services.auth.microsoft_oauth import (
    AUTHORIZE_URL,
    CLIENT_ID,
    REDIRECT_URI,
)


load_dotenv()

VALID_EMAIL_ORG = os.getenv("VALID_EMAIL_ORG")

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(
    db: Annotated[Session, Depends(get_db_conn)],
    response: Annotated[Response, "response to pass down to set cookies"],
    request: Annotated[Request, "response to pass down to set cookies"],
    login_data: Annotated[
        LoginRequest, "Login form fields, including email and password"
    ],
) -> dict[str, str | UserWithDepartmentInfo]:
    log_user = LoginRequest(
        email=login_data.email,
        password=login_data.password,
        mfa_code=login_data.mfa_code,
    )

    data = login_user(log_user=log_user, db=db, response=response, request=request)
    return {"msg": "Login Successfull", "data": data}


@router.get("/microsoft/login")
def microsoft_login():
    params = {
        "client_id": CLIENT_ID,
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
        "response_mode": "query",
        "scope": "openid profile email",
    }
    url = f"{AUTHORIZE_URL}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)


@router.get("/microsoft/callback")
def microsoft_callback(
    code: Annotated[str, ""],
    response: Annotated[Response, ""],
    request: Annotated[Request, ""],
    db: Annotated[Session, Depends(get_db_conn)],
):
    return microsoft_callback_login(
        code=code, response=response, request=request, db=db
    )


@router.post("/logout")
def logout_user(
    response: Response,
    request: Annotated[Request, ""],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[
        User, Depends(get_current_user), "Fetching logged in user details"
    ],
):
    """
    Logs out the user by clearing the JWT cookies.
    """
    logout(request=request, response=response, db=db)
    clear_jwt_cookies(response)
    clear_csrf_cookie(response)
    return {"msg": "Logout Successful"}


@router.post("/password-reset/request")
async def request_password_reset(
    db: Annotated[Session, Depends(get_db_conn)],
    payload: Annotated[PasswordResetRequest, "email for password reset"],
):
    """Request a password-reset OTP to be sent to the user's email."""
    await request_for_passsword_reset(db=db, payload=payload)
    return {"msg": "If the email exists, a reset code has been sent."}


@router.post("/password-reset")
def reset_password_route(
    db: Annotated[Session, Depends(get_db_conn)],
    payload: Annotated[ResetPasswordPayload, "email, otp and new_password"],
):
    """Reset the user's password using the provided OTP and new password."""
    result = reset_password(db=db, payload=payload)
    return result


@router.get("/me")
def get_me(
    current_user: Annotated[
        User, Depends(get_current_user), "Fetching logged in user details"
    ],
    db: Annotated[Session, Depends(get_db_conn)],
):
    try:
        user = db.get(User, current_user.id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
            )

        user_depts: list[DepartmentInAuth] = []
        for usr_dept, dept in zip(user.department_links, user.departments):
            user_dept_info = DepartmentInAuth(
                user_dept_id=usr_dept.id,
                department_role=usr_dept.role,
                department_id=dept.id,
                department_name=dept.name,
                department_description=dept.description,
            )
            user_depts.append(user_dept_info)

        verticals = [
            VerticalBase(id=v.id, name=v.name, description=v.description)
            for v in user.verticals
        ]

        result = UserWithDepartmentInfo(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            created_at=user.created_at,
            updated_at=user.updated_at,
            departments=user_depts,
            verticals=verticals,
        )

        return {"msg": "", "data": result}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error geting profile details",
        )
