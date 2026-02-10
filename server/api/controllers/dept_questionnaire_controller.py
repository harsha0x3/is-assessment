# /api/controllers/dept_questionnaire_controller.py
from models import AppDeptAnswer, DeptQuestion, DeptQuestionSet
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from sqlalchemy import select, asc
from schemas import dept_questionnaire_schemas as q_schemas
from services.auth.permissions import is_user_of_dept


def create_dept_question_set(dept_id: int, db: Session, name: str):
    try:
        new_dept_q_set = DeptQuestionSet(department_id=dept_id, name=name)
        db.add(new_dept_q_set)
        db.commit()
        db.refresh(new_dept_q_set)
        return new_dept_q_set
    except ValueError as ve:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input: {str(ve)}",
        )
    except Exception as e:
        print("ERR", e)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating a new question set for department.",
        )


def create_dept_question(
    db: Session,
    dept_id: int,
    text: str,
    sequence_number: int | None,
    is_mandatory: bool,
):
    try:
        # Find the question set for this department
        question_set_id = db.scalar(
            select(DeptQuestionSet.id).where(DeptQuestionSet.department_id == dept_id)
        )

        if not question_set_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question set not found for department {dept_id}",
            )

        question = DeptQuestion(
            question_set_id=question_set_id,
            text=text,
            sequence_number=sequence_number,
            is_mandatory=is_mandatory,
        )
        db.add(question)
        db.commit()
        db.refresh(question)
        return question
    except HTTPException as he:
        db.rollback()
        raise he
    except ValueError as ve:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input: {str(ve)}",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating department question",
        )


def get_dept_questionnaire_with_answers(
    db: Session,
    app_id: str,
    dept_id: int,
):
    try:
        stmt = (
            select(DeptQuestion)
            .join(DeptQuestionSet)
            .where(DeptQuestionSet.department_id == dept_id)
            .options(
                joinedload(
                    DeptQuestion.answers.and_(AppDeptAnswer.application_id == app_id)
                ).joinedload(AppDeptAnswer.author)
            )
            .order_by(asc(DeptQuestion.sequence_number))
        )

        questions = db.scalars(stmt).unique().all()

        result = []
        for q in questions:
            answer = next(
                (a for a in q.answers if a.application_id == app_id),
                None,
            )
            result.append(
                q_schemas.DeptQuestionWithAnswerOut(
                    **q_schemas.DeptQuestionOut.model_validate(q).model_dump(),
                    answer=q_schemas.AppDeptAnswerOut.model_validate(answer)
                    if answer
                    else None,
                )
            )

        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(ve)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving department questionnaire with answers",
        )


def answer_dept_question(
    db: Session,
    app_id: str,
    dept_question_id: int,
    answer_text: str,
    author_id: str,
):
    try:
        question = db.get(DeptQuestion, dept_question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
            )

        dept_id = question.question_set.department_id
        if not is_user_of_dept(db=db, user_id=author_id, dept_id=dept_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized"
            )

        stmt = select(AppDeptAnswer).where(
            AppDeptAnswer.dept_question_id == dept_question_id,
            AppDeptAnswer.application_id == app_id,
        )

        answer = db.scalar(stmt)

        if answer:
            answer.answer_text = answer_text
            answer.author_id = author_id
        else:
            answer = AppDeptAnswer(
                dept_question_id=dept_question_id,
                department_id=dept_id,
                application_id=app_id,
                answer_text=answer_text,
                author_id=author_id,
            )
            db.add(answer)

        db.commit()
        db.refresh(answer)
        return q_schemas.AppDeptAnswerOut.model_validate(answer)
    except HTTPException as he:
        db.rollback()
        raise he
    except ValueError as ve:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(ve)}",
        )
    except Exception as e:
        print("ERR IN ANS", e)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error answering department question",
        )
