from fastapi import HTTPException, Response, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from schemas.auth_schemas import LoginRequest
from models import User, PasswordResetOtp
from services.auth.jwt_handler import (
    create_tokens,
    set_jwt_cookies,
)
from schemas.auth_schemas import (
    DepartmentInAuth,
    UserWithDepartmentInfo,
    PasswordResetRequest,
    ResetPasswordPayload,
    OTPEmailPaylod,
    CreateSessionOut,
)
from urllib.parse import urlencode
from schemas.vertical_schemas import VerticalBase
from datetime import datetime, timezone, timedelta
from services.notifications.password_reset_otp import send_email
from services.auth.csrf_handler import generate_csrf_token
from dotenv import load_dotenv
import os
import uuid
from models import UserSession

from services.auth.microsoft_oauth import (
    exchange_code_for_token,
    verify_id_token,
)
from services.auth.deps import get_current_session

load_dotenv()

VALID_EMAIL_ORG = os.getenv("VALID_EMAIL_ORG")
FRONTEND_URI = os.getenv("FRONTEND_URI", "http://localhost:8057")

is_prod = os.getenv("PROD_ENV", "false").lower() == "true"

load_dotenv()

# api/controllers/auth_controller.py


def get_user_info(user: User):
    try:
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

        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting user info",
        )


def create_user_session(
    user: User, db: Session, request: Request, mfa_verified: bool = True
):
    """
    Handles session creation, token generation, and cookie setting.
    Returns the access and refresh tokens along with the session.
    """
    sid = uuid.uuid4()
    csrf_token = generate_csrf_token()

    access, refresh = create_tokens(
        user_id=user.id,
        role=user.role,
        mfa_verified=mfa_verified,
        sid=str(sid),
    )
    try:
        session = UserSession(
            id=sid,
            user_id=user.id,
            csrf_token=csrf_token,
            user_agent=request.headers.get("user-agent"),
            ip_address=request.client.host if request.client else "0.0.0.0",
            expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        )
        session.set_refresh_token(refresh)
        session.set_access_token(access)
        db.add(session)
        db.commit()
        db.refresh(session)
        return CreateSessionOut(
            session=session,
            access_token=access,
            refresh_token=refresh,
            csrf_token=csrf_token,
        )

    except Exception as e:
        print("USer creation err", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Eror creating user session",
        )


def login_user(
    log_user: LoginRequest, db: Session, response: Response, request: Request
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
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials wrong pass",
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

        mfa_verified = user.mfa_enabled

        user_session = create_user_session(
            user=user, db=db, request=request, mfa_verified=mfa_verified
        )

        _access_exp = set_jwt_cookies(
            response=response,
            access_token=user_session.access_token,
            refresh_token=user_session.refresh_token,
            csrf_token=user_session.csrf_token,
            session_id=user_session.session.id,
        )

        user_info = get_user_info(user=user)

        return user_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error logging in", "err_stack": str(e)},
        )


def microsoft_callback_login(
    code: str | None,
    response: Response,
    request: Request,
    db: Session,
    error: str | None = None,
):
    try:
        if not code and error:
            print("ERROR IN MICROSOFT CALLBACK: ", error)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Microsoft OAuth error: {error}",
            )

        elif not code:
            print("ERROR IN MICROSOFT CALLBACK: ", error)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code missing from Microsoft callback.",
            )

        token_data = exchange_code_for_token(code=code)
        id_token = token_data.get("id_token")
        if not id_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Microsoft ID token",
            )

        # 2️⃣ Verify token and extract user info
        payload = verify_id_token(id_token=id_token)
        print("MICROSOFT OAUTH PAYLOAD:", payload)
        for k, v in payload.items():
            print(f"{k}")

        email = payload.get("preferred_username") or payload.get("email")
        microsoft_id = payload.get("oid")

        if not email or not microsoft_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Microsoft payload",
            )

        if not email.endswith(VALID_EMAIL_ORG):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized email domain",
            )

        user = db.scalar(select(User).where(User.email == email))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User not registered or disabled",
            )

        if not user.microsoft_id:
            user.microsoft_id = microsoft_id
            db.commit()

        user_session = create_user_session(
            user=user, db=db, request=request, mfa_verified=True
        )

        redirect = RedirectResponse(url=f"{FRONTEND_URI}")

        _access_exp = set_jwt_cookies(
            response=redirect,
            access_token=user_session.access_token,
            refresh_token=user_session.refresh_token,
            csrf_token=user_session.csrf_token,
            session_id=user_session.session.id,
        )

        return redirect
    except HTTPException as he:
        return RedirectResponse(
            url=f"{FRONTEND_URI}/login?{urlencode({'error': f'{he.detail}'})}"
        )

    except Exception as e:
        print("Error in Microsoft login:", e)
        return RedirectResponse(
            url=f"{FRONTEND_URI}/login?{urlencode({'error': 'An error occurred during Microsoft login'})}"
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


def clear_jwt_cookies(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="lax" if is_prod else "none",
        path="/",
    )
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=True,
        samesite="lax" if is_prod else "none",
        path="/",
    )
    response.delete_cookie(
        key="session_id",
        httponly=True,
        secure=True,
        samesite="lax" if is_prod else "none",
        path="/",
    )


def logout(
    request: Request,
    response: Response,
    db: Session,
):
    try:
        csrf_token = request.cookies.get("csrf_token")
        csrf_header = request.headers.get("X-CSRF-Token")

        access_token = request.cookies.get("access_token")
        refresh_token = request.cookies.get("refresh_token")
        session_id = request.cookies.get("session_id")

        session = get_current_session(
            request=request,
            response=response,
            db=db,
            access_token=access_token,
            refresh_token=refresh_token,
            session_id=session_id,
        )

        if not csrf_header:
            print(" NOPE NOT FOUND INSIDE NOT FOUND CSRF HEADER")

        if csrf_token != csrf_header:
            print(f"HEDER - {csrf_header} \n COOKIE - {csrf_token} \n INVLAID CSRFFFFF")

        if (
            not csrf_token
            or not csrf_header
            or csrf_token != csrf_header
            or session.csrf_token != csrf_token
        ):
            print("No CSRF FOUND OR INVALID")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token missing or invalid",
            )

        db.delete(session)

        db.commit()
        return {"msg": "Logged out"}

    except HTTPException:
        raise
