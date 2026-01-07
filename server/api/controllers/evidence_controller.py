from fastapi import HTTPException, status, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session
from models import ApplicationEvidence
from schemas import evidence_schemas as e_schemas
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
import mimetypes

import os

BASE_SERVER_DIR = os.getenv("BASE_SERVER_DIR", "")
UPLOADS_DIR = os.path.join(BASE_SERVER_DIR, "uploads")

os.makedirs(UPLOADS_DIR, exist_ok=True)


async def add_evidence(payload: e_schemas.CreateEvidenceSchema, db: Session):
    try:
        new_evidence = ApplicationEvidence(
            application_id=payload.application_id,
            uploader_id=payload.uploader_id,
            evidence_path=payload.evidence_path,
            severity=payload.severity,
            comment_id=payload.comment_id,
        )
        db.add(new_evidence)
        db.commit()
        db.refresh(new_evidence)
        return e_schemas.EvidenceResponse.model_validate(new_evidence)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding evidence.",
        )


S3_BUCKET = "infosec-securityassesment"
s3_client = boto3.client(
    "s3", region_name="ap-south-1", config=Config(signature_version="s3v4")
)


async def save_evidence_file_s3(file: UploadFile, app_name: str):
    try:
        file_key = f"app_evidences/{app_name}/{file.filename}"
        content_type, _ = mimetypes.guess_type(file.filename)  # type: ignore
        s3_client.upload_fileobj(
            file.file,
            S3_BUCKET,
            file_key,
            ExtraArgs={
                "ACL": "private",
                "ContentType": content_type,
                "ContentDisposition": "inline",
            },
        )

        return f"{S3_BUCKET}/{file_key}"
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file to S3: {e}",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error in uploading file: {e}",
        )


def get_s3_presigned_url(file_key: str, expires_in: int = 3600) -> str:
    """
    Generates a pre-signed URL for a private S3 object.
    file_key: S3 object key (e.g., "user_uploads/<user_id>/<control_id>/file.json")
    expires_in: URL expiration in seconds (default 1 hour)
    """
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": file_key,
                "ResponseContentDisposition": "inline",
            },
            ExpiresIn=expires_in,
        )
        return url
    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating S3 URL: {e}",
        )


async def save_evidence_file_local(file: UploadFile, app_name: str):
    import time

    try:
        now = time.time()
        file_name = f"{int(now)}_{file.filename}"

        file_path = os.path.join(UPLOADS_DIR, "evidences", app_name, file_name)
        os.makedirs(file_path, exist_ok=True)

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        return f"uploads/evidences/{app_name}/{file_name}"

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file locally: {e}",
        )


def get_evidences_of_comment(comment_id: str, db: Session):
    try:
        evidences = db.scalars(
            select(ApplicationEvidence).where(
                ApplicationEvidence.comment_id == comment_id
            )
        ).all()
        evidence_result = [
            e_schemas.EvidenceOut(
                id=e.id,
                application_id=e.application_id,
                uploader_id=e.uploader_id,
                evidence_path=get_s3_presigned_url(e.evidence_path),
                severity=e.severity,
            )
            for e in evidences
        ]
        return evidence_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching evidences: {str(e)}",
        )
