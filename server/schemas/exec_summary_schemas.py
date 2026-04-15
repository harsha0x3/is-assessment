from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Literal


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
    department_id: int | None = None
    scope: Literal["application", "department"] = "application"


class ExecSummaryUpdate(NewExecSummaryRequest):
    id: str
    author_id: str


class ExecSummaryOut(ExecSummaryUpdate):
    application_id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    scope: str | None = "application"
    author: Author | None

    model_config = ConfigDict(from_attributes=True)


class DeptExecSummaryOut(ExecSummaryOut):
    department_id: int | None = None
