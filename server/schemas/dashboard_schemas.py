from pydantic import BaseModel


class AppStatuses(BaseModel):
    in_progress: int
    not_yet_started: int
    pending: int
    closed: int
    completed: int
    new_request: int
    cancelled: int
    reopen: int


class DashboardStats(BaseModel):
    app_statuses: AppStatuses
    total_apps: int
