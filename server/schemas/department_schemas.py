# models\schemas\department_schemas.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from .auth_schemas import UserOut


class DepartmentCreate(BaseModel):
    name: str
    description: str | None = None


class ControlResultOut(BaseModel):
    id: int
    name: str
    status: str | None

    model_config = ConfigDict(from_attributes=True)


class DepartmentOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    status: str | None = None

    model_config = ConfigDict(from_attributes=True)


class AppDepartmentOut(DepartmentOut):
    started_at: datetime | None
    ended_at: datetime | None
    go_live_at: datetime | None
    app_category: str | None
    category_status: str | None


class CommentUserOut(BaseModel):
    id: str
    full_name: str

    model_config = ConfigDict(from_attributes=True)


class DeptLatestComment(BaseModel):
    id: str
    content: str
    author: CommentUserOut | None = None
    status: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class DeptLatestExecSUmmary(BaseModel):
    id: str
    content: str
    author: CommentUserOut | None = None
    scope: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class AppDeptOutWithLatestComment(BaseModel):
    id: int
    name: str
    description: str | None = None
    status: str | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    go_live_at: datetime | None = None
    app_category: str | None = None
    category_status: str | None = None

    latest_comment: DeptLatestComment | None = None

    model_config = ConfigDict(from_attributes=True)


class AppDeptWithLatestExecSummary(BaseModel):
    id: int
    name: str
    description: str | None = None
    status: str | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None
    go_live_at: datetime | None = None
    app_category: str | None = None
    category_status: str | None = None

    latest_exec_summary: DeptLatestExecSUmmary | None = None

    model_config = ConfigDict(from_attributes=True)


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
    controls: list[ControlResultOut] = []
    app_category: str | None
    category_status: str | None
    can_go_live: bool = False


class DeptStatusPayload(BaseModel):
    status: str | None = None
    app_category: str | None = None
    category_status: str | None = None
    started_at: datetime | None = None
    ended_at: datetime | None = None


class DepartmentControlCreate(BaseModel):
    name: str
    control_type: str | None = None


class DepartmentControlOut(BaseModel):
    id: int
    name: str
    control_type: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ControlStatusPayload(BaseModel):
    status: str
