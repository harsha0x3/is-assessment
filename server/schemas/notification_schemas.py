from pydantic import BaseModel
from datetime import datetime


class NewAppData(BaseModel):
    app_name: str
    description: str | None
    vertical: str | None
    vendor_company: str | None
    sla: str | datetime | None


class NewAppNotification(NewAppData, BaseModel):
    full_name: str
    email: str
