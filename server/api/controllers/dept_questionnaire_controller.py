from models import Question, AppDeptQuestions, AppDeptAnswers
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from sqlalchemy import select
from schemas import dept_questionnaire_schemas as q_schemas


def create_new_question(db: Session, text: str) -> Question:
    """Create a new question."""
    new_question = Question(text=text)
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return new_question


def link_question_to_department(
    db: Session, app_dept_id: str, link_data: list[q_schemas.NewAppDeptLink]
):
    """Link a question to an application department."""

    links = [
        AppDeptQuestions(
            app_dept_id=app_dept_id,
            question_id=l_data.question_id,
            sequence_number=l_data.sequence_number,
        )
        for l_data in link_data
    ]

    db.add_all(links)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to link question to department: " + str(e),
        )
    return links


def get_dept_questionnaire_with_answers()