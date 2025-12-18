from datetime import datetime


from pydantic import BaseModel, field_validator, Field, ConfigDict
from typing import Literal


class ControlCreate(BaseModel):
    control_area: str
    severity: str
    control_text: str
    description: str | None = None


class ControlRemove(BaseModel):
    control_id: str


class ControlUpdate(BaseModel):
    control_area: str | None = None
    severity: str | None = None
    control_text: str | None = None
    description: str | None = None


class ControlOut(BaseModel):
    checklist_id: str
    id: str
    control_area: str
    severity: str
    control_text: str
    description: str | None = None

    created_at: datetime | None = None
    updated_at: datetime | None = None

    # Automatically convert UTC -> Asia/Kolkata

    model_config = ConfigDict(from_attributes=True)


class UserResponseCreate(BaseModel):
    current_setting: str
    review_comment: str
    evidence_path: str | None = None


class UserResponseCreateBulk(BaseModel):
    control_id: str
    current_setting: str
    review_comment: str
    evidence_path: str | None = None


class UserResponseUpdate(BaseModel):
    current_setting: str | None = None
    review_comment: str | None = None
    evidence_path: str | None = None


class UserResponseOut(BaseModel):
    id: str
    control_id: str
    user_id: str
    current_setting: str
    review_comment: str
    evidence_path: str | None = None

    created_at: datetime | None = None
    updated_at: datetime | None = None

    # Automatically convert UTC -> Asia/Kolkata

    model_config = ConfigDict(from_attributes=True)


class TotalsCount(BaseModel):
    total_responses: int | None = None
    total_controls: int | None = None


class ControlWithResponseOutNonList(BaseModel):
    checklist_id: str
    response_id: str | None = None
    control_id: str
    control_area: str
    severity: str
    control_text: str
    description: str | None = None
    current_setting: str | None = None
    review_comment: str | None = None
    evidence_path: str | None = None
    control_created_at: datetime | None = None
    control_updated_at: datetime | None = None
    response_created_at: datetime | None = None
    response_updated_at: datetime | None = None


class ControlsResponsesQueryParams(BaseModel):
    sort_by: str = Field("created_at", description="Field to sort by")
    sort_order: Literal["asc", "desc"] = Field("desc", description="Sort order")

    page: int
    page_size: int

    @field_validator("sort_by")
    @classmethod
    def validate_sort_by(cls, v: str) -> str:
        valid_fields = {"updated_at", "created_at", "control_area", "control_text"}
        if v not in valid_fields:
            raise ValueError(f"sort_by must be one of {valid_fields}")
        return v


class ControlWithResponseOut(BaseModel):
    list_controls: list[ControlWithResponseOutNonList] = []
    total_counts: TotalsCount


class ControlsWithChecklist(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ImportControlsRequest(BaseModel):
    target_checklist_id: str
    source_checklist_id: str
