from typing import Annotated

from fastapi import HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from schemas.auth_schemas import LoginRequest
from models import User
from services.auth.jwt_handler import (
    create_tokens,
    set_jwt_cookies,
    verify_refresh_token,
)
from schemas.auth_schemas import UserOut, DepartmentInAuth, UserWithDepartmentInfo
from services.auth.csrf_handler import set_csrf_cookie
from dotenv import load_dotenv
import os

is_prod = os.getenv("PROD_ENV", "false").lower() == "true"

load_dotenv()


def login_user(
    log_user: LoginRequest, db: Session, response: Response
) -> UserWithDepartmentInfo:
    try:
        user = db.scalar(
            select(User).where(
                User.email == log_user.email,
            )
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Credentials.",
            )
        if not user.verify_password(log_user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="User account disabled"
            )

        if user.mfa_enabled:
            if not log_user.mfa_code:
                raise HTTPException(status_code=400, detail="MFA code required")
            if not user.verify_mfa_code(log_user.mfa_code):
                raise HTTPException(status_code=401, detail="Invalid MFA code")

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

        mfa_verified = user.mfa_enabled
        access, refresh = create_tokens(
            user_id=user.id, role=user.role, mfa_verified=mfa_verified
        )
        _access_exp = set_jwt_cookies(
            response=response, access_token=access, refresh_token=refresh
        )
        set_csrf_cookie(response)
        result = UserWithDepartmentInfo.model_validate(user)

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error logging in", "err_stack": str(e)},
        )


def refresh_access_token(
    refresh_token: Annotated[str, "refresh token"],
    db: Annotated[Session, "Getting db connectoion"],
    response: Annotated[Response, ""],
):
    payload = verify_refresh_token(token=refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or Expired Refresh Token",
        )
    user_id = payload.get("sub")
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    access, refresh = create_tokens(
        user_id=user.id, role=user.role, mfa_verified=user.mfa_enabled
    )

    access_exp = set_jwt_cookies(
        response=response, access_token=access, refresh_token=refresh
    )
    set_csrf_cookie(response)

    return {"user": user.to_dict_safe(), "access_exp": access_exp.get("access_exp")}


def clear_jwt_cookies(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=is_prod,
        samesite="lax" if is_prod else "none",
        path="/",
    )
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=is_prod,
        samesite="lax" if is_prod else "none",
        path="/",
    )
