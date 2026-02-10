from fastapi import HTTPException, status, BackgroundTasks
from sqlalchemy import select, and_, desc, asc, func, or_
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from models import (
    Application,
    ApplicationDepartments,
    Department,
    AppQuestionSet,
)
from schemas.app_schemas import (
    ApplicationCreate,
    ApplicationOut,
    ApplicationUpdate,
    NewAppListOut,
    AppQueryParams,
    AppStatuses,
)
from .comments_controller import get_latest_app_dept_comment
from schemas.auth_schemas import UserOut
from .department_controller import get_departments_by_application
from datetime import date, timedelta
from services.notifications.email_notify import send_new_app_mails_bg
from schemas.notification_schemas import NewAppData


def create_app(
    payload: ApplicationCreate,
    db: Session,
    creator: UserOut,
    background_tasks: BackgroundTasks,
    owner: UserOut | None = None,
) -> ApplicationOut:
    try:
        print("INSIDE CREATE APP CONTROLLER")
        app = Application(
            **payload.model_dump(exclude={"priority"}),
            creator_id=creator.id,
            owner_id=owner.id if owner else None,
        )

        db.add(app)
        db.flush()

        all_depts = db.scalars(select(Department)).all()
        app_questions_set = db.scalars(select(AppQuestionSet).limit(1)).first()
        app.question_set_id = app_questions_set.id if app_questions_set else None

        app_departments = []

        for dept in all_depts:
            new_app_dept = ApplicationDepartments(
                application_id=app.id,
                department_id=dept.id,
            )
            app_departments.append(new_app_dept)

        db.add_all(app_departments)
        db.commit()
        db.refresh(app)

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

    except IntegrityError as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="App with the same exists"
        )

    except Exception as e:
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


def list_all_apps(db: Session, params: AppQueryParams):
    try:
        stmt = (
            select(Application)
            .distinct()
            .where(Application.is_active)
            .options(joinedload(Application.departments))
        )

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

        today = date.today()

        if params.sla_filter and params.sla_filter > 0:
            # Always ignore rows with NULL started_at
            stmt = stmt.where(Application.started_at.is_not(None))

            if params.sla_filter == 30:
                # 0–30 days
                lower = today - timedelta(days=30)

                stmt = stmt.where(
                    func.date(Application.started_at) >= lower,
                    func.date(Application.started_at) <= today,
                )

            elif params.sla_filter == 60:
                # 30–60 days
                upper = today - timedelta(days=30)
                lower = today - timedelta(days=60)

                stmt = stmt.where(
                    func.date(Application.started_at) >= lower,
                    func.date(Application.started_at) < upper,
                )

            elif params.sla_filter == 90:
                # 60–90 days
                upper = today - timedelta(days=60)
                lower = today - timedelta(days=90)

                stmt = stmt.where(
                    func.date(Application.started_at) >= lower,
                    func.date(Application.started_at) < upper,
                )

            elif params.sla_filter == 91:
                # 90+ days
                cutoff = today - timedelta(days=90)

                stmt = stmt.where(func.date(Application.started_at) < cutoff)

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
        filtered_apps_summary = None
        if _has_filters(params):
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
                app_url=app.app_url,
                vendor_company=app.vendor_company,
                latest_comment=latest_comment,
                due_date=app.due_date,
                titan_spoc=app.titan_spoc,
                environment=app.environment,
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

        return ApplicationOut.model_validate(app)

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
