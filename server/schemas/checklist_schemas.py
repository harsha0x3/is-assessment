from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from .auth_schemas import UserOut
from typing import Literal


class ChecklistCreate(BaseModel):
    checklist_type: str
    priority: int = 2


class ChecklistOut(BaseModel):
    id: str
    app_name: str | None = None
    checklist_type: str
    assigned_users: list[UserOut] | None = None
    is_completed: bool
    priority: int = 2
    status: str
    comment: str | None = None

    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ChecklistUpdate(BaseModel):
    checklist_type: str
    priority: int


class EvaluateChecklist(BaseModel):
    status: str = "in_progress"
    comment: str | None = None


class ChecklistQueryParams(BaseModel):
    sort_by: str = Field("created_at", description="Field to sort by")
    sort_order: Literal["asc", "desc"] = Field("desc", description="Sort order")

    search: str | None
    search_by: Literal["checklist_type", "priority", "is_completed"] = Field(
        "checklist_type", description="The field you want to search by"
    )
    page: int
    page_size: int

    @field_validator("sort_by")
    @classmethod
    def validate_sort_by(cls, v: str) -> str:
        valid_fields = {"updated_at", "checklist_type", "created_at", "priority"}
        if v not in valid_fields:
            raise ValueError(f"sort_by must be one of {valid_fields}")
        return v
