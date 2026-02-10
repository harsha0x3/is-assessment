from pydantic import BaseModel, ConfigDict
from .auth_schemas import UserOut


class NewDeptQuestionSet(BaseModel):
    name: str


class NewDeptQuestion(BaseModel):
    text: str
    sequence_number: int


class NewAppDeptLink(BaseModel):
    question_id: int
    sequence_number: int | None = None
    is_default: bool = False


class AnswerOut(BaseModel):
    id: int
    app_dept_question_id: int
    answer_text: str | None = None
    author: UserOut | None = None

    model_config = ConfigDict(from_attributes=True)


class QuestionOut(BaseModel):
    id: int
    text: str

    model_config = ConfigDict(from_attributes=True)


class AppDeptQuestionOut(BaseModel):
    id: int
    application_id: str
    department_id: int
    question_id: int
    sequence_number: int | None = None
    question: QuestionOut
    is_default: bool

    model_config = ConfigDict(from_attributes=True)


class AppDeptQuestionWithAnswer(AppDeptQuestionOut, BaseModel):
    answer: AnswerOut | None = None

    model_config = ConfigDict(from_attributes=True)


class DeptQuestionOut(BaseModel):
    id: int
    text: str
    sequence_number: int | None = None
    is_mandatory: bool

    model_config = ConfigDict(from_attributes=True)


class AppDeptAnswerOut(BaseModel):
    id: int
    dept_question_id: int
    answer_text: str | None
    author: UserOut | None

    model_config = ConfigDict(from_attributes=True)


class DeptQuestionWithAnswerOut(DeptQuestionOut):
    answer: AppDeptAnswerOut | None = None

    model_config = ConfigDict(from_attributes=True)


class AnswerSubmit(BaseModel):
    answer_text: str
