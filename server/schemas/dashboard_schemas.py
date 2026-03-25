from pydantic import BaseModel
from datetime import date
from typing import Literal

# ---------- Common ----------


class StatusCountItem(BaseModel):
    status: str  # "in_progress"
    count: int


class PriorityCountItem(BaseModel):
    priority: str  # "in_progress"
    total_apps: int
    statuses: list[StatusCountItem]


class VerticalStatusSummary(BaseModel):
    vertical: str | None
    total: int
    statuses: list[StatusCountItem]


# ---------- Application-level summary ----------


class ApplicationSummary(BaseModel):
    total_apps: int
    filtered_apps: int
    status_chart: list[StatusCountItem]


# ---------- Department-level summary ----------


class DepartmentStatusItem(BaseModel):
    status: str
    count: int


class DepartmentSummaryItem(BaseModel):
    department_id: int
    department: str  # "finance"
    total_apps: int
    statuses: list[DepartmentStatusItem]


class DepartmentSummaryResponse(BaseModel):
    departments: list[DepartmentSummaryItem]
    total_apps: int


class DashboardSummaryResponse(BaseModel):
    application_summary: ApplicationSummary
    department_summary: DepartmentSummaryResponse


class CategoryStatusItem(BaseModel):
    cat_status: str
    count: int


class CategorySummaryItem(BaseModel):
    category: str
    total: int
    statuses: list[CategoryStatusItem]


class DepartmentCategorySummaryResponse(BaseModel):
    department_id: int
    dept_status: str
    categories: list[CategorySummaryItem]


class AppSummaryQueryParams(BaseModel):
    severity: list[int] | None
    priority: list[int] | None
    app_age_from: date | None
    app_age_to: date | None
    scope: Literal["is_assessment", "vapt_only"] = "is_assessment"


class DeptSummaryQueryParams(BaseModel):
    status: str | None
    severity: list[int] | None
    priority: list[int] | None
    app_age_from: date | None
    app_age_to: date | None
    scope: Literal["is_assessment", "vapt_only"] = "is_assessment"


class StatusPerDepartmentParams(BaseModel):
    severity: list[int] | None
    priority: list[int] | None
    app_age_from: date | None
    app_age_to: date | None
    app_status: str

    dept_status: str


class AppTypeSummaryParams(BaseModel):
    severity: list[int] | None
    priority: list[int] | None
    app_age_from: date | None
    app_age_to: date | None
    scope: Literal["is_assessment", "vapt_only"] = "is_assessment"
    app_status: str | None


class AppTypeSummaryItem(BaseModel):
    app_type: str
    total: int
    privacy: int
    ai: int
    other: int


class VerticalWiseSummaryParams(BaseModel):
    scope: Literal["is_assessment", "vapt_only"] = "is_assessment"


class VAPTSummaryItem(BaseModel):
    statuses: list[StatusCountItem]
    total_apps: int
    filtered_apps: int
    app_type: str  # Literal["web", "mobile", "mobile_web", "others"]


class VAPTSummary(BaseModel):
    data: list[VAPTSummaryItem]


class ApplicationCompletionStats(BaseModel):
    bucket: str
    count: int
