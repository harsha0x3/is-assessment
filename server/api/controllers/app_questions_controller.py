from models import AppQuestionSet, ApplicationAnswer, ApplicationQuestion, Application, ApplicationQuestionOption
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, func
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
                        options= [aq_schemas.AppQuestionOption.model_validate(o) for o in q.options]
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
                    options=[aq_schemas.AppQuestionOption.model_validate(o) for o in question.options],
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


def get_criticality_score(app_id: str, db: Session):

    try:
        app = db.get(Application, app_id)

        if not app or not app.question_set_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found or questionnaire not assigned.",
            )

        score = db.scalar(
            select(func.coalesce(func.sum(ApplicationQuestionOption.weight), 0))
            .join(
                ApplicationAnswer,
                ApplicationAnswer.answer_option_id == ApplicationQuestionOption.id,
            )
            .where(ApplicationAnswer.application_id == app_id)
        )

        return score

    except HTTPException:
        raise

def determine_criticality(score: int):
    if score <=12:
        return 1
    
    if score < 12 and score <=18:
        return 2
    if score < 18 and score <=26:
        return 3
    if score < 26:
        return 4

def get_app_criticality(app_id: str, db: Session):
    """
    Check if the application is marked as crown jewel
    """
    try:
        responses = get_questions_with_answers(db=db, application_id=app_id)

        first_q = None
        second_q = None
        third_q = None
        fourth_q = None
        fifth_q = None
        sixth_q = None
        seventh_q = None
        eighth_q = None

        for res in responses:
            if res.sequence_number == 1:
                first_q = res
            elif res.sequence_number == 2:
                second_q = res
            elif res.sequence_number == 3:
                third_q = res
            elif res.sequence_number == 4:
                fourth_q = res
            elif res.sequence_number == 5:
                fifth_q = res
            elif res.sequence_number == 6:
                sixth_q = res
            elif res.sequence_number == 7:
                seventh_q = res
            elif res.sequence_number == 8:
                eighth_q = res

        def is_yes(q):
            return (
                q
                and q.answer
                and q.answer.answer_text
                and q.answer.answer_text.lower() == "yes"
            )

        print("Responses:")
        print(
            f"first_q: {first_q.answer.answer_text if first_q and first_q.answer else 'No answer'}"
        )
        print(
            f"second_q: {second_q.answer.answer_text if second_q and second_q.answer else 'No answer'}"
        )
        print(
            f"third_q: {third_q.answer.answer_text if third_q and third_q.answer else 'No answer'}"
        )
        print(
            f"fourth_q: {fourth_q.answer.answer_text if fourth_q and fourth_q.answer else 'No answer'}"
        )
        print(
            f"fifth_q: {fifth_q.answer.answer_text if fifth_q and fifth_q.answer else 'No answer'}"
        )
        print(
            f"sixth_q: {sixth_q.answer.answer_text if sixth_q and sixth_q.answer else 'No answer'}"
        )
        print(
            f"seventh_q: {seventh_q.answer.answer_text if seventh_q and seventh_q.answer else 'No answer'}"
        )
        print(
            f"eighth_q: {eighth_q.answer.answer_text if eighth_q and eighth_q.answer else 'No answer'}"
        )

        # Rule 1
        if is_yes(fifth_q):
            return 4

        # Rule 2
        if is_yes(first_q) and (is_yes(second_q) or is_yes(third_q)):
            print("1 and (2 or 3) is true")
            return 4

        # Rule 3
        if is_yes(fourth_q) and (is_yes(second_q) or is_yes(third_q)):
            print("4 and (2 or 3) is true")
            return 4

        # Rule 4
        if is_yes(second_q) or is_yes(third_q) or is_yes(sixth_q):
            print("2 or 3 or 6 is true")
            return 3

        # Rule 5
        if is_yes(first_q) and is_yes(fourth_q) or is_yes(seventh_q):
            print("4 or 7 is true")
            return 2

        print("None of the conditions met, returning 1")
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
            application.severity = criticlity
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
            application.severity = criticlity
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

def answer_bulk(
    db: Session,
    application_id: str,
    payload: list[aq_schemas.AppAnswerWithOption],
):
    try:
        app = db.get(Application, application_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App not found"
            )

        # Fetch existing answers for this application
        existing_answers = (
            db.query(ApplicationAnswer)
            .filter(ApplicationAnswer.application_id == application_id)
            .all()
        )

        existing_map = {
            ans.app_question_id: ans for ans in existing_answers
        }

        for ans in payload:

            # UPDATE existing answer
            if ans.app_question_id in existing_map:
                existing_map[ans.app_question_id].answer_option_id = ans.answer_option_id

            # CREATE new answer
            else:
                new_answer = ApplicationAnswer(
                    application_id=application_id,
                    app_question_id=ans.app_question_id,
                    answer_option_id=ans.answer_option_id,
                )
                db.add(new_answer)

        db.commit()

        # Recalculate score
        score = get_criticality_score(app_id=application_id, db=db)

        if not score:
            print("NO SCORE")

        severity = determine_criticality(score=score) if score else 1

        app.severity = severity or 1

        db.commit()

        return "success"

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error answering bulk",
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
    question_data: aq_schemas.AppQuestionCreate,
) -> ApplicationQuestion:

    try:
        question_set = db.get(AppQuestionSet, question_set_id)

        if not question_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question set not found",
            )

        question = ApplicationQuestion(
            question_set_id=question_set_id,
            text=question_data.text,
            is_medium=question_data.is_medium,
            is_high=question_data.is_high,
            sequence_number=question_data.sequence_number,
            is_default=question_data.is_default,
        )

        db.add(question)
        db.flush()

        options = []
        for opt in question_data.options:
            option = ApplicationQuestionOption(
                app_question_id=question.id,
                text=opt.text,
                weight=opt.weight,
            )
            options.append(option)

        db.add_all(options)

        db.commit()
        db.refresh(question)

        return question

    except Exception:
        db.rollback()
        raise

def add_questions_to_set(
    db: Session,
    question_set_id: int,
    questions: list[aq_schemas.AppQuestionCreate],
):

    try:
        question_set = db.get(AppQuestionSet, question_set_id)

        if not question_set:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question set not found",
            )

        question_objs = []

        for q in questions:
            question = ApplicationQuestion(
                question_set_id=question_set_id,
                text=q.text,
                is_medium=q.is_medium,
                is_high=q.is_high,
                sequence_number=q.sequence_number,
                is_default=q.is_default,
            )

            db.add(question)
            db.flush()

            options = [
                ApplicationQuestionOption(
                    app_question_id=question.id,
                    text=o.text,
                    weight=o.weight,
                    description = o.description
                )
                for o in q.options
            ]

            db.add_all(options)

            question_objs.append(question)

        db.commit()

        return question_objs

    except Exception:
        db.rollback()
        raise