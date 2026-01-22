# models\schemas\app_schemas.py
from pydantic import BaseModel, field_validator, Field, ConfigDict
from typing import Literal

from datetime import datetime
from .department_schemas import AppDepartmentOut
from .checklist_schemas import ChecklistOut
from .comment_schemas import CommentOut


class ApplicationCreate(BaseModel):
    name: str
    description: str | None = None
    environment: str | None = None
    region: str | None = None
    owner_name: str | None = None
    vendor_company: str | None = None
    infra_host: str | None = None
    app_tech: str | None = None
    app_priority: int = 2
    priority: int = 2
    vertical: str | None = None

    status: str | None = None
    imitra_ticket_id: str | None = None
    titan_spoc: str | None = None

    started_at: datetime | None = None
    completed_at: datetime | None = None
    due_date: datetime | None = None

    app_url: str | None


class ApplicationOut(BaseModel):
    id: str
    name: str
    description: str | None = None
    environment: str | None = None
    region: str | None = None
    owner_name: str | None = None
    vendor_company: str | None = None
    infra_host: str | None = None
    app_tech: str | None = None
    priority: int = 2
    vertical: str | None = None
    is_active: bool
    is_completed: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None
    owner_id: str | None = None
    ticket_id: str | None = None
    status: str = "pending"
    imitra_ticket_id: str | None
    titan_spoc: str | None

    app_priority: int | None = None

    started_at: datetime | None = None
    completed_at: datetime | None = None
    due_date: datetime | None = None
    app_url: str | None

    # Automatically convert UTC -> Asia/Kolkata

    model_config = ConfigDict(from_attributes=True)


class ApplicationUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    environment: str | None = None
    region: str | None = None
    owner_name: str | None = None
    vendor_company: str | None = None
    infra_host: str | None = None
    app_tech: str | None = None
    priority: int | None = None
    vertical: str | None = None
    app_priority: int | None = None

    status: str | None = None
    imitra_ticket_id: str | None = None
    titan_spoc: str | None = None

    started_at: datetime | None = None
    completed_at: datetime | None = None
    due_date: datetime | None = None
    app_url: str | None


class ListApplicationsOut(BaseModel):
    id: str
    name: str
    description: str | None = None
    ticket_id: str | None = None
    is_completed: bool
    status: str
    priority: int = 2
    app_priority: int | None = None

    started_at: datetime | None = None
    completed_at: datetime | None = None
    due_date: datetime | None = None
    checklists: list[ChecklistOut] | None = None


class NewAppListOut(BaseModel):
    id: str
    name: str
    description: str | None
    ticket_id: str | None = None
    vertical: str | None = None
    imitra_ticket_id: str | None = None
    status: str
    app_priority: int | None = None
    app_url: str | None

    started_at: datetime | None = None
    completed_at: datetime | None = None
    vendor_company: str | None = None
    titan_spoc: str | None
    departments: list[AppDepartmentOut] | None = None
    latest_comment: CommentOut | None


class AppQueryParams(BaseModel):
    sort_by: str = Field("created_at", description="Field to sort by")
    sort_order: Literal["asc", "desc"] = Field("desc", description="Sort order")
    search: str | None
    search_by: Literal[
        "name",
        "environment",
        "region",
        "owner_name",
        "vendor_company",
        "vertical",
        "ticket_id",
    ] = Field("name", description="The field you want to search by")
    page: int = 1
    page_size: int = 15
    status: list[str] | None = None
    vertical: str | None = None
    dept_filter_id: int | None = None
    dept_status: list[str] | None = None
    app_priority: list[str] | None = None

    @field_validator("sort_by")
    @classmethod
    def validate_sort_by(cls, v: str) -> str:
        valid_fields = {"updated_at", "name", "created_at", "priority"}
        if v not in valid_fields:
            raise ValueError(f"sort_by must be one of {valid_fields}")
        return v


class AppStatuses(BaseModel):
    in_progress: int
    not_yet_started: int
    closed: int
    completed: int
    new_request: int
    cancelled: int
    reopen: int
