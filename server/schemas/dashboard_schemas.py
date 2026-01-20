from pydantic import BaseModel


# ---------- Common ----------


class StatusCountItem(BaseModel):
    status: str  # "in_progress"
    count: int


# ---------- Application-level stats ----------


class ApplicationStats(BaseModel):
    total_apps: int
    status_chart: list[StatusCountItem]


# ---------- Department-level stats ----------


class DepartmentStatusItem(BaseModel):
    status: str
    count: int


class DepartmentStatsItem(BaseModel):
    department_id: int
    department: str  # "finance"
    statuses: list[DepartmentStatusItem]


class DepartmentStatsResponse(BaseModel):
    departments: list[DepartmentStatsItem]


class DashboardStatsResponse(BaseModel):
    application_stats: ApplicationStats
    department_stats: DepartmentStatsResponse
