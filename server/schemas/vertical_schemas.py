# vertical_schemas.py
from __future__ import annotations
from typing import List, TYPE_CHECKING
from pydantic import BaseModel, ConfigDict

if TYPE_CHECKING:
    from .auth_schemas import UserOut  # type hint only


class VerticalBase(BaseModel):
    id: int
    name: str
    description: str | None = None
    model_config = ConfigDict(from_attributes=True)


class VerticalCreateRequest(BaseModel):
    name: str
    description: str | None = None


class VerticalUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class VerticalsWithUsers(VerticalBase):
    id: int
    owners: List["UserOut"] | None = []

    model_config = ConfigDict(from_attributes=True)
