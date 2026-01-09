from models import Application
from sqlalchemy import select, and_, func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from schemas import dashboard_schemas as ds


def get_dashboard_stats(db: Session):
    try:
        normalized_status = func.replace(
            func.replace(
                func.lower(Application.status),
                " ",
                "_",
            ),
            "-",
            "_",
        )

        rows = db.execute(
            select(
                normalized_status.label("status"), func.count().label("status_count")
            )
            .where(Application.is_active)
            .group_by(normalized_status)
        ).all()

        app_statuses = {row.status: int(row.status_count) for row in rows}

        total_apps = db.scalar(
            select(func.count(Application.id)).where(Application.is_active)
        )

        result = ds.DashboardStats(
            total_apps=total_apps or 0,
            app_statuses=ds.AppStatuses(
                in_progress=app_statuses.get("in_progress") or 0,
                not_yet_started=app_statuses.get("not_yet_started") or 0,
                pending=app_statuses.get("pending") or 0,
                closed=app_statuses.get("closed") or 0,
                new_request=app_statuses.get("new_request") or 0,
                cancelled=app_statuses.get("cancelled") or 0,
                completed=app_statuses.get("completed") or 0,
                reopen=app_statuses.get("reopen") or 0,
            ),
        )

        print("Results:", result)

        return result
    except Exception as e:
        print("rror Fetching overall statistics", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error Fetching overall statistics.",
        )
