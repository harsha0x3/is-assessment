from sqlalchemy import select, func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from collections import defaultdict
from api.constants.statuses import ALL_APP_STATUSES, ALL_DEPT_STATUSES

from models import Application, Department, ApplicationDepartments
from schemas import dashboard_schemas as ds


# ---------- helpers ----------


def normalize_key(value: str) -> str:
    return value.lower().replace(" ", "_").replace("-", "_")


def humanize(value: str) -> str:
    return value.replace("_", " ").title()


# ---------- Application status stats ----------


def get_app_status_stats(db: Session) -> ds.ApplicationStats:
    try:
        rows = db.execute(
            select(
                Application.status.label("status"),
                func.count().label("status_count"),
            )
            .where(Application.is_active)
            .group_by(Application.status)
        ).all()

        db_counts = {normalize_key(row.status): int(row.status_count) for row in rows}

        status_chart = [
            ds.StatusCountItem(
                status=status,
                count=db_counts.get(status, 0),
            )
            for status in ALL_APP_STATUSES
        ]

        total_apps = (
            db.scalar(select(func.count(Application.id)).where(Application.is_active))
            or 0
        )

        print(
            ds.ApplicationStats(
                total_apps=total_apps,
                status_chart=status_chart,
            ).model_dump()
        )

        return ds.ApplicationStats(
            total_apps=total_apps,
            status_chart=status_chart,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching application status statistics",
        )


# ---------- Department-wise status stats ----------


def get_department_status_stats(db: Session) -> ds.DepartmentStatsResponse:
    try:
        rows = db.execute(
            select(
                Department.name.label("department"),
                ApplicationDepartments.status.label("status"),
                func.count().label("status_count"),
            )
            .join(
                ApplicationDepartments,
                ApplicationDepartments.department_id == Department.id,
            )
            .group_by(
                Department.name,
                ApplicationDepartments.status,
            )
        ).all()
        raw: dict[str, dict[str, int]] = defaultdict(dict)
        for row in rows:
            raw[row.department][normalize_key(row.status)] = int(row.status_count)

        departments = []
        for dept, status_map in raw.items():
            departments.append(
                ds.DepartmentStatsItem(
                    department=normalize_key(dept),
                    statuses=[
                        ds.DepartmentStatusItem(
                            status=status,
                            count=status_map.get(status, 0),
                        )
                        for status in ALL_DEPT_STATUSES
                    ],
                )
            )

        return ds.DepartmentStatsResponse(departments=departments)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching department status statistics",
        )


def get_dashboard_status_stats(db: Session):
    try:
        app_stats = get_app_status_stats(db=db)
        dept_stats = get_department_status_stats(db=db)
        result = ds.DashboardStatsResponse(
            application_stats=app_stats, department_stats=dept_stats
        )
        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting status charts",
        )
