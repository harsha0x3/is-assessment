# routes\comments_routes.py
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Path,
    UploadFile,
    File,
    Form,
)
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from typing import Annotated

from api.controllers import comments_controller as comment_ctrl
from db.connection import get_db_conn
from services.auth.deps import get_current_user
from schemas.auth_schemas import UserOut
from schemas import comment_schemas as c_schemas
from api.controllers.evidence_controller import (
    save_evidence_file_local,
    save_evidence_file_s3,
    add_evidence,
)
from schemas.evidence_schemas import CreateEvidenceSchema
import os
from services.auth.permissions import is_user_of_dept

ENV = os.getenv("ENV", "development")

router = APIRouter(prefix="/comments", tags=["comments"])


@router.post(
    "/application/{app_id}/department/{dept_id}",
    summary="Create Comment",
    status_code=status.HTTP_201_CREATED,
)
async def create_comment(
    content: Annotated[str, Form(...)],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
    app_id: Annotated[str, Path(...)],
    dept_id: Annotated[int, Path(...)],
    severity: Annotated[str | None, Form()] = None,
    evidence_files: Annotated[list[UploadFile] | None, File()] = None,
):
    try:
        # Authorization
        is_author_valid = is_user_of_dept(
            dept_id=dept_id, user_id=current_user.id, db=db
        )
        if not is_author_valid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to add comment.",
            )

        new_comment = c_schemas.CommentInput(
            author_id=current_user.id,
            content=content,
            application_id=app_id,
            department_id=dept_id,
        )

        # Create comment FIRST (sync DB operation)
        comment = comment_ctrl.create_comment(payload=new_comment, db=db)

        # Handle evidence AFTER comment exists
        if evidence_files:
            save_evidence = (
                save_evidence_file_s3
                if ENV == "production"
                else save_evidence_file_local
            )
            evidences = []
            for file in evidence_files:
                file_path = await save_evidence(file, app_name=app_id)

                evidence_payload = CreateEvidenceSchema(
                    uploader_id=current_user.id,
                    evidence_path=file_path,
                    severity=severity or "medium",
                    application_id=app_id,
                    comment_id=comment.id,
                )

                evidence = await add_evidence(payload=evidence_payload, db=db)
                evidences.append(evidence)

            new_evidences = [
                CreateEvidenceSchema(
                    uploader_id=current_user.id,
                    evidence_path=e_file,
                    severity=severity or "medium",
                    application_id=app_id,
                    comment_id=comment.id,
                )
                for e_file in evidences
            ]

            for new_evidence in new_evidences:
                await add_evidence(payload=new_evidence, db=db)

            db.refresh(comment)

        data = comment_ctrl.CommentWithEvidences(
            id=comment.id,
            content=comment.content,
            status=comment.status,
            author_id=comment.author_id,
            application_id=comment.application_id,
            department_id=comment.department_id,
            department=c_schemas.DepartmentOut.model_validate(comment.department),
            author=c_schemas.UserOut.model_validate(comment.author),
            created_at=comment.created_at,
            updated_at=comment.updated_at,
        )

        return {"msg": "Comment created successfully", "data": data}

    except HTTPException:
        raise
    except Exception as e:
        # LOG THIS
        print(e)
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
