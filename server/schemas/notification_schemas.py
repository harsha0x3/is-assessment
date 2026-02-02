from pydantic import BaseModel


class NewAppData(BaseModel):
    app_name: str
    description: str | None
    vertical: str | None
    vendor_company: str | None
    sla: str | None


class NewAppNotification(NewAppData, BaseModel):
    full_name: str
    email: str
