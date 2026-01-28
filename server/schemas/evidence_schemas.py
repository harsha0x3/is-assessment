from pydantic import BaseModel, ConfigDict
from .comment_schemas import CommentOut
from datetime import datetime
from .department_schemas import DepartmentOut


class CreateEvidenceRequest(BaseModel):
    uploader_id: str
    evidence_path: str
    severity: str


class CreateEvidenceSchema(CreateEvidenceRequest, BaseModel):
    department_id: int | None
    application_id: str
    comment_id: str | None = None


class EvidenceUploader(BaseModel):
    id: str
    full_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class EvidenceOut(BaseModel):
    id: str
    application_id: str
    department_id: int | None
    uploader_id: str
    evidence_path: str
    severity: str
    comment_id: str | None
    uploader: EvidenceUploader
    created_at: datetime
    department: DepartmentOut | None

    model_config = ConfigDict(from_attributes=True)


class EvidenceResponse(EvidenceOut, BaseModel):
    comment: CommentOut
    uploader: EvidenceUploader

    model_config = ConfigDict(from_attributes=True)
