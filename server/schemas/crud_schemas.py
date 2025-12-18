from datetime import datetime
from zoneinfo import ZoneInfo

from pydantic import BaseModel, ConfigDict
from typing import Literal

from .auth_schemas import UserOut


class AssignmentCreate(BaseModel):
    user_ids: list[str]


class AssignmentOut(BaseModel):
    checklist_id: str
    assigned_users: list[UserOut]

    created_at: datetime | None = None
    updated_at: datetime | None = None

    # Automatically convert UTC -> Asia/Kolkata

    model_config = ConfigDict(from_attributes=True)

    def convert_to_local(self, dt: datetime) -> str:
        if dt.tzinfo is None:
            # make naive UTC aware
            dt = dt.replace(tzinfo=ZoneInfo("UTC"))
        local_dt = dt.astimezone(ZoneInfo("Asia/Kolkata"))
        return local_dt.isoformat()


class PriorityVal(BaseModel):
    priority_val: Literal[1, 2, 3]
