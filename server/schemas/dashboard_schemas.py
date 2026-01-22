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
    vertical: str
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


class DashboardSummaryResponse(BaseModel):
    application_summary: ApplicationSummary
    department_summary: DepartmentSummaryResponse
