from pydantic import BaseModel, ConfigDict
from datetime import datetime


class NewExecSummaryRequest(BaseModel):
    content: str


class Author(BaseModel):
    id: str
    full_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class ExecSummaryInput(NewExecSummaryRequest):
    author_id: str
    application_id: str


class ExecSummaryUpdate(NewExecSummaryRequest):
    id: str
    author_id: str


class ExecSummaryOut(ExecSummaryUpdate):
    application_id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    author: Author | None

    model_config = ConfigDict(from_attributes=True)
