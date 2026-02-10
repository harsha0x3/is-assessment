from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session
from typing import Annotated
from api.controllers import app_questions_controller as aq_ctrl
from db.connection import get_db_conn
from services.auth.deps import get_current_user, require_manager
from schemas.auth_schemas import UserOut
from schemas import app_questions_schemas as aq_schemas


router = APIRouter(prefix="/app-questions", tags=["app-questions"])


@router.get("/set/{question_set_id}")
def get_question_set(
    question_set_id: Annotated[
        int, Path(..., description="The ID of the question set")
    ],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    """Retrieve a question set with all its questions."""
    try:
        return aq_ctrl.get_question_set(db, question_set_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching question set",
        )


@router.get("/application/{application_id}")
def get_questions_with_answers(
    application_id: Annotated[str, Path(..., description="The ID of the application")],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
) -> list[aq_schemas.AppQuestionWithAnswer]:
    """Retrieve all questions for an application with their answers."""
    try:
        return aq_ctrl.get_questions_with_answers(db, application_id)
    except Exception as e:
        print(e)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching questions and answers",
        )


@router.post("/answer/application/{application_id}")
def answer_app_question(
    application_id: Annotated[str, Path(..., description="The ID of the application")],
    answer_data: Annotated[aq_schemas.AppAnswerInput, "The answer data"],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(get_current_user)],
):
    """Submit an answer to an application question."""
    try:
        return aq_ctrl.answer_app_question(
            db=db,
            application_id=application_id,
            question_id=answer_data.app_question_id,
            answer_text=answer_data.answer_text,
            author_id=current_user.id,
        )
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error saving answer",
        )


@router.post("/set")
def create_question_set(
    name: Annotated[str, "The name of the question set"],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_manager)],
):
    """Create a new application question set."""
    try:
        return aq_ctrl.create_app_question_set(db, name)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating question set",
        )


@router.post("/set/{question_set_id}/question")
def add_question_to_set(
    question_set_id: Annotated[
        int, Path(..., description="The ID of the question set")
    ],
    question_data: Annotated[aq_schemas.AppQuestionCreate, "The question data"],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_manager)],
):
    """Add a single question to a question set."""
    try:
        return aq_ctrl.add_question_to_set(
            db=db,
            question_set_id=question_set_id,
            text=question_data.text,
            is_medium=question_data.is_medium,
            is_high=question_data.is_high,
            sequence_number=question_data.sequence_number,
            is_default=question_data.is_default,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding question to set",
        )


@router.post("/set/{question_set_id}/questions")
def add_questions_to_set(
    question_set_id: Annotated[
        int, Path(..., description="The ID of the question set")
    ],
    questions: Annotated[
        list[aq_schemas.AppQuestionCreate], "List of questions to add"
    ],
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[UserOut, Depends(require_manager)],
):
    """Add multiple questions to a question set."""
    try:
        return aq_ctrl.add_questions_to_set(db, question_set_id, questions)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding questions to set",
        )
