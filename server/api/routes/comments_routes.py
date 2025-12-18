# routes\comments_routes.py
from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from typing import Annotated

from api.controllers import comments_controller as comment_ctrl
from db.connection import get_db_conn
from services.auth.deps import get_current_user
from schemas.auth_schemas import UserOut
from schemas import comment_schemas as c_schemas
from models import DepartmentUsers

router = APIRouter(prefix="/comments", tags=["comments"])


@router.post(
    "/application/{app_id}/department/{dept_id}",
    summary="Create Comment",
    status_code=status.HTTP_201_CREATED,
)
async def create_comment(
    payload: Annotated[c_schemas.NewCommentRequest, "Comment payload"],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    app_id: Annotated[str, Path(..., description="The ID of the application")],
    dept_id: Annotated[int, Path(..., description="The ID of the department")],
):
    # Override author_id from token (avoid spoofing)
    try:
        is_author_valid = db.scalar(
            select(DepartmentUsers).where(
                and_(
                    DepartmentUsers.user_id == current_user.id,
                    DepartmentUsers.department_id == dept_id,
                )
            )
        )
        # if not is_author_valid:
        #     raise HTTPException(
        #         status_code=status.HTTP_403_FORBIDDEN,
        #         detail="Access Denied to add comment.",
        #     )
        new_comment = c_schemas.CommentInput(
            author_id=current_user.id,
            content=payload.content,
            application_id=app_id,
            department_id=dept_id,
        )

        data = comment_ctrl.create_comment(payload=new_comment, db=db)
        return {"msg": "", "data": data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error in adding the comment. Try again",
        )


@router.patch(
    "/{comment_id}",
    summary="Update Comment",
    status_code=status.HTTP_200_OK,
)
async def update_comment(
    comment_id: Annotated[str, Path(..., description="The ID of the comment")],
    payload: Annotated[c_schemas.NewCommentRequest, "Comment payload"],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    data = comment_ctrl.update_comment(
        comment_id=comment_id,
        payload=payload,
        db=db,
        user_id=current_user.id,
    )
    return {"msg": "", "data": data}


@router.get(
    "/application/{app_id}",
    summary="Get Comments for an Application",
    status_code=status.HTTP_200_OK,
)
async def get_comments_for_application(
    app_id: Annotated[str, Path(..., description="Application ID")],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    data = comment_ctrl.get_comments_for_application(app_id=app_id, db=db)
    return {"msg": "", "data": data}


@router.get(
    "/application/{app_id}/department/{dept_id}",
    summary="Get Comments for a Department in an Application",
    status_code=status.HTTP_200_OK,
)
async def get_comments_for_department(
    app_id: Annotated[str, Path(..., description="Application ID")],
    dept_id: Annotated[int, Path(..., description="Department ID")],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    data = comment_ctrl.get_comments_for_department(
        app_id=app_id,
        dept_id=dept_id,
        db=db,
    )
    return {"msg": "", "data": data}
