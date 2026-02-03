from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Annotated
from api.controllers import dept_questionnaire_controller as dq_ctrl
from db.connection import get_db_conn
from models import ApplicationDepartments
from services.auth.deps import get_current_user, require_manager
from schemas.auth_schemas import UserOut
from schemas import dept_questionnaire_schemas as q_schemas


router = APIRouter(prefix="/dept-questionnaire", tags=["dept-questionnaire"])


@router.post("")
def create_question(
    text: Annotated[str, "The text of the question to create"],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_manager)],
):
    """Create a new question."""
    return dq_ctrl.create_new_question(db, text)


@router.post("/link/application/{app_id}/department/{dept_id}")
def link_question_to_department(
    app_id: Annotated[str, Path(..., description="The ID of the application")],
    dept_id: Annotated[int, Path(..., description="The ID of the department")],
    link_data: Annotated[list[dq_ctrl.q_schemas.NewAppDeptLink], ""],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_manager)],
):
    """Link questions to an application department."""
    try:
        app_dept_id = db.scalar(
            select(ApplicationDepartments.id).where(
                ApplicationDepartments.application_id == app_id,
                ApplicationDepartments.department_id == dept_id,
            )
        )
        if not app_dept_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application Department not found.",
            )
        return dq_ctrl.link_question_to_department(
            db, app_id=app_id, dept_id=dept_id, link_data=link_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to link question to department: " + str(e),
        )


@router.get(
    "/application/{app_id}/department/{dept_id}",
)
def get_dept_questionnaire_with_answers(
    app_id: Annotated[str, Path(..., description="The ID of the application")],
    dept_id: Annotated[int, Path(..., description="The ID of the department")],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    """Retrieve the questionnaire for a specific application department, including questions and answers."""

    return dq_ctrl.get_dept_questionnaire_with_answers(
        db, app_id=app_id, dept_id=dept_id
    )


@router.post("/answer/{app_dept_question_id}")
def submit_answer(
    app_dept_question_id: Annotated[
        int, Path(..., description="The ID of the application department question")
    ],
    answer: Annotated[q_schemas.AnswerSubmit, "The text of the answer to submit"],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    """Submit an answer to a specific application department question."""
    # Implementation for submitting an answer goes here
    return dq_ctrl.answer_a_question(
        db=db,
        app_dept_question_id=app_dept_question_id,
        answer_text=answer.answer_text,
        author_id=current_user.id,
    )
