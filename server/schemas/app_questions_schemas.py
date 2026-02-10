from pydantic import BaseModel, ConfigDict
from .auth_schemas import UserOut


class AppQuestion(BaseModel):
    id: int
    question_set_id: int
    sequence_number: int | None
    text: str
    is_medium: bool
    is_high: bool


class AppAnswerOut(BaseModel):
    id: int
    application_id: str
    app_question_id: int
    answer_text: str | None
    author: UserOut | None

    model_config = ConfigDict(from_attributes=True)


class AppQuestionWithAnswer(AppQuestion, BaseModel):
    answer: AppAnswerOut | None


class AppQuestionsOut(BaseModel):
    questions: list[AppQuestion]
    answers: list[AppAnswerOut]


class AppQuestionSetOut(BaseModel):
    id: int
    name: str
    description: str | None
    questions: list[AppQuestion]


class AppQuestionCreate(BaseModel):
    text: str
    is_medium: bool = False
    is_high: bool = False
    sequence_number: int | None = None
    is_default: bool = False


class AppAnswerInput(BaseModel):
    app_question_id: int
    answer_text: str
