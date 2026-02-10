from models import AppQuestionSet, ApplicationAnswer, ApplicationQuestion, Application
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from fastapi import HTTPException, status
from schemas import app_questions_schemas as aq_schemas


def get_question_set(db: Session, question_set_id: int):
    try:
        data = db.scalars(
            select(AppQuestionSet)
            .where(AppQuestionSet.id == question_set_id)
            .options(selectinload(AppQuestionSet.questions))
        ).all()
        result = [
            aq_schemas.AppQuestionSetOut(
                id=qs.id,
                name=qs.name,
                description=None,
                questions=[
                    aq_schemas.AppQuestion(
                        id=q.id,
                        question_set_id=q.question_set_id,
                        sequence_number=q.sequence_number,
                        text=q.text,
                        is_high=q.is_high,
                        is_medium=q.is_medium,
                    )
                    for q in qs.questions
                ],
            )
            for qs in data
        ]
        return result
    except Exception as e:
        print("Error in get questsion set", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching question set",
        )


def get_questions_with_answers(
    db: Session,
    application_id: str,
) -> list[aq_schemas.AppQuestionWithAnswer]:

    try:
        application = db.get(Application, application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Application not found"
            )

        stmt = (
            select(Application)
            .where(Application.id == application_id)
            .options(
                selectinload(Application.question_set)
                .selectinload(AppQuestionSet.questions)
                .selectinload(ApplicationQuestion.answers)
                .selectinload(ApplicationAnswer.author)
            )
        )

        application = db.execute(stmt).scalar_one_or_none()

        if not application or not application.question_set:
            return []

        result: list[aq_schemas.AppQuestionWithAnswer] = []

        for question in application.question_set.questions:
            # Find the answer for THIS application
            answer = next(
                (a for a in question.answers if a.application_id == application.id),
                None,
            )

            result.append(
                aq_schemas.AppQuestionWithAnswer(
                    id=question.id,
                    question_set_id=question.question_set_id,
                    sequence_number=question.sequence_number,
                    text=question.text,
                    is_high=question.is_high,
                    is_medium=question.is_medium,
                    answer=(
                        aq_schemas.AppAnswerOut.model_validate(answer)
                        if answer
                        else None
                    ),
                )
            )

        return result

    except Exception as e:
        print(e)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching questions and answers",
        )


def get_app_criticality(app_id: str, db: Session):
    """
    Check if the application is marked as crown jewel
    """
    try:
        responses = get_questions_with_answers(db=db, application_id=app_id)

        is_high = all(
            res.answer is not None
            and res.answer.answer_text is not None
            and res.answer.answer_text.lower() == "yes"
            for res in responses
            if res.is_high
        )

        if is_high:
            return 3
        is_medium = all(
            [
                res.answer is not None
                and res.answer.answer_text is not None
                and res.answer.answer_text.lower() == "yes"
                for res in responses
                if res.is_medium
            ]
        )
        if is_medium:
            return 2
        return 1

    except HTTPException:
        raise


def answer_app_question(
    db: Session, application_id: str, question_id: int, answer_text: str, author_id: str
):
    try:
        # Check if the application and question exist
        application = db.get(Application, application_id)
        question = db.get(ApplicationQuestion, question_id)

        if not application or not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application or Question not found",
            )

        # Check if an answer already exists for this application and question
        existing_answer = db.scalars(
            select(ApplicationAnswer).where(
                ApplicationAnswer.application_id == application_id,
                ApplicationAnswer.app_question_id == question_id,
            )
        ).first()

        if existing_answer:
            # Update the existing answer
            existing_answer.answer_text = answer_text
            existing_answer.author_id = author_id
            db.add(existing_answer)
            criticlity = get_app_criticality(app_id=application_id, db=db)
            application.app_priority = criticlity
            db.commit()
            db.refresh(existing_answer)

            return aq_schemas.AppAnswerOut.model_validate(existing_answer)
        else:
            # Create a new answer
            new_answer = ApplicationAnswer(
                application_id=application_id,
                app_question_id=question_id,
                answer_text=answer_text,
                author_id=author_id,
            )
            db.add(new_answer)
            criticlity = get_app_criticality(app_id=application_id, db=db)
            application.app_priority = criticlity
            db.commit()
            db.refresh(new_answer)
            return aq_schemas.AppAnswerOut.model_validate(new_answer)

    except HTTPException:
        raise
    except Exception as e:
        print("Error in answering app question", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error saving answer",
        )


def create_app_question_set(
    db: Session,
    name: str,
) -> AppQuestionSet:
    """
    Create a new application question set
    """

    question_set = AppQuestionSet(name=name)

    db.add(question_set)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise

    db.refresh(question_set)
    return question_set


def add_question_to_set(
    db: Session,
    question_set_id: int,
    text: str,
    is_medium: bool,
    is_high: bool,
    sequence_number: int | None = None,
    is_default: bool = False,
) -> ApplicationQuestion:
    """
    Add one question to an existing question set
    """

    question = ApplicationQuestion(
        question_set_id=question_set_id,
        text=text,
        is_medium=is_medium,
        is_high=is_high,
        sequence_number=sequence_number,
        is_default=is_default,
    )

    db.add(question)
    db.commit()
    db.refresh(question)
    return question


def add_questions_to_set(
    db: Session,
    question_set_id: int,
    questions: list[aq_schemas.AppQuestionCreate],
):
    """
    Add multiple questions to a question set in one transaction
    """

    question_objs = [
        ApplicationQuestion(
            question_set_id=question_set_id,
            text=q.text,
            is_high=q.is_high,
            is_medium=q.is_medium,
            sequence_number=q.sequence_number,
            is_default=q.is_default,
        )
        for q in questions
    ]

    db.add_all(question_objs)
    db.commit()

    for q in question_objs:
        db.refresh(q)

    return question_objs
