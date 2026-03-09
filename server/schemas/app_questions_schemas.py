from pydantic import BaseModel, ConfigDict
from .auth_schemas import UserOut
from datetime import datetime

class AppQuestionOption(BaseModel):
    id: int
    app_question_id: int
    sequence_number: int | None
    text: str
    description: str | None
    weight: int
    created_at: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

    

class AppQuestion(BaseModel):
    id: int
    question_set_id: int
    sequence_number: int | None
    text: str
    is_medium: bool
    is_high: bool
    options: list[AppQuestionOption]

    model_config = ConfigDict(from_attributes=True)



class AppAnswerOut(BaseModel):
    id: int
    application_id: str
    app_question_id: int
    answer_option_id: int
    answer_text: str | None
    author: UserOut | None
    answer_option: AppQuestionOption

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


class OptionInput(BaseModel):
    text: str
    weight: int
    description: str | None


class AppQuestionCreate(BaseModel):
    text: str
    is_medium: bool = False
    is_high: bool = False
    sequence_number: int | None = None
    is_default: bool = False
    options: list[OptionInput] = []

class AppAnswerInput(BaseModel):
    app_question_id: int
    answer_text: str

class AppAnswerWithOption(BaseModel):
    app_question_id: int
    answer_option_id: int