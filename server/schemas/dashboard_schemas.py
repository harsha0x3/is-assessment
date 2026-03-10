from pydantic import BaseModel


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
    status_chart: list[StatusCountItem]


# ---------- Department-level summary ----------


class DepartmentStatusItem(BaseModel):
    status: str
    count: int


class DepartmentSummaryItem(BaseModel):
    department_id: int
    department: str  # "finance"
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
    sla: int | None

class StatusPerDepartmentParams(BaseModel):
    severity: list[int] | None
    priority: list[int] | None
    app_sla: int | None
    app_status: str 
    sla_filter: int | None
    dept_status: str