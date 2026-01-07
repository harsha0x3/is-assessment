from pydantic import BaseModel, ConfigDict
from .comment_schemas import CommentOut


class CreateEvidenceRequest(BaseModel):
    uploader_id: str
    evidence_path: str
    severity: str


class CreateEvidenceSchema(CreateEvidenceRequest, BaseModel):
    application_id: str
    comment_id: str | None = None


class EvidenceUploader(BaseModel):
    id: str
    username: str
    email: str
    first_name: str
    last_name: str | None = None


class EvidenceOut(BaseModel):
    id: str
    application_id: str
    uploader_id: str
    evidence_path: str
    severity: str
    comment_id: str

    model_config = ConfigDict(from_attributes=True)


class EvidenceResponse(EvidenceOut, BaseModel):
    comment: CommentOut
    uploader: EvidenceUploader

    model_config = ConfigDict(from_attributes=True)
