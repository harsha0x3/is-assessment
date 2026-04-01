from fastapi import HTTPException, status, BackgroundTasks
from sqlalchemy import select, and_, desc, asc, func, or_, case
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from models import (
    Application,
    ApplicationDepartments,
    Department,
    AppQuestionSet,
    DepartmentControl,
    ApplicationControlResult,
    User,
)
from schemas.app_schemas import (
    ApplicationCreate,
    ApplicationOut,
    ApplicationUpdate,
    NewAppListOut,
    AppQueryParams,
    AppStatuses,
    VerticalOut,
    AppsSummaryOut,
    EnvironmentCounts,
)
from schemas.department_schemas import DepartmentOut

from datetime import date, timedelta
from services.notifications.email_notify import send_new_app_mails_bg
from schemas.notification_schemas import NewAppData
import os
from dotenv import load_dotenv
from api.controllers.user_management_controller import get_user_departments

load_dotenv()

ENV = os.getenv("PROD_ENV")

is_dev = ENV and ENV.lower() == "false"

DEPARTMENT_RULES = {
    "iam": lambda app: app.scope == "is_assessment",
    "soc integration": lambda app: app.scope == "is_assessment",
    "security controls": lambda app: app.scope == "is_assessment",
    "web vapt": lambda app: app.scope == "is_assessment" or app.scope == "vapt_only",
    "tprm": lambda app: app.scope == "is_assessment",
    "mobile vapt": lambda app: (
        app.scope == "vapt_only" or app.app_type in ["mobile", "mobile_web"]
    ),
    "ai security": lambda app: app.is_app_ai,
    "privacy": lambda app: app.is_privacy_applicable,
}


def _resolve_departments(db: Session, app: Application):

    dept_names = []

    for dept, rule in DEPARTMENT_RULES.items():
        if rule(app):
            dept_names.append(dept)

    stmt = select(Department).where(func.lower(Department.name).in_(dept_names))

    return db.scalars(stmt).all()


def create_app(
    payload: ApplicationCreate,
    db: Session,
    creator: User,
    background_tasks: BackgroundTasks,
    owner: User | None = None,
) -> ApplicationOut:

    try:
        app = Application(
            **payload.model_dump(exclude={"priority"}),
            creator_id=creator.id,
            owner_id=owner.id if owner else None,
        )

        db.add(app)
        db.flush()

        # get all departments

        all_depts = _resolve_departments(db=db, app=app)

        # get question set
        app_questions_set = db.scalars(select(AppQuestionSet).limit(1)).first()
        app.question_set_id = app_questions_set.id if app_questions_set else None

        # prefetch all controls
        controls = db.scalars(select(DepartmentControl)).all()

        controls_by_dept = {}
        for c in controls:
            controls_by_dept.setdefault(c.department_id, []).append(c)

        app_departments = []
        app_controls = []

        for dept in all_depts:
            # create application department
            new_app_dept = ApplicationDepartments(
                application_id=app.id, department_id=dept.id, status="yet_to_connect"
            )

            app_departments.append(new_app_dept)

            # create control results
            dept_controls = controls_by_dept.get(dept.id, [])

            for c in dept_controls:
                app_controls.append(
                    ApplicationControlResult(
                        application_id=app.id,
                        department_control_id=c.id,
                        status="pending_review",
                    )
                )

        db.add_all(app_departments)
        db.add_all(app_controls)

        db.commit()
        db.refresh(app)

        if not is_dev:
            background_tasks.add_task(
                send_new_app_mails_bg,
                NewAppData(
                    app_name=app.name,
                    description=app.description,
                    vertical=app.vertical,
                    vendor_company=app.vendor_company,
                    sla=app.due_date,
                ),
                db,
            )

        return ApplicationOut.model_validate(app)

    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="App with the same name exists",
        )

    except Exception as e:
        print("APP CREATE ERR", e)
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create application: {str(e)}",
        )


def _has_filters(params: AppQueryParams) -> bool:
    return any(
        [
            params.dept_filter_id,
            params.app_priority,
            params.vertical and params.vertical != "null",
            params.search and params.search != "null",
            params.ai_apps is not None,
            params.mobile_apps is not None,
            params.web_apps is not None,
            params.mobile_web_apps is not None,
            params.privacy_apps is not None,
            params.app_age_from is not None and params.app_age_to is not None,
        ]
    )


def apply_scope_filter(stmt, scope: str | None):
    if not scope or scope == "all":
        return stmt

    if scope == "vapt_only":
        subq = (
            select(ApplicationDepartments.application_id)
            .join(Department)
            .where(func.lower(Department.name).in_(["web vapt", "mobile vapt"]))
        )

        return stmt.where(Application.id.in_(subq))

    elif scope == "is_assessment":
        return stmt.where(
            or_(Application.scope == "is_assessment", Application.scope.is_(None))
        )

    return stmt


def compute_app_statuses(db: Session, stmt) -> AppStatuses:
    normalized_status = func.replace(
        func.replace(func.lower(stmt.c.status), " ", "_"), "-", "_"
    )

    rows = db.execute(
        select(normalized_status.label("status"), func.count().label("status_count"))
        .select_from(stmt)
        .group_by(normalized_status)
    ).all()

    app_statuses = {row.status: int(row.status_count) for row in rows}

    return AppStatuses(
        in_progress=app_statuses.get("in_progress", 0),
        not_yet_started=app_statuses.get("not_yet_started", 0),
        closed=app_statuses.get("closed", 0),
        completed=app_statuses.get("completed", 0),
        new_request=app_statuses.get("new_request", 0),
        cancelled=app_statuses.get("cancelled", 0),
        reopen=app_statuses.get("reopen", 0),
        hold=app_statuses.get("hold", 0),
        go_live=app_statuses.get("go_live", 0),
    )


# --------------------------
# Helper: Compute environment counts
# --------------------------
def compute_environment_counts(db: Session, stmt) -> EnvironmentCounts:
    env_counts = db.execute(
        select(
            func.sum(case((stmt.c.environment.ilike(r"%internal%"), 1), else_=0)).label(
                "internal_count"
            ),
            func.sum(case((stmt.c.environment.ilike(r"%external%"), 1), else_=0)).label(
                "external_count"
            ),
        )
    ).first()

    return EnvironmentCounts(
        internal=env_counts.internal_count if env_counts else 0,
        external=env_counts.external_count if env_counts else 0,
    )


# --------------------------
# Helper: Compute app type & priority counts
# --------------------------
def compute_app_type_and_priority_counts(
    db: Session, stmt
) -> tuple[int, int, int, int, int, dict[int, int]]:
    # Priority counts
    priority_rows = db.execute(
        select(stmt.c.app_priority, func.count().label("cnt")).group_by(
            stmt.c.app_priority
        )
    ).all()
    priority_counts = {row.app_priority: row.cnt for row in priority_rows}

    # App type counts
    type_counts = db.execute(
        select(
            func.sum(case((stmt.c.app_type.in_(["mobile"]), 1), else_=0)).label(
                "mobile"
            ),
            func.sum(case((stmt.c.app_type.in_(["web"]), 1), else_=0)).label("web"),
            func.sum(case((stmt.c.app_type.in_(["mobile_web"]), 1), else_=0)).label(
                "mobile_web"
            ),
            func.sum(case((stmt.c.is_app_ai == True, 1), else_=0)).label("ai"),
            func.sum(case((stmt.c.is_privacy_applicable == True, 1), else_=0)).label(
                "privacy"
            ),
        )
    ).first()

    if not type_counts:
        return 0, 0, 0, 0, 0, priority_counts

    return (
        type_counts.mobile or 0,
        type_counts.web or 0,
        type_counts.mobile_web or 0,
        type_counts.ai or 0,
        type_counts.privacy or 0,
        priority_counts,
    )


# --------------------------
# Main: Build apps summary
# --------------------------
def build_apps_summary(db: Session, stmt) -> AppsSummaryOut:
    total_apps = db.scalar(select(func.count()).select_from(stmt))
    app_statuses = compute_app_statuses(db, stmt)
    internal_env, external_env = (
        compute_environment_counts(db, stmt).internal,
        compute_environment_counts(db, stmt).external,
    )
    (
        mobile_count,
        web_count,
        mobile_web_count,
        ai_count,
        privacy_count,
        priority_counts,
    ) = compute_app_type_and_priority_counts(db, stmt)

    return AppsSummaryOut(
        total_apps=total_apps or 0,
        app_statuses=app_statuses,
        priority_counts=priority_counts,
        ai_app_count=ai_count,
        privacy_app_count=privacy_count,
        mobile_app_count=mobile_count,
        web_app_count=web_count,
        mobile_web_app_count=mobile_web_count,
        internal_environment_count=internal_env,
        external_environment_count=external_env,
    )


def apply_filters(stmt, params: AppQueryParams, current_user: User, db: Session):
    """
    Apply filtering based on user role, department, verticals, status, type, priority, and search params.
    Returns a SQLAlchemy statement ready for execution.
    """
    # --------------------------
    # User role based filters
    # --------------------------
    user_depts = get_user_departments(db=db, user_id=current_user.id)

    if current_user.role != "user":
        if len(user_depts) == 1 and 9 in user_depts:
            stmt = stmt.where(Application.is_privacy_applicable)

    if current_user.role not in ["admin", "manager", "moderator", "user"]:
        vertical_ids = [v.id for v in current_user.verticals]
        stmt = stmt.where(Application.vertical_id.in_(vertical_ids))

    # --------------------------
    # Scope filter (custom)
    # --------------------------
    stmt = apply_scope_filter(stmt=stmt, scope=params.scope)

    # --------------------------
    # Department filters
    # --------------------------
    if params.dept_filter_id and params.dept_status:
        stmt = stmt.join(
            ApplicationDepartments,
            ApplicationDepartments.application_id == Application.id,
        ).where(
            and_(
                ApplicationDepartments.department_id == params.dept_filter_id,
                ApplicationDepartments.status.in_(params.dept_status),
                ApplicationDepartments.is_active,
            )
        )

    # --------------------------
    # Priority filter
    # --------------------------
    if params.app_priority:
        stmt = stmt.where(Application.app_priority.in_(params.app_priority))

    # --------------------------
    # Vertical filters
    # --------------------------
    if params.vertical and params.vertical != "null" and params.vertical.strip():
        stmt = stmt.where(Application.vertical.ilike(f"%{params.vertical}%"))

    if params.vertical_ids:
        stmt = stmt.where(Application.vertical_id.in_(params.vertical_ids))

    # --------------------------
    # Environment Filters
    # --------------------------

    if params.environment:
        stmt = stmt.where(Application.environment.ilike(f"%{params.environment}%"))

    # --------------------------
    # Status & Severity
    # --------------------------
    if params.status:
        stmt = stmt.where(Application.status.in_(params.status))

    if params.severity:
        stmt = stmt.where(Application.severity.in_(params.severity))

    # --------------------------
    # Application age
    # --------------------------
    if params.app_age_from:
        stmt = stmt.where(Application.started_at.is_not(None))
        stmt = stmt.where(Application.started_at >= params.app_age_from)
        if params.app_age_to:
            stmt = stmt.where(Application.started_at <= params.app_age_to)

    # --------------------------
    # App type filters
    # --------------------------
    if params.app_type:
        type_conditions = []
        if "web" in params.app_type:
            type_conditions.append(Application.app_type.in_(["web", "mobile_web"]))
        if "mobile" in params.app_type:
            type_conditions.append(Application.app_type.in_(["mobile", "mobile_web"]))
        if "api" in params.app_type:
            type_conditions.append(Application.app_type.in_(["api"]))
        if "automation" in params.app_type:
            type_conditions.append(Application.app_type.in_(["automation"]))
        if "mobile_web" in params.app_type:
            type_conditions.append(Application.app_type.in_(["mobile_web"]))

        if type_conditions:
            stmt = stmt.where(or_(*type_conditions))

    # --------------------------
    # Feature filters
    # --------------------------
    if params.app_features:
        for feature in params.app_features:
            if feature == "ai":
                stmt = stmt.where(Application.is_app_ai)
            elif feature == "privacy":
                stmt = stmt.where(Application.is_privacy_applicable)

    # --------------------------
    # Search filters
    # --------------------------
    if params.search and params.search != "null":
        search_value = f"%{params.search}%"
        search_column = (
            getattr(Application, params.search_by, None) if params.search_by else None
        )

        if params.search_by == "ticket_id":
            stmt = stmt.where(Application.imitra_ticket_id.ilike(search_value))
        elif search_column is not None:
            stmt = stmt.where(search_column.ilike(search_value))
        else:
            stmt = stmt.where(
                or_(
                    Application.name.ilike(search_value),
                    Application.vendor_company.ilike(search_value),
                    Application.owner_name.ilike(search_value),
                    Application.imitra_ticket_id.ilike(search_value),
                )
            )

    return stmt


def compute_apps_summary(db: Session, stmt) -> AppsSummaryOut:
    normalized_status = func.replace(
        func.replace(func.lower(stmt.c.status), " ", "_"), "-", "_"
    )

    agg_row = db.execute(
        select(
            # Total
            func.count().label("total_apps"),
            # Status counts
            func.sum(case((normalized_status == "in_progress", 1), else_=0)).label(
                "in_progress"
            ),
            func.sum(case((normalized_status == "not_yet_started", 1), else_=0)).label(
                "not_yet_started"
            ),
            func.sum(case((normalized_status == "closed", 1), else_=0)).label("closed"),
            func.sum(case((normalized_status == "completed", 1), else_=0)).label(
                "completed"
            ),
            func.sum(case((normalized_status == "new_request", 1), else_=0)).label(
                "new_request"
            ),
            func.sum(case((normalized_status == "cancelled", 1), else_=0)).label(
                "cancelled"
            ),
            func.sum(case((normalized_status == "reopen", 1), else_=0)).label("reopen"),
            func.sum(case((normalized_status == "hold", 1), else_=0)).label("hold"),
            func.sum(case((normalized_status == "go_live", 1), else_=0)).label(
                "go_live"
            ),
            # Environment
            func.sum(case((stmt.c.environment.ilike("%internal%"), 1), else_=0)).label(
                "internal"
            ),
            func.sum(case((stmt.c.environment.ilike("%external%"), 1), else_=0)).label(
                "external"
            ),
            # App types
            func.sum(case((stmt.c.app_type == "mobile", 1), else_=0)).label("mobile"),
            func.sum(case((stmt.c.app_type == "web", 1), else_=0)).label("web"),
            func.sum(case((stmt.c.app_type == "mobile_web", 1), else_=0)).label(
                "mobile_web"
            ),
            # Features
            func.sum(case((stmt.c.is_app_ai == True, 1), else_=0)).label("ai"),
            func.sum(case((stmt.c.is_privacy_applicable == True, 1), else_=0)).label(
                "privacy"
            ),
        ).select_from(stmt)
    ).first()

    # Priority counts (separate query)
    priority_rows = db.execute(
        select(stmt.c.app_priority, func.count())
        .select_from(stmt)
        .group_by(stmt.c.app_priority)
    ).all()

    priority_counts = {row[0]: row[1] for row in priority_rows}

    return AppsSummaryOut(
        total_apps=agg_row.total_apps if agg_row else 0 or 0,
        app_statuses=AppStatuses(
            in_progress=agg_row.in_progress if agg_row else 0 or 0,
            not_yet_started=agg_row.not_yet_started if agg_row else 0 or 0,
            closed=agg_row.closed if agg_row else 0 or 0,
            completed=agg_row.completed if agg_row else 0 or 0,
            new_request=agg_row.new_request if agg_row else 0 or 0,
            cancelled=agg_row.cancelled if agg_row else 0 or 0,
            reopen=agg_row.reopen if agg_row else 0 or 0,
            hold=agg_row.hold if agg_row else 0 or 0,
            go_live=agg_row.go_live if agg_row else 0 or 0,
        ),
        priority_counts=priority_counts,
        ai_app_count=agg_row.ai if agg_row else 0 or 0,
        privacy_app_count=agg_row.privacy if agg_row else 0 or 0,
        mobile_app_count=agg_row.mobile if agg_row else 0 or 0,
        web_app_count=agg_row.web if agg_row else 0 or 0,
        mobile_web_app_count=agg_row.mobile_web if agg_row else 0 or 0,
        internal_environment_count=agg_row.internal if agg_row else 0 or 0,
        external_environment_count=agg_row.external if agg_row else 0 or 0,
    )


# --------------------------
# Example usage in list_all_apps
# --------------------------
def list_all_apps(db: Session, params: AppQueryParams, current_user: User):
    try:
        # Build base query
        stmt = (
            select(Application)
            .where(Application.is_active)
            .options(joinedload(Application.departments))
        )
        apps_summary = build_apps_summary(db=db, stmt=stmt.subquery())

        # Apply filters (role, vertical, priority, type, search, etc.)
        stmt = apply_filters(stmt, params, current_user, db=db)

        filtered_subquery = stmt.subquery()

        filtered_summary = build_apps_summary(db=db, stmt=filtered_subquery)

        # Build summary

        # Pagination & fetch applications
        sort_column = getattr(Application, params.sort_by)
        sort_column = (
            desc(sort_column) if params.sort_order == "desc" else asc(sort_column)
        )

        apps = (
            db.execute(
                stmt.order_by(sort_column)
                .limit(params.page_size)
                .offset(params.page * params.page_size - params.page_size)
            )
            .scalars()
            .unique()
            .all()
        )

        apps_out = [
            NewAppListOut.from_application(
                app, db, dept_filter_id=params.dept_filter_id
            )
            for app in apps
        ]

        return {
            "apps": apps_out,
            "apps_summary": apps_summary,
            "filtered_apps_summary": filtered_summary,
        }

    except Exception as e:
        print("Error listing apps:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching applications.",
        )


# def dept_wise_list_apps(db: Session, params: )


def update_app(
    payload: ApplicationUpdate, app_id: str, db: Session, current_user: User
):
    from datetime import datetime, timezone

    try:
        app = db.scalar(select(Application).where(Application.id == app_id))
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"App not found {app_id}"
            )
        if not app.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"App is in trash {app_id}",
            )

        prev_status = app.status

        print("Payload to update app", payload.model_dump())

        for key, val in payload.model_dump(
            exclude_unset=True, exclude={"priority", "app_vertical", "departments"}
        ).items():
            print(f"key - {key} || val - {val}")
            if key == "started_at" and val:
                app.started_at = datetime.now(timezone.utc).replace(
                    year=val.year,
                    month=val.month,
                    day=val.day,
                )

            elif key == "completed_at" and val:
                app.completed_at = datetime.now(timezone.utc).replace(
                    year=val.year,
                    month=val.month,
                    day=val.day,
                )

            elif key == "due_date" and val:
                app.due_date = datetime.now(timezone.utc).replace(
                    year=val.year,
                    month=val.month,
                    day=val.day,
                )

            else:
                setattr(app, key, val)

        if app.status != prev_status and app.status in [
            "completed",
            "go_live",
            "closed",
        ]:
            app.completed_at = datetime.now(timezone.utc)

        db.flush()

        if app.is_app_ai:
            ai_dept = db.scalar(
                select(Department).where(func.lower(Department.name) == "ai security")
            )
            if not ai_dept:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="AI is applicable but ai department is not found to assign",
                )

            app_dept = db.scalar(
                select(ApplicationDepartments).where(
                    and_(
                        ApplicationDepartments.application_id == app_id,
                        ApplicationDepartments.department_id == ai_dept.id,
                    )
                )
            )

            if not app_dept:
                new_dept = ApplicationDepartments(
                    application_id=app_id, department_id=ai_dept.id
                )
                db.add(new_dept)
                db.flush()

            if app_dept is not None and not app_dept.is_active:
                app_dept.is_active = True

        else:
            ai_dept = db.scalar(
                select(Department).where(func.lower(Department.name) == "ai security")
            )
            if not ai_dept:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="AI is applicable but ai department is not found to assign",
                )

            app_dept = db.scalar(
                select(ApplicationDepartments).where(
                    and_(
                        ApplicationDepartments.application_id == app_id,
                        ApplicationDepartments.department_id == ai_dept.id,
                    )
                )
            )

            if not app_dept:
                pass
            if app_dept is not None and app_dept.is_active:
                app_dept.is_active = False

        if app.is_privacy_applicable:
            privacy_dept = db.scalar(
                select(Department).where(func.lower(Department.name) == "privacy")
            )
            if not privacy_dept:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Privacy is applicable but Privacy department is not found to assign",
                )

            app_dept = db.scalar(
                select(ApplicationDepartments).where(
                    and_(
                        ApplicationDepartments.application_id == app_id,
                        ApplicationDepartments.department_id == privacy_dept.id,
                    )
                )
            )

            if not app_dept:
                new_dept = ApplicationDepartments(
                    application_id=app_id, department_id=privacy_dept.id
                )
                db.add(new_dept)
                db.flush()

            if app_dept is not None and not app_dept.is_active:
                app_dept.is_active = True

        else:
            privacy_dept = db.scalar(
                select(Department).where(func.lower(Department.name) == "privacy")
            )
            if not privacy_dept:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="AI is applicable but ai department is not found to assign",
                )

            app_dept = db.scalar(
                select(ApplicationDepartments).where(
                    and_(
                        ApplicationDepartments.application_id == app_id,
                        ApplicationDepartments.department_id == privacy_dept.id,
                    )
                )
            )

            if not app_dept:
                pass
            if app_dept is not None and app_dept.is_active:
                app_dept.is_active = False

        if app.app_type and "mobile" in app.app_type:
            mobile_vapt_dept = db.scalar(
                select(Department).where(func.lower(Department.name) == "mobile vapt")
            )
            if not mobile_vapt_dept:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Privacy is applicable but Privacy department is not found to assign",
                )

            app_dept = db.scalar(
                select(ApplicationDepartments).where(
                    and_(
                        ApplicationDepartments.application_id == app_id,
                        ApplicationDepartments.department_id == mobile_vapt_dept.id,
                    )
                )
            )

            if not app_dept:
                new_dept = ApplicationDepartments(
                    application_id=app_id, department_id=mobile_vapt_dept.id
                )
                db.add(new_dept)
                db.flush()

            if app_dept is not None and not app_dept.is_active:
                app_dept.is_active = True

        else:
            mobile_vapt_dept = db.scalar(
                select(Department).where(func.lower(Department.name) == "mobile vapt")
            )
            if not mobile_vapt_dept:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="AI is applicable but ai department is not found to assign",
                )

            app_dept = db.scalar(
                select(ApplicationDepartments).where(
                    and_(
                        ApplicationDepartments.application_id == app_id,
                        ApplicationDepartments.department_id == mobile_vapt_dept.id,
                    )
                )
            )

            if not app_dept:
                pass
            if app_dept is not None and app_dept.is_active:
                app_dept.is_active = False

        db.commit()
        db.refresh(app)

        return ApplicationOut.model_validate(app)

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update the app {str(e)}",
        )


def get_app_details(app_id: str, db: Session, current_user: User):
    try:
        app = db.scalar(
            select(Application).where(Application.id == app_id, Application.is_active)
        )
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"App not found {app_id}"
            )

        if current_user.role in ["digital_head"]:
            user_verticals = [v.id for v in current_user.verticals]
            if app.vertical_id not in user_verticals:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Unauthorized to access this application",
                )

        rows = db.execute(
            select(Department, ApplicationDepartments.status)
            .join(
                ApplicationDepartments,
                ApplicationDepartments.department_id == Department.id,
            )
            .where(
                and_(
                    ApplicationDepartments.application_id == app_id,
                    ApplicationDepartments.is_active,
                )
            )
        ).all()

        result = ApplicationOut(
            id=app.id,
            name=app.name,
            description=app.description,
            environment=app.environment,
            region=app.region,
            owner_name=app.owner_name,
            vendor_company=app.vendor_company,
            infra_host=app.infra_host,
            app_tech=app.app_tech,
            vertical=app.vertical,
            is_active=app.is_active,
            is_completed=app.is_completed,
            created_at=app.created_at,
            updated_at=app.updated_at,
            owner_id=app.owner_id,
            status=app.status,
            imitra_ticket_id=app.imitra_ticket_id,
            titan_spoc=app.titan_spoc,
            due_date=app.due_date,
            app_priority=app.app_priority,
            started_at=app.started_at,
            completed_at=app.completed_at,
            app_url=app.app_url,
            user_type=app.user_type,
            data_type=app.data_type,
            app_type=app.app_type,
            is_app_ai=app.is_app_ai,
            is_privacy_applicable=app.is_privacy_applicable,
            requested_date=app.requested_date,
            severity=app.severity,
            vertical_id=app.vertical_id,
            app_vertical=VerticalOut.model_validate(app.app_vertical)
            if app.app_vertical
            else None,
            departments=[
                DepartmentOut(
                    id=row[0].id,
                    name=row[0].name,
                    description=row[0].description,
                    status=row[1],
                )
                for row in rows
            ],
            scope=app.scope,
        )
        return result

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch the app details {str(e)}",
        )


def change_app_status(app_id: str, status_val: str, db: Session):
    try:
        app = db.get(Application, app_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Application not found"
            )
        if not app.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Application is deleted"
            )
        app.status = status_val
        if status_val.lower == "completed":
            app.is_completed = True
        else:
            app.is_completed = False
        db.commit()
        return {"msg": "Status changed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating application status",
        )
