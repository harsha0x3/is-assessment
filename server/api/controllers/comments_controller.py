# controllers\comments_controller.py
from fastapi import HTTPException, status
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import Session, selectinload
from models import Application, Comment, ApplicationDepartments

from schemas import comment_schemas as c_schemas
from schemas.evidence_schemas import EvidenceOut
from pydantic import BaseModel
import os

ENV = os.getenv("ENV", "development")


class CommentWithEvidences(c_schemas.CommentOut, BaseModel):
    evidences: list[EvidenceOut] | None = None


def get_latest_app_dept_comment(app_id: str, dept_id: int, db: Session):
    latest_comment = db.scalar(
        select(Comment)
        .where(and_(Comment.application_id == app_id, Comment.department_id == dept_id))
        .order_by(desc(Comment.created_at))
        .limit(1)
    )
    return (
        c_schemas.CommentOut.model_validate(latest_comment) if latest_comment else None
    )


def create_comment(payload: c_schemas.CommentInput, db: Session):
    try:
        stmt = (
            select(Application.id)
            .join(
                ApplicationDepartments,
                ApplicationDepartments.application_id == Application.id,
            )
            .where(
                Application.id == payload.application_id,
                ApplicationDepartments.department_id == payload.department_id,
            )
        )

        exists = db.scalar(stmt)

        if not exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department does not belong to this application",
            )

        new_comment = Comment(
            content=payload.content,
            author_id=payload.author_id,
            application_id=payload.application_id,
            department_id=payload.department_id,
        )
        db.add(new_comment)
        db.commit()
        db.refresh(new_comment)
        return new_comment

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating comment: {str(e)}",
        )


def update_comment(
    comment_id: str, payload: c_schemas.NewCommentRequest, db: Session, user_id: str
):
    try:
        comment = db.get(Comment, comment_id)
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found.",
            )

        if comment.author_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update this comment.",
            )
        comment.content = payload.content
        db.commit()
        db.refresh(comment)
        return c_schemas.CommentOut.model_validate(comment)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating comment: {str(e)}",
        )


def get_comments_for_application(app_id: str, db: Session):
    try:
        comments = db.scalars(
            select(Comment)
            .options(selectinload(Comment.author))
            .options(selectinload(Comment.department))
            .where(Comment.application_id == app_id)
            .order_by(Comment.created_at.desc())
        ).all()
        result = [
            CommentWithEvidences(
                id=c.id,
                content=c.content,
                author_id=c.author_id,
                application_id=c.application_id,
                status=c.status,
                department_id=c.department_id,
                department=c_schemas.DepartmentOut.model_validate(c.department),
                author=c_schemas.UserOut.model_validate(c.author),
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c in comments
        ]
        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching comments: {str(e)}",
        )


def get_comments_for_department(app_id: str, dept_id: int, db: Session):
    try:
        comments = db.scalars(
            select(Comment)
            .options(selectinload(Comment.author))
            .where(
                and_(
                    Comment.application_id == app_id,
                    Comment.department_id == dept_id,
                )
            )
            .order_by(Comment.created_at.desc())
        ).all()
        result = [
            CommentWithEvidences(
                id=c.id,
                content=c.content,
                author_id=c.author_id,
                application_id=c.application_id,
                department_id=c.department_id,
                department=c_schemas.DepartmentOut.model_validate(c.department),
                author=c_schemas.UserOut.model_validate(c.author),
                status=c.status,
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c in comments
        ]
        return result

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error fetching comments", "err_stack": str(e)},
        )
