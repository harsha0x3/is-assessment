from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
import pandas as pd
from sqlalchemy.orm import Session
from db.connection import get_db_conn
from io import StringIO
from api.controllers.exports_controller import (
    export_application_overview_rows,
    get_vertical_applications,
    export_vertical_applications_zip,
)
from typing import Annotated
from services.auth.deps import get_current_user

router = APIRouter(prefix="/export")


@router.get("/applications", response_class=StreamingResponse)
def export_applications_csv(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[Session, Depends(get_current_user)],
):
    rows = export_application_overview_rows(db)

    if not rows:
        return StreamingResponse(iter([""]), media_type="text/csv")

    df = pd.DataFrame(rows)

    buffer = StringIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    headers = {
        "Content-Disposition": "attachment; filename=is_assessment_all_applications.csv"
    }

    return StreamingResponse(buffer, media_type="text/csv", headers=headers)


@router.get("/applications/verticals")
def get_applications_per_vertical(
    db: Annotated[Session, Depends(get_db_conn)],
    current_user: Annotated[Session, Depends(get_current_user)],
):
    return get_vertical_applications(db=db)


@router.get("/applications/verticals/csv")
def export_vertical_csv(db: Session = Depends(get_db_conn)):
    return export_vertical_applications_zip(db)
