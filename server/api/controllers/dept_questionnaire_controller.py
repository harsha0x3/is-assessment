from models import Question, AppDeptQuestions, AppDeptAnswers
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from sqlalchemy import select, asc, func
from schemas import dept_questionnaire_schemas as q_schemas
from services.auth.permissions import is_user_of_dept


def create_new_question(db: Session, text: str) -> Question:
    """Create a new question."""
    new_question = Question(text=text)
    db.add(new_question)
    db.commit()
    db.refresh(new_question)
    return new_question


def link_question_to_department(
    db: Session, app_id: str, dept_id: int, link_data: list[q_schemas.NewAppDeptLink]
):
    """Link a question to an application department."""

    links = [
        AppDeptQuestions(
            application_id=app_id,
            department_id=dept_id,
            question_id=l_data.question_id,
            sequence_number=l_data.sequence_number,
            is_default=l_data.is_default,
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
    result = [q_schemas.AppDeptQuestionOut.model_validate(link) for link in links]
    return result


def get_dept_questionnaire_with_answers(db: Session, app_id: str, dept_id: int):
    """Retrieve the questionnaire for a specific application department, including questions and answers."""
    stmt = (
        select(AppDeptQuestions)
        .where(
            AppDeptQuestions.application_id == app_id,
            AppDeptQuestions.department_id == dept_id,
        )
        .options(
            joinedload(AppDeptQuestions.question),
            joinedload(AppDeptQuestions.answer),
        )
        .order_by(asc(AppDeptQuestions.sequence_number))
    )
    results = db.scalars(stmt).all()
    data = [q_schemas.AppDeptQuestionWithAnswer.model_validate(r) for r in results]

    return data


def get_default_dept_questionnaire(db: Session, dept_id: int):
    stmt = (
        select(func.min(AppDeptQuestions.id).label("id"))
        .where(
            AppDeptQuestions.department_id == dept_id,
            AppDeptQuestions.is_default.is_(True),
        )
        .group_by(AppDeptQuestions.question_id)
    )

    ids = db.scalars(stmt).all()

    return db.scalars(
        select(AppDeptQuestions).where(AppDeptQuestions.id.in_(ids))
    ).all()


def answer_a_question(
    db: Session, app_dept_question_id: int, answer_text: str, author_id: str
):
    try:
        """Answer a specific question in the department questionnaire."""
        stmt = select(AppDeptQuestions).where(
            AppDeptQuestions.id == app_dept_question_id
        )
        app_dept_question = db.scalar(stmt)

        if not app_dept_question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found for the given department question ID.",
            )

        if not is_user_of_dept(
            db=db, user_id=author_id, dept_id=app_dept_question.department_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User does not have permission to answer this question.",
            )

        if app_dept_question.answer:
            # Update existing answer
            app_dept_question.answer.answer_text = answer_text
            app_dept_question.answer.author_id = author_id
            db.commit()
            db.refresh(app_dept_question)
        else:
            # Create new answer
            new_answer = AppDeptAnswers(
                app_dept_question_id=app_dept_question_id,
                answer_text=answer_text,
                author_id=author_id,
            )
            db.add(new_answer)
            db.commit()
            db.refresh(new_answer)

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to save answer: " + str(e),
        )

    return q_schemas.AnswerOut.model_validate(app_dept_question.answer)
