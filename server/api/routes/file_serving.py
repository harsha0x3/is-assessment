from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, RedirectResponse
from pathlib import Path
import os
from urllib.parse import unquote, quote

from services.auth.deps import get_current_user  # authentication
from api.controllers.evidence_controller import get_s3_presigned_url
from mimetypes import guess_type

router = APIRouter(prefix="/secured_file", tags=["secured files"])

BASE_DIR = Path(os.getenv("BASE_SERVER_DIR", ""))
UPLOADS_DIR = (BASE_DIR / "uploads").resolve()
ENV = os.getenv("ENV")

ALLOWED_S3_PREFIX = "app_evidences/"


@router.get("")
def serve_secure_file(
    path: str = Query(..., description="Relative file path saved in DB"),
    current_user=Depends(get_current_user),
):
    print("ASFDGASOHUDFIJXASDHJVXKLNASEIRPOFBHCLZVNADFCKSVN ")
    path = unquote(path)
    if ENV == "production":
        presigned_url = get_s3_presigned_url(path)
        return {"url": presigned_url}

    safe_path = (BASE_DIR / path).resolve()

    print("SAFE PATH", safe_path)

    # Security checks
    if BASE_DIR not in safe_path.parents:
        raise HTTPException(400, "Invalid file path")

    if UPLOADS_DIR not in safe_path.parents:
        raise HTTPException(400, "Invalid file path")

    if not safe_path.exists():
        raise HTTPException(404, "File not found")


    return {"url": f"/api/v1.0/secured_file/local?path={quote(path)}"}

from mimetypes import guess_type
from pathlib import Path

@router.get("/local")
def serve_local_file(
    path: str,
    current_user=Depends(get_current_user),
):
    path = unquote(path)
    safe_path = (BASE_DIR / path).resolve()

    print("LOCAL FILE PATH", safe_path)

    if not safe_path.exists():
        raise HTTPException(404, "File not found")

    mime_type, _ = guess_type(str(safe_path))
    mime_type = mime_type or "application/octet-stream"

    VIEWABLE_TYPES = {
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
        "text/plain",
        "video/mp4",
        "video/webm",
    }

    disposition = "inline" if mime_type in VIEWABLE_TYPES else "attachment"

    return FileResponse(
        safe_path,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'{disposition}; filename="{Path(safe_path).name}"'
        },
    )
