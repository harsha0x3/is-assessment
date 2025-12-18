from pydantic import BaseModel, field_validator, Field
from typing import Literal


class PreAssessmentParams(BaseModel):
    sort_by: str = Field("created_at", description="Field to sort by")
    sort_order: Literal["asc", "desc"] = Field("desc", description="Sort order")

    search: str | None = None
    search_by: str = "id"

    page: int = 1
    page_size: int = 15

    @field_validator("sort_by")
    @classmethod
    def validate_sort_by(cls, v: str) -> str:
        valid_fields = {"updated_at", "created_at"}
        if v not in valid_fields:
            raise ValueError(f"sort_by must be one of {valid_fields}")
        return v
