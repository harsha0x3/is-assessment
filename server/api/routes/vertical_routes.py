from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated

from db.connection import get_db_conn
from models import User
from services.auth.deps import get_current_user
from api.controllers import vertical_controller as ctrl
from schemas.vertical_schemas import VerticalCreateRequest, VerticalUpdateRequest

router = APIRouter(prefix="/verticals", tags=["verticals"])


def require_manager_or_admin(user: User):
    if user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
        )
    return user


@router.post("/")
def create_vertical(
    payload: Annotated[VerticalCreateRequest, "Create vertical payload"],
    db: Annotated[Session, Depends(get_db_conn)],
    user: Annotated[User, Depends(get_current_user)],
):
    require_manager_or_admin(user)
    return ctrl.create_vertical(payload, db)


@router.get("/")
def list_verticals(
    db: Annotated[Session, Depends(get_db_conn)],
    user: Annotated[User, Depends(get_current_user)],
):
    return ctrl.get_all_verticals(db, current_user=user)


@router.patch("/{vertical_id}")
def update_vertical(
    vertical_id: int,
    payload: Annotated[VerticalUpdateRequest, "Update vertical payload"],
    db: Annotated[Session, Depends(get_db_conn)],
    user: Annotated[User, Depends(get_current_user)],
):
    require_manager_or_admin(user)
    return ctrl.update_vertical(vertical_id, payload, db)


@router.delete("/{vertical_id}")
def delete_vertical(
    vertical_id: int,
    db: Annotated[Session, Depends(get_db_conn)],
    user: Annotated[User, Depends(get_current_user)],
):
    require_manager_or_admin(user)
    return ctrl.delete_vertical(vertical_id, db)
