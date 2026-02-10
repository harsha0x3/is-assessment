# /apiroutes/dept_questionnaire_routes.py
from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from typing import Annotated
from api.controllers import dept_questionnaire_controller as dq_ctrl
from db.connection import get_db_conn

from services.auth.deps import get_current_user, require_manager
from schemas.auth_schemas import UserOut
from schemas import dept_questionnaire_schemas as q_schemas


router = APIRouter(prefix="/dept-questionnaire", tags=["dept-questionnaire"])


@router.post("/department/{dept_id}/set")
def create_dept_question_set(
    dept_id: Annotated[int, Path(..., description="The ID of the department")],
    payload: Annotated[q_schemas.NewDeptQuestionSet, ""],
    db: Session = Depends(get_db_conn),
    current_user: UserOut = Depends(require_manager),
):
    return dq_ctrl.create_dept_question_set(dept_id=dept_id, db=db, name=payload.name)


@router.post("/department/{dept_id}/questions")
def create_dept_question(
    dept_id: Annotated[int, Path(..., description="The ID of the department")],
    payload: Annotated[q_schemas.NewDeptQuestion, ""],
    is_mandatory: bool = False,
    db: Session = Depends(get_db_conn),
    current_user: UserOut = Depends(require_manager),
):
    return dq_ctrl.create_dept_question(
        db, dept_id, payload.text, payload.sequence_number, is_mandatory
    )


@router.get("/application/{app_id}/department/{dept_id}")
def get_questionnaire(
    app_id: Annotated[str, Path(..., description="The ID of the application")],
    dept_id: Annotated[int, Path(..., description="The ID of the department")],
    db: Session = Depends(get_db_conn),
    current_user: UserOut = Depends(get_current_user),
):
    return dq_ctrl.get_dept_questionnaire_with_answers(db, app_id, dept_id)


@router.post("/answer/application/{app_id}/question/{dept_question_id}")
def answer_question(
    dept_question_id: Annotated[
        int, Path(..., description="The ID of the department question")
    ],
    app_id: Annotated[str, Path(..., description="The ID of the application")],
    payload: Annotated[q_schemas.AnswerSubmit, ""],
    db: Session = Depends(get_db_conn),
    current_user: UserOut = Depends(get_current_user),
):
    return dq_ctrl.answer_dept_question(
        db=db,
        dept_question_id=dept_question_id,
        answer_text=payload.answer_text,
        author_id=current_user.id,
        app_id=app_id,
    )
