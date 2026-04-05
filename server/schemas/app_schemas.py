# models\schemas\app_schemas.py
from pydantic import BaseModel, field_validator, Field, ConfigDict
from typing import Literal

from datetime import datetime, date
from .department_schemas import (
    AppDepartmentOut,
    DepartmentOut,
    AppDeptOutWithLatestComment,
)
from .checklist_schemas import ChecklistOut
from api.controllers.comments_controller import get_latest_app_dept_comment
from api.controllers.department_controller import (
    get_departments_by_application,
    get_departments_with_latest_comment,
)
from sqlalchemy.orm import Session
from .comment_schemas import CommentOut


class VerticalOut(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


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

    user_type: str | None = None
    data_type: str | None = None

    app_type: str | None = None
    is_app_ai: bool | None = None
    is_privacy_applicable: bool | None = None

    vertical_id: int | None = None

    requested_date: date | None = None

    scope: Literal["is_assessment", "vapt_only"] | None = "is_assessment"

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
    vertical: str | None = None
    is_active: bool
    is_completed: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None
    owner_id: str | None = None
    status: str = "pending"
    imitra_ticket_id: str | None
    titan_spoc: str | None

    due_date: datetime | None = None

    app_priority: int | None = None

    started_at: datetime | None = None
    completed_at: datetime | None = None
    app_url: str | None

    user_type: str | None
    data_type: str | None

    app_type: str | None = None
    is_app_ai: bool | None
    is_privacy_applicable: bool | None
    requested_date: date | None = None
    severity: int | None
    vertical_id: int | None

    app_vertical: VerticalOut | None

    departments: list[DepartmentOut] | None

    scope: Literal["is_assessment", "vapt_only"] | None | str

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

    user_type: str | None = None
    data_type: str | None = None

    app_type: str | None = None
    is_app_ai: bool | None = None

    requested_date: date | None = None
    severity: int | None = None
    is_privacy_applicable: bool | None = None

    vertical_id: int | None = None

    scope: Literal["is_assessment", "vapt_only"] | None = "is_assessment"


class ListApplicationsOut(BaseModel):
    id: str
    name: str
    description: str | None = None
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
    vertical: str | None = None

    app_vertical: VerticalOut | None

    imitra_ticket_id: str | None = None
    status: str
    app_priority: int | None = None
    # app_url: str | None
    environment: str | None

    started_at: datetime | None = None
    completed_at: datetime | None = None
    due_date: datetime | None

    app_type: str | None
    is_app_ai: bool | None
    is_privacy_applicable: bool | None

    requested_date: date | None = None

    vendor_company: str | None = None
    titan_spoc: str | None
    departments: list[AppDeptOutWithLatestComment] | None = None
    latest_comment: CommentOut | None

    app_url: str | None

    severity: int | None

    @classmethod
    def from_application(
        cls, app, db: Session, dept_filter_id: int | None = None, is_exec: bool = False
    ):
        latest_comment = None

        depts_out = get_departments_with_latest_comment(app_id=app.id, db=db)

        if dept_filter_id and not is_exec:
            latest_comment = get_latest_app_dept_comment(
                app_id=app.id, dept_id=dept_filter_id, db=db
            )

        return cls(
            id=app.id,
            name=app.name,
            description=app.description,
            vertical=app.vertical,
            imitra_ticket_id=app.imitra_ticket_id,
            status=app.status,
            app_priority=app.app_priority,
            started_at=app.started_at,
            completed_at=app.completed_at,
            departments=depts_out,
            vendor_company=app.vendor_company,
            latest_comment=latest_comment,
            due_date=app.due_date,
            titan_spoc=app.titan_spoc,
            environment=app.environment,
            severity=app.severity,
            is_app_ai=app.is_app_ai,
            is_privacy_applicable=app.is_privacy_applicable,
            app_type=app.app_type,
            app_url=app.app_url,
            app_vertical=VerticalOut.model_validate(app.app_vertical)
            if app.app_vertical
            else None,
        )


class AppQueryParams(BaseModel):
    sort_by: str = Field("started_at", description="Field to sort by")
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
        None,
    ] = Field(None, description="The field you want to search by")
    page: int = 1
    page_size: int = 15
    status: list[str] | None = None
    vertical: str | None = None
    dept_filter_id: int | None = None
    dept_status: list[str] | None = None
    app_priority: list[str] | None = None
    sla_filter: int | None
    ai_apps: str | None = None
    mobile_apps: str | None = None
    web_apps: str | None = None
    mobile_web_apps: str | None = None
    privacy_apps: str | None = None
    severity: list[int] | None
    environment: Literal["external", "internal"] | None

    vertical_ids: list[int] | None

    app_type: list[str] | None
    app_features: list[str] | None

    app_age_from: date | None
    app_age_to: date | None

    scope: Literal["is_assessment", "vapt_only", "all"] = "is_assessment"

    @field_validator("sort_by")
    @classmethod
    def validate_sort_by(cls, v: str) -> str:
        valid_fields = {"updated_at", "name", "created_at", "priority", "started_at"}
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
    hold: int
    go_live: int


class EnvironmentCounts(BaseModel):
    internal: int | None = 0
    external: int | None = 0


class AppsSummaryOut(BaseModel):
    total_apps: int
    app_statuses: AppStatuses
    priority_counts: dict[int, int]
    ai_app_count: int
    privacy_app_count: int
    mobile_app_count: int
    web_app_count: int
    mobile_web_app_count: int
    internal_environment_count: int | None = 0
    external_environment_count: int | None = 0
