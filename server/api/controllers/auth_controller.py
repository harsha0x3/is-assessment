from typing import Annotated

from fastapi import HTTPException, Response, status
from sqlalchemy import or_, select, func
from sqlalchemy.orm import Session, joinedload

from schemas.auth_schemas import LoginRequest, RegisterPayload, UserUpdateRequest
from models import User
from services.auth.jwt_handler import (
    create_tokens,
    set_jwt_cookies,
    verify_refresh_token,
)
from schemas.auth_schemas import (
    UserOut,
    AllUsersWithDepartments,
    DepartmentInAuth,
    UserWithDepartmentInfo,
    CompleteUserOut,
)
from services.auth.utils import qr_png_data_url
from services.auth.csrf_handler import set_csrf_cookie
from dotenv import load_dotenv
import os

is_prod = os.getenv("PROD_ENV", "false").lower() == "true"

load_dotenv()


def register_user(reg_user: RegisterPayload, db: Session, response: Response):
    existing_user = db.scalar(
        select(User).where(
            or_(User.username == reg_user.username, User.email == reg_user.email)
        )
    )
    if existing_user:
        if existing_user.username == reg_user.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    try:
        new_user = User(
            username=reg_user.username,
            email=reg_user.email,
            first_name=reg_user.first_name,
            last_name=reg_user.last_name,
            role=reg_user.role,
        )
        new_user.set_password(reg_user.password)
        if reg_user.enable_mfa:
            recovery_codes = new_user.enable_mfa()
            mfa_uri = new_user.get_mfa_uri()
            qr_code_url = qr_png_data_url(mfa_uri)
        else:
            recovery_codes = None
            mfa_uri = None
            qr_code_url = None

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # access, refresh = create_tokens(
        #     new_user.id, role=new_user.role, mfa_verified=False
        # )

        # set_jwt_cookies(response=response, access_token=access, refresh_token=refresh)

        return new_user

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration Failed {str(e)}",
        )


def login_user(
    log_user: LoginRequest, db: Session, response: Response
) -> UserWithDepartmentInfo:
    # q = select(User).where(or_(User.username == log_user.email_or_username, User.email == log_user.email_or_username))
    # print(f"[qq] - {q}")
    # print(f"select(User).where(or_({User.username} == {log_user.email_or_username}, em {User.email} == {log_user.email_or_username},)")
    # s = db.scalars(q).all()
    # print(s)
    # print(f"[Res - log] ")
    try:
        user = db.scalar(
            select(User).where(
                or_(
                    User.username == log_user.email_or_username,
                    User.email == log_user.email_or_username,
                )
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
        access_exp = set_jwt_cookies(
            response=response, access_token=access, refresh_token=refresh
        )
        set_csrf_cookie(response)
        result = UserWithDepartmentInfo(
            departments=user_depts, user=UserOut.model_validate(user)
        )

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error logging in"
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


def update_user_profile(
    current_user_id: str, user_id: str, db: Session, payload: UserUpdateRequest
):
    try:
        if current_user_id != user_id:
            user_role = db.scalar(select(User.role).where(User.id == current_user_id))
            if user_role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"You are not authorised. {user_id}",
                )

        editing_user = db.scalar(select(User).where(User.id == user_id))
        if not editing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User Not Found"
            )

        for key, val in payload.model_dump(
            exclude_none=True, exclude_unset=True
        ).items():
            setattr(editing_user, key, val)

        if payload.password:
            editing_user.set_password(payload.password)

        db.commit()
        db.refresh(editing_user)
        user_depts: list[DepartmentInAuth] = []
        for usr_dept, dept in zip(editing_user.departments, editing_user.departments):
            user_dept_info = DepartmentInAuth(
                user_dept_id=usr_dept.id,
                department_role=usr_dept.role,
                department_id=dept.id,
                department_name=dept.name,
                department_description=dept.description,
            )
            user_depts.append(user_dept_info)
        result = UserWithDepartmentInfo(
            departments=user_depts, user=UserOut.model_validate(editing_user)
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user. {e}",
        )


def get_all_users(db: Session):
    try:
        users = db.scalars(select(User).where(User.is_active)).unique().all()
        total_users = db.scalar(select(func.count(User.id)).where(User.is_active))

        # for user, user_dept, dept in users:
        #     user_depts = db.scalars(
        #         select(DepartmentUsers).where(DepartmentUsers.user_id == user.id)
        #     )
        #     dept_ids = [dept.department_id for dept in user_depts] if user_depts else []

        #     data = AllUsersOut(
        #         id=user.id,
        #         username=user.username,
        #         first_name=user.first_name,
        #         last_name=user.last_name,
        #         role=user.role,
        #         mfa_recovery_codes=user.mfa_recovery_codes,
        #         mfa_secret=user.mfa_secret,
        #         department_ids=dept_ids,
        #     )
        #     res.append(data)

        result = []
        for user in users:
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
            user_data = CompleteUserOut.model_validate(user)

            res_data = AllUsersWithDepartments(user=user_data, departments=user_depts)
            result.append(res_data)

        return {"users": result, "total_count": total_users}

    except Exception as e:
        print("Err")
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting all users",
        )
