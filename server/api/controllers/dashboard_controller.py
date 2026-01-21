from sqlalchemy import select, func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from collections import defaultdict
from api.constants.statuses import ALL_APP_STATUSES, ALL_DEPT_STATUSES
from api.constants.priorities import PRIORITY_ID_TO_KEY

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
                Department.id.label("dept_id"),
                Department.name.label("department"),
                ApplicationDepartments.status.label("status"),
                func.count().label("status_count"),
            )
            .join(
                ApplicationDepartments,
                ApplicationDepartments.department_id == Department.id,
            )
            .group_by(
                Department.id,
                Department.name,
                ApplicationDepartments.status,
            )
        ).all()

        raw: dict[str, dict] = {}

        for row in rows:
            dept_key = normalize_key(row.department)

            if dept_key not in raw:
                raw[dept_key] = {
                    "dept_id": row.dept_id,
                    "statuses": defaultdict(int),
                }

            raw[dept_key]["statuses"][normalize_key(row.status)] += int(
                row.status_count
            )

        departments = []

        for dept, data in raw.items():
            departments.append(
                ds.DepartmentStatsItem(
                    department_id=data["dept_id"],
                    department=dept,
                    statuses=[
                        ds.DepartmentStatusItem(
                            status=status,
                            count=data["statuses"].get(status, 0),
                        )
                        for status in ALL_DEPT_STATUSES
                    ],
                )
            )

        return ds.DepartmentStatsResponse(departments=departments)

    except Exception:
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


def get_priority_wise_grouped_stats(db: Session):
    try:
        raw = defaultdict(lambda: defaultdict(int))

        rows = db.execute(
            select(
                Application.app_priority.label("priority"),
                Application.status.label("status"),
                func.count().label("status_count"),
            )
            .where(Application.is_active)
            .group_by(Application.app_priority, Application.status)
        ).all()

        # DB aggregation
        for row in rows:
            raw[row.priority][normalize_key(row.status)] += int(row.status_count)

        result = []

        for priority_id, priority_label in PRIORITY_ID_TO_KEY.items():
            status_counts = raw.get(priority_id, {})

            total_apps = sum(status_counts.values())

            if total_apps == 0:
                continue

            result.append(
                ds.PriorityCountItem(
                    priority=priority_label,
                    total_apps=total_apps,
                    statuses=[
                        ds.StatusCountItem(
                            status=status,
                            count=count,
                        )
                        for status, count in status_counts.items()
                    ],
                )
            )

        return result

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting priority wise status split",
        )
