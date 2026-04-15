# models\schemas\app_schemas.py
from pydantic import BaseModel, field_validator, Field, ConfigDict
from typing import Literal

from datetime import datetime, date
from .department_schemas import (
    DepartmentOut,
    AppDeptOutWithLatestComment,
    AppDeptWithLatestExecSummary,
)
from .checklist_schemas import ChecklistOut

from api.controllers.department_controller import (
    get_departments_with_latest_comment,
    get_departments_with_latest_exec_sumary,
)
from sqlalchemy.orm import Session
from .comment_schemas import CommentOut
from .exec_summary_schemas import ExecSummaryOut


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

    app_type: (
        Literal["mobile", "web", "mobile_web", "api", "automation", "desktop"] | None
    ) = None
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

    app_type: (
        Literal["mobile", "web", "mobile_web", "api", "automation", "desktop"] | None
    ) = None
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
    departments: (
        list[AppDeptOutWithLatestComment] | list[AppDeptWithLatestExecSummary] | None
    ) = None

    latest_executive_summary: ExecSummaryOut | None

    app_url: str | None

    severity: int | None

    @classmethod
    def from_application(
        cls, app, db: Session, dept_filter_id: int | None = None, is_exec: bool = False
    ):
        depts_out = (
            get_departments_with_latest_comment(app_id=app.id, db=db)
            if not is_exec
            else get_departments_with_latest_exec_sumary(app_id=app.id, db=db)
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
            latest_executive_summary=ExecSummaryOut.model_validate(
                app.executive_summaries[0]
            )
            if app.executive_summaries
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
    mode: Literal["default", "executive"] = "default"

    @field_validator("sort_by")
    @classmethod
    def validate_sort_by(cls, v: str) -> str:
        valid_fields = {"updated_at", "name", "created_at", "priority", "started_at"}
        if v not in valid_fields:
            raise ValueError(f"sort_by must be one of {valid_fields}")
        return v


class AppStatuses(BaseModel):
    in_progress: int | None = 0
    not_yet_started: int | None = 0
    closed: int | None = 0
    completed: int | None = 0
    new_request: int | None = 0
    cancelled: int | None = 0
    reopen: int | None = 0
    hold: int | None = 0
    go_live: int | None = 0


class EnvironmentCounts(BaseModel):
    internal: int | None = 0
    external: int | None = 0


class AppsSummaryOut(BaseModel):
    total_apps: int | None = 0
    app_statuses: AppStatuses
    priority_counts: dict[int | None, int | None]
    ai_app_count: int | None = 0
    privacy_app_count: int | None = 0
    mobile_app_count: int | None = 0
    web_app_count: int | None = 0
    mobile_web_app_count: int | None = 0
    internal_environment_count: int | None = 0
    external_environment_count: int | None = 0
