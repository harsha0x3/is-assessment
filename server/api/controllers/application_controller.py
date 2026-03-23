from fastapi import HTTPException, status, BackgroundTasks
from sqlalchemy import select, and_, desc, asc, func, or_
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from models import (
    Application,
    ApplicationDepartments,
    Department,
    AppQuestionSet,
    DepartmentControl,
    ApplicationControlResult,
)
from schemas.app_schemas import (
    ApplicationCreate,
    ApplicationOut,
    ApplicationUpdate,
    NewAppListOut,
    AppQueryParams,
    AppStatuses,
)
from schemas.department_schemas import DepartmentOut
from .comments_controller import get_latest_app_dept_comment
from schemas.auth_schemas import UserOut
from .department_controller import get_departments_by_application
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
    creator: UserOut,
    background_tasks: BackgroundTasks,
    owner: UserOut | None = None,
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

        # if not is_dev:
        #     background_tasks.add_task(
        #         send_new_app_mails_bg,
        #         NewAppData(
        #             app_name=app.name,
        #             description=app.description,
        #             vertical=app.vertical,
        #             vendor_company=app.vendor_company,
        #             sla=app.due_date,
        #         ),
        #         db,
        #     )

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


def get_apps_summary(db: Session):
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

        result = AppStatuses(
            in_progress=app_statuses.get("in_progress") or 0,
            not_yet_started=app_statuses.get("not_yet_started") or 0,
            closed=app_statuses.get("closed") or 0,
            new_request=app_statuses.get("new_request") or 0,
            cancelled=app_statuses.get("cancelled") or 0,
            completed=app_statuses.get("completed") or 0,
            reopen=app_statuses.get("reopen") or 0,
        )

        print("Results:", result)

        return result
    except Exception as e:
        print("rror Fetching overall statistics", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error Fetching overall statistics.",
        )


def get_apps_summary_from_stmt(db: Session, stmt):
    try:
        normalized_status = func.replace(
            func.replace(func.lower(stmt.c.status), " ", "_"),
            "-",
            "_",
        )

        rows = db.execute(
            select(
                normalized_status.label("status"),
                func.count().label("status_count"),
            )
            .select_from(stmt)
            .group_by(normalized_status)
        ).all()

        app_statuses = {row.status: int(row.status_count) for row in rows}

        return AppStatuses(
            in_progress=app_statuses.get("in_progress", 0),
            not_yet_started=app_statuses.get("not_yet_started", 0),
            closed=app_statuses.get("closed", 0),
            new_request=app_statuses.get("new_request", 0),
            cancelled=app_statuses.get("cancelled", 0),
            completed=app_statuses.get("completed", 0),
            reopen=app_statuses.get("reopen", 0),
        )

    except Exception as e:
        print("Error fetching filtered summary", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching filtered app summary.",
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


def list_all_apps(db: Session, params: AppQueryParams, current_user: UserOut):
    try:
        user_depts = get_user_departments(db=db, user_id=current_user.id)

        stmt = (
            select(Application)
            .distinct()
            .where(Application.is_active)
            .options(joinedload(Application.departments))
        )

        if current_user.role != "user":
            if len(user_depts) == 1 and 9 in user_depts:
                stmt = stmt.where(Application.is_privacy_applicable)

        stmt = apply_scope_filter(stmt=stmt, scope=params.scope)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_count = db.scalar(count_stmt)
        apps_summary = get_apps_summary(db=db)

        sort_column = getattr(Application, params.sort_by)

        latest_comment = None

        if params.dept_filter_id and params.dept_status and len(params.dept_status) > 0:
            stmt = stmt.join(
                ApplicationDepartments,
                ApplicationDepartments.application_id == Application.id,
            ).where(
                and_(
                    ApplicationDepartments.department_id == params.dept_filter_id,
                    ApplicationDepartments.status.in_(params.dept_status),
                )
            )

        if params.app_priority and len(params.app_priority) > 0:
            stmt = stmt.where(Application.app_priority.in_(params.app_priority))

        if (
            params.vertical
            and params.vertical != "null"
            and params.vertical.strip() != ""
        ):
            stmt = stmt.where(Application.vertical.ilike(f"%{params.vertical}%"))

        if params.status and len(params.status) > 0:
            stmt = stmt.where(Application.status.in_(params.status))

        if params.severity and len(params.severity) > 0:
            stmt = stmt.where(Application.severity.in_(params.severity))

        if params.app_age_from:
            stmt = stmt.where(Application.started_at.is_not(None))

            stmt = stmt.where(and_(Application.started_at >= params.app_age_from))

            if params.app_age_to:
                stmt = stmt.where(Application.started_at <= params.app_age_to)

            # Always ignore rows with NULL started_at
            stmt = stmt.where(Application.started_at.is_not(None))

        if params.app_type:
            app_type_conditions = []

            if "web" in params.app_type:
                app_type_conditions.append(
                    Application.app_type.in_(["web", "mobile_web"])
                )

            if "mobile" in params.app_type:
                app_type_conditions.append(
                    Application.app_type.in_(["mobile", "mobile_web"])
                )

            if "api" in params.app_type:
                app_type_conditions.append(Application.app_type.in_(["api"]))

            if "automation" in params.app_type:
                app_type_conditions.append(Application.app_type.in_(["automation"]))

            if "mobile_web" in params.app_type:
                app_type_conditions.append(Application.app_type.in_(["mobile_web"]))

            stmt = stmt.where(or_(*app_type_conditions))

        if params.app_features:
            for feature in params.app_features:
                if feature == "ai":
                    stmt = stmt.where(Application.is_app_ai)

                elif feature == "privacy":
                    stmt = stmt.where(Application.is_privacy_applicable)

        # ✅ SEARCH FILTER
        if params.search and params.search != "null" and params.search_by:
            search_value = f"%{params.search}%"
            search_column = getattr(Application, params.search_by, None)

            if params.search_by == "ticket_id":
                stmt = stmt.where(
                    or_(
                        Application.imitra_ticket_id.ilike(search_value),
                    )
                )
            elif search_column is not None:
                stmt = stmt.where(search_column.ilike(search_value))

        filtered_subquery = stmt.subquery()
        filtered_count = db.scalar(select(func.count()).select_from(filtered_subquery))

        filtered_apps_summary = get_apps_summary_from_stmt(
            db=db, stmt=filtered_subquery
        )

        # -------- pagination ans sorting ---------

        if params.sort_order == "desc":
            sort_column = desc(sort_column)
        else:
            sort_column = asc(sort_column)

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

        apps_out: list[NewAppListOut] = []
        for app in apps:
            if params.dept_filter_id:
                latest_comment = get_latest_app_dept_comment(
                    app_id=app.id, dept_id=params.dept_filter_id, db=db
                )
            depts_out = get_departments_by_application(app_id=app.id, db=db)
            data = NewAppListOut(
                id=app.id,
                name=app.name,
                description=app.description,
                vertical=app.vertical,
                imitra_ticket_id=app.imitra_ticket_id,
                status=app.status,
                app_priority=app.app_priority,
                started_at=app.started_at,
                completed_at=app.completed_at,
                departments=depts_out,
                vendor_company=app.vendor_company,
                latest_comment=latest_comment,
                due_date=app.due_date,
                titan_spoc=app.titan_spoc,
                environment=app.environment,
                severity=app.severity,
                is_app_ai=app.is_app_ai,
                is_privacy_applicable=app.is_privacy_applicable,
                app_type=app.app_type,
                app_url=app.app_url,
            )
            apps_out.append(data)

        return {
            "apps": apps_out,
            "total_count": total_count,
            "filtered_count": filtered_count,
            "filtered_summary": filtered_apps_summary,
            "apps_summary": apps_summary,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching applications.",
        )


# def dept_wise_list_apps(db: Session, params: )


def update_app(
    payload: ApplicationUpdate, app_id: str, db: Session, current_user: UserOut
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
            exclude_unset=True, exclude={"priority"}
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


def get_app_details(app_id: str, db: Session, current_user: UserOut):
    try:
        app = db.scalar(
            select(Application).where(Application.id == app_id, Application.is_active)
        )
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=f"App not found {app_id}"
            )

        app_depts = db.scalars(
            select(Department)
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
            departments=[DepartmentOut.model_validate(d) for d in app_depts],
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
