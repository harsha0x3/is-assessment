from typing import Annotated

from fastapi import HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from schemas.auth_schemas import LoginRequest
from models import User, PasswordResetOtp
from services.auth.jwt_handler import (
    create_tokens,
    set_jwt_cookies,
    verify_refresh_token,
)
from schemas.auth_schemas import (
    DepartmentInAuth,
    UserWithDepartmentInfo,
    PasswordResetRequest,
    ResetPasswordPayload,
    OTPEmailPaylod,
)
from datetime import datetime, timezone
from services.notifications.password_reset_otp import send_email
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

        print("LOGIN PASSWORD:", repr(log_user.password))

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
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User account disabled"
            )

        if user.mfa_enabled:
            if not log_user.mfa_code:
                raise HTTPException(status_code=401, detail="MFA code required")
            if not user.verify_mfa_code(log_user.mfa_code):
                raise HTTPException(status_code=401, detail="Invalid MFA code")

        if user.must_change_password:
            raise HTTPException(status_code=403, detail="PASSWORD_RESET_REQUIRED")

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
        result = UserWithDepartmentInfo(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            created_at=user.created_at,
            updated_at=user.updated_at,
            departments=user_depts,
        )

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error logging in", "err_stack": str(e)},
        )


async def request_for_passsword_reset(db: Session, payload: PasswordResetRequest):
    import traceback

    try:
        user = db.scalar(select(User).where(User.email == payload.email))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Credentials.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User account disabled"
            )
        existing_otp = db.scalar(
            select(PasswordResetOtp).where(PasswordResetOtp.user_id == user.id)
        )
        if existing_otp:
            db.delete(existing_otp)
        new_otp = PasswordResetOtp(user_id=user.id)
        otp = new_otp.generate_otp()
        db.add(new_otp)
        db.commit()
        db.refresh(new_otp)
        email_payload = OTPEmailPaylod(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role,
            otp=otp,
            expires_in=new_otp.expires_at,
        )
        _email_res = await send_email(
            subject="IS Assessment Application - Password Reset", payload=email_payload
        )

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        print("ERR", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "msg": "Error in requesting for a password reset",
                "err_stack": str(e),
            },
        )


def ensure_utc(dt: datetime) -> datetime:
    """Ensure a datetime is timezone-aware (UTC)."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def reset_password(db: Session, payload: ResetPasswordPayload):
    try:
        user = db.scalar(select(User).where(User.email == payload.email))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Credentials.",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User account disabled"
            )

        # Get OTP record
        otp_record = db.scalar(
            select(PasswordResetOtp).where(PasswordResetOtp.user_id == user.id)
        )
        if not otp_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No password reset request found. Please request a new code.",
            )

        # Check if OTP is expired
        if ensure_utc(otp_record.expires_at) < datetime.now(timezone.utc):
            db.delete(otp_record)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset code has expired. Please request a new one.",
            )

        # Verify OTP
        if not otp_record.verify_otp(payload.otp):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset code",
            )

        try:
            # Update password
            print("RESET PASSWORD:", repr(payload.new_password))

            user.set_password(payload.new_password)
            user.must_change_password = False

            # Delete used OTP
            db.delete(otp_record)
            db.commit()

            return {"msg": "Password reset successfully"}

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to reset password: {str(e)}",
            )
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error in changing the password",
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
