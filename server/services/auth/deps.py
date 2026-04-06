from fastapi import Cookie, Depends, HTTPException, Request, status, Header, Response
from sqlalchemy.orm import Session
from typing import Literal

from db.connection import get_db_conn
from models import User, UserSession

from .jwt_handler import (
    decode_access_token,
    verify_refresh_token,
    create_tokens,
    set_jwt_cookies,
)
from .csrf_handler import generate_csrf_token
from datetime import datetime, timezone


def raise_401(detail: str):
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def raise_403(detail: str):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def validate_session(
    session: UserSession,
    token: str,
    token_type: Literal["access", "refresh"],
    db: Session,
    request: Request,
):

    if token_type == "access" and not session.verify_access_token(token):
        session.is_active = False
        db.commit()
        raise_401("Access token reuse detected.")

    elif token_type == "refresh" and not session.verify_refresh_token(token):
        session.is_active = False
        db.commit()
        raise_401("Refresh token reuse detected.")

    if session.user_agent != request.headers.get("user-agent"):
        session.is_active = False
        db.commit()
        raise_401("Token used on a different device.")


def refresh_tokens(
    request: Request,
    response: Response,
    db: Session,
    refresh_token: str | None = Cookie(default=None),
    session_id: str | None = Cookie(default=None),
):
    try:
        if not refresh_token or not session_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token or session missing. Login again.",
            )

        payload = verify_refresh_token(refresh_token)

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invlaid refresh token"
            )

        session = db.get(UserSession, payload.get("sid"))

        if not session or not session.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session.",
            )

        validate_session(
            session=session,
            token=refresh_token,
            token_type="refresh",
            db=db,
            request=request,
        )

        # ROTATE
        new_access, new_refresh = create_tokens(
            user_id=payload["sub"],
            role=payload["role"],
            sid=session_id,
            mfa_verified=True,
        )

        session.set_refresh_token(new_refresh)
        session.set_access_token(new_access)
        session.last_used_at = datetime.now(timezone.utc)
        session.csrf_token = generate_csrf_token()

        db.commit()
        db.refresh(session)

        set_jwt_cookies(
            response=response,
            access_token=new_access,
            refresh_token=new_refresh,
            csrf_token=session.csrf_token,
            session_id=session.id,
        )

    except HTTPException:
        raise


def get_current_user(
    request: Request,
    response: Response,
    access_token: str | None = Cookie(default=None),
    refresh_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db_conn),
    csrf_token: str | None = Cookie(default=None, alias="csrf_token"),
    csrf_header: str | None = Header(default=None, alias="X-CSRF-Token"),
    session_id: str | None = Cookie(default=None),
) -> User:
    try:
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access token not found",
            )
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access token not found",
            )

        payload = None

        # Try decoding access token first
        payload = decode_access_token(access_token)

        # If no valid access token, try refresh
        if not payload and refresh_token and session_id:
            refresh_tokens(
                response=response, db=db, request=request, refresh_token=refresh_token
            )
            access_token = request.cookies.get("access_token")
            if access_token:
                payload = decode_access_token(access_token)

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token.",
            )

        session = db.get(UserSession, payload.get("sid"))
        if (
            not session
            or not session.is_active
            or session.user_id != payload.get("sub")
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session."
            )

        assert access_token is not None

        validate_session(
            session=session,
            token=refresh_token,
            token_type="refresh",
            db=db,
            request=request,
        )
        validate_session(
            session=session,
            token=access_token,
            token_type="access",
            db=db,
            request=request,
        )

        # Fetch the user (works for both valid or refreshed tokens)
        user = db.get(User, payload.get("sub"))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive or non-existent user",
            )

        request.scope["headers"].append((b"x-user-id", str(user.id).encode()))

        if user.must_change_password:
            raise HTTPException(status_code=403, detail="PASSWORD_RESET_REQUIRED")

        # 🔒 CSRF check (for unsafe methods only)
        print(f"HEDER - {csrf_header} \n COOKIE - {csrf_token}")

        if request.method not in ("GET", "HEAD", "OPTIONS", "TRACE"):
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

        return user
    except HTTPException:
        raise
    except Exception as e:
        print("ERR IN CURRENT USRE", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error in getting current logged in user",
        )


def get_current_session(
    request: Request,
    response: Response,
    access_token: str | None = Cookie(default=None),
    refresh_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db_conn),
    csrf_token: str | None = Cookie(default=None, alias="csrf_token"),
    csrf_header: str | None = Header(default=None, alias="X-CSRF-Token"),
    session_id: str | None = Cookie(default=None),
):
    payload = None
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token not found",
        )
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token not found",
        )

    payload = decode_access_token(access_token)

    # If no valid access token, try refresh
    if not payload and refresh_token and session_id:
        refresh_tokens(
            response=response, db=db, refresh_token=refresh_token, request=request
        )
        access_token = request.cookies.get("access_token")
        if access_token:
            payload = decode_access_token(access_token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. cannot get current sesssion",
        )

    session = db.get(UserSession, payload.get("sid"))

    if not session or not session.is_active or session.user_id != payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session."
        )

    assert access_token is not None

    validate_session(
        session=session,
        token=refresh_token,
        token_type="refresh",
        db=db,
        request=request,
    )
    validate_session(
        session=session, token=access_token, token_type="access", db=db, request=request
    )

    return session


def require_moderator(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["super_admin", "admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied"
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied"
        )
    return current_user


def require_manager(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["super_admin", "admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied"
        )
    return current_user
