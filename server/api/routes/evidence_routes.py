from fastapi import APIRouter, Depends, status, Path, UploadFile, File, Form
from typing import Annotated
from fastapi import HTTPException
from sqlalchemy.orm import Session
from schemas.auth_schemas import UserOut
from services.auth.deps import get_current_user, require_manager
from services.auth.permissions import is_user_of_dept
from api.controllers import evidence_controller as e_ctrl
from db.connection import get_db_conn
from models import Application, DepartmentUsers
from schemas import evidence_schemas as e_schemas
import os

router = APIRouter(prefix="/evidences", tags=["departments"])

ENV = os.getenv("ENV")


@router.post("/application/{app_id}/department/{dept_id}")
async def add_department_evidences(
    app_id: Annotated[str, Path(...)],
    dept_id: Annotated[int, Path(...)],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_manager)],
    severity: Annotated[str | None, Form()] = None,
    evidence_files: Annotated[list[UploadFile] | None, File()] = None,
):
    try:
        if not evidence_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No files found to upload",
            )
        app = db.get(Application, app_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_400,
                detail="Application you are uploading evidence to is not found",
            )
        if dept_id and not is_user_of_dept(
            dept_id=dept_id, user_id=current_user.id, db=db
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Don't belong to this department",
            )
        save_evidence = (
            e_ctrl.save_evidence_file_s3
            if ENV == "production"
            else e_ctrl.save_evidence_file_local
        )
        failed = []
        success = []

        for file in evidence_files:
            try:
                file_path = await save_evidence(file=file, app_name=app.name)
                evidence_payload = e_schemas.CreateEvidenceSchema(
                    uploader_id=current_user.id,
                    evidence_path=file_path,
                    severity=severity or "medium",
                    application_id=app_id,
                    department_id=dept_id,
                )
                await e_ctrl.add_evidence(payload=evidence_payload, db=db)
                success.append(file.filename)
            except Exception as e:
                failed.append(f"Failed to add file. Error: {str(e)}")
        return {
            "msg": "Evidences uploaded",
            "data": {"success": success, "failed": failed},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error adding evidences", "err_stack": str(e)},
        )


@router.post("/application/{app_id}/department/{dept_id}")
async def add_application_evidences(
    app_id: Annotated[str, Path(...)],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_manager)],
    severity: Annotated[str | None, Form()] = None,
    evidence_files: Annotated[list[UploadFile] | None, File()] = None,
):
    try:
        if not evidence_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No files found to upload",
            )
        app = db.get(Application, app_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_400,
                detail="Application you are uploading evidence to is not found",
            )
        if current_user.role not in ["admin", "manager"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied",
            )
        save_evidence = (
            e_ctrl.save_evidence_file_s3
            if ENV == "production"
            else e_ctrl.save_evidence_file_local
        )
        failed = []
        success = []

        for file in evidence_files:
            try:
                file_path = await save_evidence(file=file, app_name=app.name)
                evidence_payload = e_schemas.CreateEvidenceSchema(
                    uploader_id=current_user.id,
                    evidence_path=file_path,
                    severity=severity or "medium",
                    application_id=app_id,
                    department_id=None,
                )
                await e_ctrl.add_evidence(payload=evidence_payload, db=db)
                success.append(file.filename)
            except Exception as e:
                failed.append(f"Failed to add file. Error: {str(e)}")
        return {
            "msg": "Evidences uploaded",
            "data": {"success": success, "failed": failed},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error adding evidences", "err_stack": str(e)},
        )


@router.get("/application/{app_id}/department/{dept_id}")
async def get_department_evidences(
    app_id: Annotated[str, Path(...)],
    dept_id: Annotated[int, Path(...)],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    try:
        result = e_ctrl.get_department_evidences(app_id=app_id, db=db, dept_id=dept_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error getting application evidences", "err_stack": str(e)},
        )


@router.get("/application/{app_id}")
async def get_application_evidences(
    app_id: Annotated[str, Path(...)],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    try:
        result = e_ctrl.get_application_evidences(app_id=app_id, db=db)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error getting application evidences", "err_stack": str(e)},
        )
