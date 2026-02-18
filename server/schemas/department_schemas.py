# models\schemas\department_schemas.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from .auth_schemas import UserOut


class DepartmentCreate(BaseModel):
    name: str
    description: str | None = None


class DepartmentOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class AppDepartmentOut(DepartmentOut, BaseModel):
    status: str
    app_category: str | None
    category_status: str | None


class NewUserDepartmentAssign(BaseModel):
    user_id: str
    role: str | None = None


class CommentOut(BaseModel):
    id: str
    content: str
    author_id: str | None
    application_id: str
    department_id: int
    status: str | None

    department: DepartmentOut

    author: UserOut | None

    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class DepartmentInfo(AppDepartmentOut, BaseModel):
    comments: list[CommentOut] = []
    can_go_live: bool = False


class DeptStatusPayload(BaseModel):
    status: str | None = None
    app_category: str | None = None
    category_status: str | None = None
