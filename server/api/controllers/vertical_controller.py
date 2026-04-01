from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select
from fastapi import HTTPException
from models import Vertical
from schemas.vertical_schemas import (
    VerticalCreateRequest,
    VerticalUpdateRequest,
    VerticalsWithUsers,
)
from models import User  # avoid circular import, only import here where needed

from schemas.auth_schemas import UserOut  # now safe to import

# rebuild forward references at runtime
VerticalsWithUsers.model_rebuild()


def create_vertical(payload: VerticalCreateRequest, db: Session):
    try:
        existing = db.scalar(select(Vertical).where(Vertical.name == payload.name))
        if existing:
            raise HTTPException(400, "Vertical already exists")

        v = Vertical(name=payload.name, description=payload.description)
        db.add(v)
        db.commit()
        db.refresh(v)
        return VerticalsWithUsers.model_validate(v)

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(e)
        raise HTTPException(
            status_code=500, detail=f"Error creating vertical: {str(e)}"
        )


def get_all_verticals(db: Session, current_user: User):
    try:
        stmt = (
            select(Vertical)
            .where(Vertical.is_active)
            .options(selectinload(Vertical.owners))
        )
        if current_user.role not in ["admin", "manager", "moderator"]:
            stmt = stmt.where(Vertical.owners.any(User.id == current_user.id))

        verticals = db.scalars(stmt).all()
        return [VerticalsWithUsers.model_validate(v) for v in verticals]

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching verticals: {str(e)}"
        )


def update_vertical(vertical_id: int, payload: VerticalUpdateRequest, db: Session):
    try:
        v = db.get(Vertical, vertical_id)
        if not v:
            raise HTTPException(404, "Vertical not found")

        v.name = payload.name or v.name
        v.description = payload.description or v.description

        db.commit()
        db.refresh(v)
        return VerticalsWithUsers.model_validate(v)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating vertical: {str(e)}"
        )


def delete_vertical(vertical_id: int, db: Session):
    try:
        v = db.get(Vertical, vertical_id)
        if not v:
            raise HTTPException(404, "Vertical not found")

        v.is_active = False
        db.commit()
        return {"msg": "Deleted"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error deleting vertical: {str(e)}"
        )
