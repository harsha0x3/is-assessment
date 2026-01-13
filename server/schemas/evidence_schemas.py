from pydantic import BaseModel, ConfigDict
from .comment_schemas import CommentOut
from datetime import datetime


class CreateEvidenceRequest(BaseModel):
    uploader_id: str
    evidence_path: str
    severity: str


class CreateEvidenceSchema(CreateEvidenceRequest, BaseModel):
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
    uploader_id: str
    evidence_path: str
    severity: str
    comment_id: str | None
    uploader: EvidenceUploader
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceResponse(EvidenceOut, BaseModel):
    comment: CommentOut
    uploader: EvidenceUploader

    model_config = ConfigDict(from_attributes=True)
