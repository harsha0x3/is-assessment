from models import Question, Application, AppDeptQuestions
from sqlalchemy import select
from db.connection import get_db_conn
from api.controllers.dept_questionnaire_controller import link_question_to_department

def dump_questions_for_dept():
    DEPT_ID = 4
    question_ids = []

    with next(get_db_conn()) as db:
        dept_qs = []
        apps = db.scalars(select(Application)).all()
        for app in apps:
            