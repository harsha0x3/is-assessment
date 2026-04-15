from fastapi import APIRouter, Depends, Path, HTTPException, status
from typing import Annotated
from sqlalchemy.orm import Session
from models import User
from api.controllers import exec_summary_controller as exec_ctrl
from schemas import exec_summary_schemas as exec_schemas
from db.connection import get_db_conn
from services.auth.deps import require_manager, get_current_user, require_moderator

router = APIRouter(prefix="/exec_summary", tags=["ExecutiveSummary"])


@router.post("/application/{app_id}")
def add_app_executive_summary(
    payload: Annotated[exec_schemas.NewExecSummaryRequest, ""],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[User, Depends(require_moderator)],
    app_id: Annotated[str, Path(...)],
):
    try:
        new_exec_payload = exec_schemas.ExecSummaryInput(
            content=payload.content,
            author_id=current_user.id,
            application_id=app_id,
            scope="application",
        )
        new_exec = exec_ctrl.create_app_exec_summary(db=db, payload=new_exec_payload)
        return new_exec

    except Exception as e:
        print("Err in creating new exec summary in route", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating new exec summary",
        )


@router.post("/application/{app_id}/department/{dept_id}")
def add_dept_executive_summary(
    payload: Annotated[exec_schemas.NewExecSummaryRequest, ""],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[User, Depends(require_manager)],
    app_id: Annotated[str, Path(...)],
    dept_id: Annotated[int, Path(...)],
):
    try:
        new_exec_payload = exec_schemas.ExecSummaryInput(
            content=payload.content,
            author_id=current_user.id,
            application_id=app_id,
            scope="department",
            department_id=dept_id,
        )
        new_exec = exec_ctrl.create_app_exec_summary(db=db, payload=new_exec_payload)
        return new_exec

    except Exception as e:
        print("Err in creating new exec summary in route", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating new exec summary",
        )


@router.get("/application/{app_id}")
def get_app_executive_summaries(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[User, Depends(get_current_user)],
    app_id: Annotated[str, Path(...)],
):
    try:
        summaries = exec_ctrl.get_application_exec_summary(app_id=app_id, db=db)
        return summaries

    except Exception as e:
        print("Err in getting exec summaries in route", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching executive summaries",
        )


@router.get("/application/{app_id}/department/{dept_id}")
def get_dept_executive_summaries(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[User, Depends(get_current_user)],
    app_id: Annotated[str, Path(...)],
    dept_id: Annotated[int, Path(...)],
):
    try:
        summaries = exec_ctrl.get_dept_exec_summary(
            app_id=app_id, db=db, dept_id=dept_id
        )
        return summaries

    except Exception as e:
        print("Err in getting exec summaries in route", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching executive summaries",
        )


@router.get("/application/{app_id}/latest")
def get_latest_app_executive_summary(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[User, Depends(get_current_user)],
    app_id: Annotated[str, Path(...)],
):
    try:
        summary = exec_ctrl.get_latest_exec_summary_by_app_name(app_id=app_id, db=db)
        return summary

    except Exception as e:
        print("Err in getting latest exec summary in route", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching latest executive summary",
        )


@router.put("/{summary_id}")
def update_executive_summary(
    payload: Annotated[exec_schemas.NewExecSummaryRequest, ""],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[User, Depends(require_moderator)],
    summary_id: Annotated[str, Path(...)],
):
    try:
        updated_summary = exec_ctrl.update_exec_summary(
            db=db,
            current_user=current_user,
            payload=exec_schemas.ExecSummaryUpdate(
                content=payload.content,
                author_id=current_user.id,
                id=summary_id,
            ),
        )
        return updated_summary

    except HTTPException:
        raise
    except Exception as e:
        print("Err in updating exec summary in route", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating executive summary",
        )
