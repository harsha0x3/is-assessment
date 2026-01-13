from typing import Annotated, Any

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from api.controllers.auth_controller import (
    clear_jwt_cookies,
    login_user,
    refresh_access_token,
)
from db.connection import get_db_conn
from schemas.auth_schemas import LoginRequest, UserWithDepartmentInfo, UserOut
from services.auth.deps import get_current_user
from models import User

from services.auth.csrf_handler import clear_csrf_cookie

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(
    db: Annotated[Session, Depends(get_db_conn)],
    response: Annotated[Response, "response to pass down to set cookies"],
    login_data: Annotated[
        LoginRequest, "Login form fields, including email and password"
    ],
) -> dict[str, str | UserWithDepartmentInfo]:
    log_user = LoginRequest(
        email=login_data.email,
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


@router.post("/logout")
def logout_user(response: Response):
    """
    Logs out the user by clearing the JWT cookies.
    """
    clear_jwt_cookies(response)
    clear_csrf_cookie(response)


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

        result = UserWithDepartmentInfo.model_validate(user)

        return {"msg": "", "data": result}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error geting profile details",
        )
