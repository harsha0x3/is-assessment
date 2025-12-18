# models\schemas\comment_schemas.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from .auth_schemas import UserOut
from .department_schemas import DepartmentOut


class NewCommentRequest(BaseModel):
    content: str


class CommentInput(NewCommentRequest, BaseModel):
    author_id: str
    application_id: str
    department_id: int


class CommentOut(BaseModel):
    id: str
    content: str
    author_id: str
    application_id: str
    department_id: int

    department: DepartmentOut

    author: UserOut

    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
