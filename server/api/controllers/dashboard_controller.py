from collections import defaultdict
from datetime import date, timedelta

from fastapi import HTTPException, status
from sqlalchemy import and_, case, func, select
from sqlalchemy.orm import Session

from api.constants.priorities import PRIORITY_ID_TO_KEY
from api.constants.statuses import ALL_APP_STATUSES, ALL_DEPT_STATUSES
from models import Application, ApplicationDepartments, Department
from schemas import dashboard_schemas as ds


# ---------- helpers ----------


def normalize_key(value: str) -> str:
    return value.lower().replace(" ", "_").replace("-", "_")


def humanize(value: str) -> str:
    return value.replace("_", " ").title()


def _apply_scope_filter(stmt, scope: str | None):
    if not scope or scope == "all":
        return stmt

    if scope == "vapt_only":
        stmt = (
            stmt.join(
                ApplicationDepartments,
                ApplicationDepartments.application_id == Application.id,
            )
            .join(
                Department,
                Department.id == ApplicationDepartments.department_id,
            )
            .where(
                and_(
                    func.lower(Department.name).in_(["web vapt", "mobile vapt"]),
                    ApplicationDepartments.is_active,
                )
            )
        )

    elif scope == "is_assessment":
        stmt = stmt.where(Application.scope == "is_assessment")

    return stmt


# ---------- Application status summary ----------


def get_app_status_summary(
    db: Session, params: ds.AppSummaryQueryParams | None
) -> ds.ApplicationSummary:
    try:
        stmt = (
            select(
                Application.status.label("status"),
                func.count(func.distinct(Application.id)).label("status_count"),
            )
            .where(Application.is_active)
            .group_by(Application.status)
        )

        scope = params.scope if params else None

        stmt = _apply_scope_filter(stmt=stmt, scope=scope)

        count_stmt = select(func.count(Application.id)).where(Application.is_active)

        if params:
            if params.severity is not None and len(params.severity) > 0:
                stmt = stmt.where(Application.severity.in_(params.severity))
                count_stmt = count_stmt.where(Application.severity.in_(params.severity))

            if params.priority is not None and len(params.priority) > 0:
                stmt = stmt.where(Application.app_priority.in_(params.priority))
                count_stmt = count_stmt.where(
                    Application.app_priority.in_(params.priority)
                )

            if params.app_age_from and params.app_age_to:
                stmt = stmt.where(
                    and_(
                        Application.started_at.is_not(None),
                        Application.started_at >= params.app_age_from,
                    )
                )
                count_stmt = count_stmt.where(
                    and_(
                        Application.started_at.is_not(None),
                        Application.started_at >= params.app_age_from,
                    )
                )
                if params.app_age_to:
                    stmt = stmt.where(Application.started_at <= params.app_age_to)
                    count_stmt = count_stmt.where(
                        Application.started_at <= params.app_age_to
                    )

        rows = db.execute(stmt).all()

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

        filtered_apps = db.scalar(count_stmt) or 0

        return ds.ApplicationSummary(
            total_apps=total_apps,
            status_chart=status_chart,
            filtered_apps=filtered_apps,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching application status statistics",
        )


def get_department_status_summary(
    db: Session, params: ds.DeptSummaryQueryParams
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
            .where(ApplicationDepartments.is_active)
            .group_by(
                Department.id,
                Department.name,
                ApplicationDepartments.status,
            )
        )

        total_apps_stmt = select(func.count(Application.id)).where(
            Application.is_active
        )

        if (
            params.status
            or params.app_age_from
            or params.app_age_to
            or params.severity
            or params.priority
        ):
            stmt = stmt.join(
                Application,
                Application.id == ApplicationDepartments.application_id,
            )

        if params.status and params.status != "all":
            stmt = stmt.where(Application.status == params.status)
            total_apps_stmt = total_apps_stmt.where(Application.status == params.status)

        if params.severity is not None and len(params.severity) > 0:
            stmt = stmt.where(Application.severity.in_(params.severity))
            total_apps_stmt = total_apps_stmt.where(
                Application.severity.in_(params.severity)
            )

        if params.priority is not None and len(params.priority) > 0:
            stmt = stmt.where(Application.app_priority.in_(params.priority))
            total_apps_stmt = total_apps_stmt.where(
                Application.app_priority.in_(params.priority)
            )

        if params.app_age_from:
            stmt = stmt.where(Application.started_at.is_not(None))

            stmt = stmt.where(and_(Application.started_at >= params.app_age_from))
            total_apps_stmt = total_apps_stmt.where(
                and_(Application.started_at >= params.app_age_from)
            )

            if params.app_age_to:
                stmt = stmt.where(Application.started_at <= params.app_age_to)
                total_apps_stmt = total_apps_stmt.where(
                    Application.started_at <= params.app_age_to
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
                    total_apps=sum(data["statuses"].values()),
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


def get_vertical_wise_app_statuses(db: Session, params: ds.VerticalWiseSummaryParams):
    try:
        stmt = (
            select(
                Application.vertical.label("vertical"),
                Application.status.label("status"),
                func.count().label("status_count"),
            )
            .group_by(Application.vertical, Application.status)
            .where(Application.is_active)
        )

        stmt = _apply_scope_filter(stmt=stmt, scope=params.scope)
        rows = db.execute(stmt)

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
                ApplicationDepartments.is_active,
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


def get_statuses_per_dept(db: Session, params: ds.StatusPerDepartmentParams):
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
                and_(
                    Application.status == params.app_status,
                    ApplicationDepartments.status == params.dept_status,
                    ApplicationDepartments.is_active,
                )
            )
            .group_by(Department.id, Department.name)
        )

        if params:
            print("Params exist")

            if params.severity is not None and len(params.severity) > 0:
                print("Params exist")

                stmt = stmt.where(Application.severity.in_(params.severity))

            if params.priority is not None and len(params.priority) > 0:
                stmt = stmt.where(Application.app_priority.in_(params.priority))

            if params.app_age_from:
                stmt = stmt.where(Application.started_at.is_not(None))

                stmt = stmt.where(and_(Application.started_at >= params.app_age_from))

                if params.app_age_to:
                    stmt = stmt.where(Application.started_at <= params.app_age_to)

            # today = date.today()

            # if params.sla_filter and params.sla_filter > 0:
            #     stmt = stmt.where(Application.started_at.is_not(None))

            #     if params.sla_filter == 30:
            #         stmt = stmt.where(
            #             func.date(Application.started_at) >= today - timedelta(days=30)
            #         )
            #     elif params.sla_filter == 60:
            #         stmt = stmt.where(
            #             func.date(Application.started_at).between(
            #                 today - timedelta(days=60),
            #                 today - timedelta(days=30),
            #             )
            #         )
            #     elif params.sla_filter == 90:
            #         stmt = stmt.where(
            #             func.date(Application.started_at).between(
            #                 today - timedelta(days=90),
            #                 today - timedelta(days=60),
            #             )
            #         )
            #     elif params.sla_filter == 91:
            #         stmt = stmt.where(
            #             func.date(Application.started_at) < today - timedelta(days=90)
            #         )

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


def get_app_types_summary(db: Session, params: ds.AppTypeSummaryParams):
    stmt = select(
        Application.app_type,
        func.count(Application.id).label("total_count"),
        func.sum(case((Application.is_app_ai == True, 1), else_=0)).label("ai_count"),
        func.sum(case((Application.is_privacy_applicable == True, 1), else_=0)).label(
            "privacy_count"
        ),
    ).group_by(Application.app_type)

    if params:
        print("Params exist")

        if params.severity is not None and len(params.severity) > 0:
            print("Params exist")

            stmt = stmt.where(Application.severity.in_(params.severity))

        if params.priority is not None and len(params.priority) > 0:
            stmt = stmt.where(Application.app_priority.in_(params.priority))

        if params.app_age_from:
            stmt = stmt.where(Application.started_at.is_not(None))

            stmt = stmt.where(and_(Application.started_at >= params.app_age_from))

            if params.app_age_to:
                stmt = stmt.where(Application.started_at <= params.app_age_to)

        if params.app_status and params.app_status != "all":
            stmt = stmt.where(Application.status == params.app_status)

    result = db.execute(stmt).all()

    transformed: list[ds.AppTypeSummaryItem] = []

    for app_type, total, ai, privacy in result:
        # Replace None with 'Unknown' for frontend display
        app_type_name = app_type or "Unknown"
        other = total - (ai or 0) - (privacy or 0)
        transformed.append(
            ds.AppTypeSummaryItem(
                app_type=app_type_name, total=total, ai=ai, privacy=privacy, other=other
            )
        )

    return transformed


def get_vapt_summary(db: Session) -> ds.VAPTSummary:
    try:
        app_type_case = case(
            (
                Application.app_type.in_(["web", "mobile", "mobile_web"]),
                Application.app_type,
            ),
            else_="others",
        ).label("app_type_cat")

        stmt = (
            select(
                app_type_case,
                Application.status.label("status"),
                func.count(func.distinct(Application.id)).label("status_count"),
            )
            .join(
                ApplicationDepartments,
                ApplicationDepartments.application_id == Application.id,
            )
            .join(
                Department,
                Department.id == ApplicationDepartments.department_id,
            )
            .where(
                and_(
                    Application.is_active,
                    func.lower(Department.name).in_(["web vapt", "mobile vapt"]),
                    ApplicationDepartments.is_active,
                )
            )
            .group_by(app_type_case, Application.status)
        )

        rows = db.execute(stmt).all()

        grouped: dict[str, dict] = defaultdict(lambda: {"total": 0, "statuses": []})

        for row in rows:
            app_type_cat = row.app_type_cat
            status_ = row.status
            count = row.status_count

            grouped[app_type_cat]["statuses"].append(
                ds.StatusCountItem(status=status_, count=count)
            )
            grouped[app_type_cat]["total"] += count

        data: list[ds.VAPTSummaryItem] = []

        for app_type_cat, info in grouped.items():
            data.append(
                ds.VAPTSummaryItem(
                    statuses=info["statuses"],
                    total_apps=info["total"],
                    filtered_apps=info["total"],  # same as total since no filters
                    app_type=app_type_cat,
                )
            )

        return ds.VAPTSummary(data=data)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching VAPT summary",
        )


def get_vapt_summary_per_status(db: Session):
    try:
        stmt = (
            select(
                Application.status.label("status"),
                Application.app_type.label("app_type"),
                func.count(func.distinct(Application.id)).label("status_count"),
            )
            .select_from(Application)
            .join(
                ApplicationDepartments,
                ApplicationDepartments.application_id == Application.id,
            )
            .join(
                Department,
                Department.id == ApplicationDepartments.department_id,
            )
            .where(
                and_(
                    Application.is_active,
                    func.lower(Department.name).in_(["web vapt", "mobile vapt"]),
                    ApplicationDepartments.is_active,
                )
            )
            .group_by(Application.status, Application.app_type)
        )

        rows = db.execute(stmt).all()

        # ---------- Transform ----------
        grouped: dict[str, dict] = defaultdict(lambda: defaultdict(int))

        for row in rows:
            status_ = normalize_key(row.status)
            app_type = normalize_key(row.app_type or "unknown")
            count = int(row.status_count or 0)

            grouped[status_][app_type] += count

        result = []

        for status_ in ALL_APP_STATUSES:
            status_key = normalize_key(status_)

            item = {"status": status_key}

            # fill whatever app types exist
            for app_type, count in grouped.get(status_key, {}).items():
                item[app_type] = count

            result.append(item)

        return result

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching VAPT summary",
        )


def get_application_completion_stats(
    db: Session,
) -> list[ds.ApplicationCompletionStats]:
    try:
        days_diff = func.datediff(func.now(), Application.completed_at)

        bucket_case = case(
            (
                and_(Application.completed_at.is_not(None), days_diff <= 30),
                "0-30 days",
            ),
            (
                and_(
                    Application.completed_at.is_not(None),
                    days_diff > 30,
                    days_diff <= 60,
                ),
                "31-60 days",
            ),
            (
                and_(
                    Application.completed_at.is_not(None),
                    days_diff > 60,
                    days_diff <= 90,
                ),
                "61-90 days",
            ),
            else_="90+ days",
        )

        results = (
            db.query(bucket_case.label("bucket"), func.count(Application.id))
            .where(and_(Application.is_active, Application.status == "completed"))
            .group_by(bucket_case)
            .all()
        )

        return [ds.ApplicationCompletionStats(bucket=r[0], count=r[1]) for r in results]

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching application completion statistics",
        )
