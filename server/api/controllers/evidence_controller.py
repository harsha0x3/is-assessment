from fastapi import HTTPException, status, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session
from models import ApplicationEvidence
from schemas import evidence_schemas as e_schemas
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config

from datetime import datetime, timezone, timedelta
import mimetypes

import os
import re

BASE_SERVER_DIR = os.getenv("BASE_SERVER_DIR", "")
UPLOADS_DIR = os.path.join(BASE_SERVER_DIR, "uploads")

os.makedirs(UPLOADS_DIR, exist_ok=True)
ENV = os.getenv("ENV")


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

ALLOWED_S3_PREFIX = "app_evidences/"


def sanitize_filename(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]", "_", name)


async def save_evidence_file_s3(file: UploadFile, app_name: str):
    try:
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="File name doesn't exists. Upload a file with name",
            )
        now_utc = datetime.now(timezone.utc)
        ist = timezone(timedelta(hours=5, minutes=30))

        # Convert to IST
        now_ist = now_utc.astimezone(ist)

        timestamp = now_ist.strftime("%Y%m%d_%H%M%S")

        # Split name and extension
        base_name, ext = os.path.splitext(file.filename)

        safe_base = sanitize_filename(base_name)
        safe_ext = sanitize_filename(ext)  # includes "."

        # filename_timestamp.ext
        final_filename = f"{safe_base}_{timestamp}{safe_ext}"

        file_key = f"app_evidences/{app_name}/{final_filename}"

        content_type, _ = mimetypes.guess_type(file.filename)

        s3_client.upload_fileobj(
            file.file,
            S3_BUCKET,
            file_key,
            ExtraArgs={
                "ACL": "private",
                "ContentType": content_type or "application/octet-stream",
                "ContentDisposition": "inline",
            },
        )

        # ✅ Store ONLY the key
        return file_key

    except ClientError as e:
        raise HTTPException(500, f"Error uploading file to S3: {e}")


def validate_s3_key(file_key: str):
    # Normalize
    file_key = file_key.lstrip("/")

    if not file_key.startswith(ALLOWED_S3_PREFIX):
        raise HTTPException(
            status_code=403, detail="Access to this file path is not allowed"
        )

    # Optional: block traversal patterns
    if ".." in file_key:
        raise HTTPException(400, "Invalid file path")

    return file_key


def get_s3_presigned_url(file_key: str, expires_in: int = 3600) -> str:
    """
    Generates a pre-signed URL for a private S3 object.
    file_key: S3 object key (e.g., "user_uploads/<user_id>/<control_id>/file.json")
    expires_in: URL expiration in seconds (default 1 hour)
    """
    try:
        valid_file_key = validate_s3_key(file_key)
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": valid_file_key,
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
    try:
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="File name doesn't exists. Upload a file with name",
            )
        now_utc = datetime.now(timezone.utc)
        ist = timezone(timedelta(hours=5, minutes=30))

        # Convert to IST
        now_ist = now_utc.astimezone(ist)

        timestamp = now_ist.strftime("%Y%m%d_%H%M%S")

        # Split name and extension
        base_name, ext = os.path.splitext(file.filename)

        safe_base = sanitize_filename(base_name)
        safe_ext = sanitize_filename(ext)  # includes "."

        # filename_timestamp.ext
        final_filename = f"{safe_base}_{timestamp}{safe_ext}"

        dir_path = os.path.join(UPLOADS_DIR, "evidences", app_name)
        os.makedirs(dir_path, exist_ok=True)

        file_path = os.path.join(dir_path, final_filename)

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        return f"uploads/evidences/{app_name}/{final_filename}"

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
                evidence_path=e.evidence_path,
                severity=e.severity,
                comment_id=e.comment_id,
                uploader=e_schemas.EvidenceUploader.model_validate(e.uploader),
                created_at=e.created_at,
            )
            for e in evidences
        ]
        return evidence_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching evidences: {str(e)}",
        )


def get_application_evidences(app_id: str, db: Session):
    try:
        evidences = db.scalars(
            select(ApplicationEvidence).where(
                ApplicationEvidence.application_id == app_id
            )
        ).all()
        results = [
            e_schemas.EvidenceOut(
                id=e.id,
                application_id=e.application_id,
                uploader_id=e.uploader_id,
                evidence_path=e.evidence_path,
                severity=e.severity,
                comment_id=e.comment_id,
                uploader=e_schemas.EvidenceUploader.model_validate(e.uploader),
                created_at=e.created_at,
            )
            for e in evidences
        ]

        return {"msg": "Application evidences fetched", "data": results}

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error getting application evidences", "err_stack": str(e)},
        )
