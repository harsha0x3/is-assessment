from sqlalchemy import select, func, and_
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from collections import defaultdict
from api.constants.statuses import ALL_APP_STATUSES, ALL_DEPT_STATUSES
from api.constants.priorities import PRIORITY_ID_TO_KEY
from datetime import timedelta, date
from models import Application, Department, ApplicationDepartments
from schemas import dashboard_schemas as ds


# ---------- helpers ----------


def normalize_key(value: str) -> str:
    return value.lower().replace(" ", "_").replace("-", "_")


def humanize(value: str) -> str:
    return value.replace("_", " ").title()


# ---------- Application status summary ----------


def get_app_status_summary(db: Session) -> ds.ApplicationSummary:
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

        return ds.ApplicationSummary(
            total_apps=total_apps,
            status_chart=status_chart,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching application status statistics",
        )


# ---------- Department-wise status summary ----------


def get_department_status_summary(
    db: Session, status_filter: str | None, sla_filter: int | None
) -> ds.DepartmentSummaryResponse:
    try:
        stmt = (
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
        )
        total_apps_stmt = select(func.count(Application.id)).where(
            Application.is_active
        )

        if status_filter or (sla_filter is not None and sla_filter > 0):
            stmt = stmt.join(
                Application,
                Application.id == ApplicationDepartments.application_id,
            )

        if status_filter and status_filter != "all":
            stmt = stmt.where(Application.status == status_filter)
            total_apps_stmt = total_apps_stmt.where(Application.status == status_filter)

        today = date.today()

        if sla_filter and sla_filter > 0:
            # Always ignore rows with NULL started_at
            stmt = stmt.where(Application.started_at.is_not(None))

            if sla_filter == 30:
                # 0–30 days
                lower = today - timedelta(days=30)

                stmt = stmt.where(
                    and_(
                        func.date(Application.started_at) >= lower,
                        func.date(Application.started_at) <= today,
                        Application.started_at.is_not(None),
                    )
                )
                total_apps_stmt = total_apps_stmt.where(
                    and_(
                        func.date(Application.started_at) >= lower,
                        func.date(Application.started_at) <= today,
                        Application.started_at.is_not(None),
                    )
                )

            elif sla_filter == 60:
                # 30–60 days
                upper = today - timedelta(days=30)
                lower = today - timedelta(days=60)

                stmt = stmt.where(
                    and_(
                        func.date(Application.started_at) >= lower,
                        func.date(Application.started_at) < upper,
                        Application.started_at.is_not(None),
                    )
                )
                total_apps_stmt = total_apps_stmt.where(
                    and_(
                        func.date(Application.started_at) >= lower,
                        func.date(Application.started_at) < upper,
                        Application.started_at.is_not(None),
                    )
                )

            elif sla_filter == 90:
                # 60–90 days
                upper = today - timedelta(days=60)
                lower = today - timedelta(days=90)

                stmt = stmt.where(
                    and_(
                        func.date(Application.started_at) >= lower,
                        func.date(Application.started_at) < upper,
                        Application.started_at.is_not(None),
                    )
                )
                total_apps_stmt = total_apps_stmt.where(
                    and_(
                        func.date(Application.started_at) >= lower,
                        func.date(Application.started_at) < upper,
                        Application.started_at.is_not(None),
                    )
                )

            elif sla_filter == 91:
                # 90+ days
                cutoff = today - timedelta(days=90)

                stmt = stmt.where(
                    and_(
                        func.date(Application.started_at) < cutoff,
                        Application.started_at.is_not(None),
                    )
                )
                total_apps_stmt = total_apps_stmt.where(
                    and_(
                        func.date(Application.started_at) < cutoff,
                        Application.started_at.is_not(None),
                    )
                )

        rows = db.execute(stmt).all()

        total_apps = db.scalar(total_apps_stmt) or 0

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
                ds.DepartmentSummaryItem(
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

        return ds.DepartmentSummaryResponse(
            departments=departments, total_apps=total_apps
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching department status statistics",
        )


# def get_dashboard_status_summary(db: Session):
#     try:
#         app_summary = get_app_status_summary(db=db)
#         result = ds.DashboardSummaryResponse(
#             application_summary=app_summary, department_summary=dept_summary
#         )
#         return result

#     except HTTPException:
#         raise

#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Error getting status charts",
#         )


def get_priority_wise_grouped_summary(db: Session, status_filter: str | None):
    try:
        stmt = (
            select(
                Application.app_priority.label("priority"),
                Application.status.label("status"),
                func.count().label("status_count"),
            )
            .where(Application.is_active)
            .group_by(Application.app_priority, Application.status)
        )

        if status_filter and status_filter != "all":
            stmt = stmt.where(Application.status == status_filter)
            # total_apps_stmt = total_apps_stmt.where(Application.status == status_filter)

        rows = db.execute(stmt).all()

        raw = defaultdict(lambda: defaultdict(int))

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


def get_vertical_wise_app_statuses(db: Session):
    try:
        rows = db.execute(
            select(
                Application.vertical.label("vertical"),
                Application.status.label("status"),
                func.count().label("status_count"),
            ).group_by(Application.vertical, Application.status)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting vertical wise applications",
        )

    grouped: dict[str, dict] = defaultdict(lambda: {"total": 0, "statuses": []})

    for row in rows:
        vertical = row.vertical
        status_ = row.status
        count = row.status_count

        grouped[vertical]["statuses"].append(
            ds.StatusCountItem(status=status_, count=count)
        )
        grouped[vertical]["total"] += count

    response: list[ds.VerticalStatusSummary] = []

    for vertical, data in grouped.items():
        response.append(
            ds.VerticalStatusSummary(
                vertical=vertical,
                total=data["total"],
                statuses=data["statuses"],
            )
        )

    return response


def get_department_sub_category(
    db: Session,
    department_id: int,
    dept_status: str,
    app_status: str | None = None,
    sla_filter: int | None = None,
) -> ds.DepartmentCategorySummaryResponse:
    try:
        stmt = (
            select(
                ApplicationDepartments.app_category.label("category"),
                ApplicationDepartments.category_status.label("category_status"),
                func.count().label("item_count"),
            )
            .join(Application, Application.id == ApplicationDepartments.application_id)
            .where(
                ApplicationDepartments.department_id == department_id,
                ApplicationDepartments.status == dept_status,
                ApplicationDepartments.app_category.is_not(None),
                ApplicationDepartments.category_status.is_not(None),
            )
            .group_by(
                ApplicationDepartments.app_category,
                ApplicationDepartments.category_status,
            )
        )

        if app_status and app_status != "all":
            stmt = stmt.where(Application.status == app_status)

        if app_status and app_status != "all":
            stmt = stmt.where(Application.status == app_status)

        today = date.today()

        if sla_filter and sla_filter > 0:
            stmt = stmt.where(Application.started_at.is_not(None))

            if sla_filter == 30:
                stmt = stmt.where(
                    func.date(Application.started_at) >= today - timedelta(days=30)
                )
            elif sla_filter == 60:
                stmt = stmt.where(
                    func.date(Application.started_at).between(
                        today - timedelta(days=60),
                        today - timedelta(days=30),
                    )
                )
            elif sla_filter == 90:
                stmt = stmt.where(
                    func.date(Application.started_at).between(
                        today - timedelta(days=90),
                        today - timedelta(days=60),
                    )
                )
            elif sla_filter == 91:
                stmt = stmt.where(
                    func.date(Application.started_at) < today - timedelta(days=90)
                )

        rows = db.execute(stmt).all()

        grouped: dict[str, dict] = defaultdict(
            lambda: {"total": 0, "statuses": defaultdict(int)}
        )

        for row in rows:
            cat = normalize_key(row.category)
            cat_status = normalize_key(row.category_status)
            count = int(row.item_count)

            grouped[cat]["statuses"][cat_status] += count
            grouped[cat]["total"] += count

        categories = [
            ds.CategorySummaryItem(
                category=cat,
                total=data["total"],
                statuses=[
                    ds.CategoryStatusItem(cat_status=s, count=c)
                    for s, c in data["statuses"].items()
                ],
            )
            for cat, data in grouped.items()
        ]

        return ds.DepartmentCategorySummaryResponse(
            department_id=department_id,
            dept_status=dept_status,
            categories=categories,
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching category level summary",
        )


def get_statuses_per_dept(
    db: Session,
    app_status: str,
    dept_status: str,
    sla_filter: int | None = None,
):
    try:
        stmt = (
            select(
                Department.id.label("department_id"),
                Department.name.label("department"),
                func.count(func.distinct(Application.id)).label("item_count"),
            )
            .select_from(ApplicationDepartments)
            .join(Application, Application.id == ApplicationDepartments.application_id)
            .join(Department, Department.id == ApplicationDepartments.department_id)
            .where(
                Application.status == app_status,
                ApplicationDepartments.status == dept_status,
            )
            .group_by(Department.id, Department.name)
        )

        today = date.today()

        if sla_filter and sla_filter > 0:
            stmt = stmt.where(Application.started_at.is_not(None))

            if sla_filter == 30:
                stmt = stmt.where(
                    func.date(Application.started_at) >= today - timedelta(days=30)
                )
            elif sla_filter == 60:
                stmt = stmt.where(
                    func.date(Application.started_at).between(
                        today - timedelta(days=60),
                        today - timedelta(days=30),
                    )
                )
            elif sla_filter == 90:
                stmt = stmt.where(
                    func.date(Application.started_at).between(
                        today - timedelta(days=90),
                        today - timedelta(days=60),
                    )
                )
            elif sla_filter == 91:
                stmt = stmt.where(
                    func.date(Application.started_at) < today - timedelta(days=90)
                )

        rows = db.execute(stmt).all()

        return [
            {
                "department_id": row.department_id,
                "department": row.department,
                "count": int(row.item_count),
            }
            for row in rows
        ]

    except Exception as e:
        print("ERRRR", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error in getting status count per department",
        )
