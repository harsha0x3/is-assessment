from fastapi import HTTPException, status
from sqlalchemy import select, and_, desc, asc, func, or_
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from models import (
    Application,
    ApplicationDepartments,
    Department,
    Checklist,
    ChecklistAssignment,
)
from schemas.app_schemas import (
    ApplicationCreate,
    ApplicationOut,
    ApplicationUpdate,
    ListApplicationsOut,
    NewAppListOut,
    AppQueryParams,
    AppStatuses,
)
from .comments_controller import get_latest_app_dept_comment
from schemas.auth_schemas import UserOut
from schemas.checklist_schemas import ChecklistOut
from .department_controller import get_departments_by_application
from typing import Any
from datetime import date, timedelta


def create_app(
    payload: ApplicationCreate,
    db: Session,
    creator: UserOut,
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
        app.set_priority_for_user(user_id=creator.id, db=db, priority_val=2)

        all_depts = db.scalars(select(Department)).all()

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

        return ApplicationOut.model_validate(app)

    except IntegrityError as e:
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

        if params.sla_filter and params.sla_filter > 0:
            sla_cutoff = date.today() - timedelta(days=params.sla_filter)

            stmt = stmt.where(
                Application.started_at.is_not(None),
                func.date(Application.started_at) <= sla_cutoff,
            )

        # ✅ SEARCH FILTER
        if params.search and params.search != "null" and params.search_by:
            search_value = f"%{params.search}%"
            search_column = getattr(Application, params.search_by, None)

            if params.search_by == "ticket_id":
                stmt = stmt.where(
                    or_(
                        Application.ticket_id.ilike(search_value),
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
                ticket_id=app.ticket_id,
                imitra_ticket_id=app.imitra_ticket_id,
                status=app.status,
                app_priority=app.app_priority,
                started_at=app.started_at,
                completed_at=app.completed_at,
                departments=depts_out,
                app_url=app.app_url,
                vendor_company=app.vendor_company,
                latest_comment=latest_comment,
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

        for key, val in payload.model_dump(
            exclude_unset=True, exclude={"priority"}
        ).items():
            setattr(app, key, val)

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


# -------------- OLD -------------


def list_apps(db: Session, user: UserOut, params: AppQueryParams):
    stmt = select(Application).distinct().where(Application.is_active)

    if user.role != "admin":
        # join checklists and assignments to filter by user_id
        stmt = (
            stmt.outerjoin(Application.checklists)
            .outerjoin(Checklist.assignments)
            .where(
                or_(
                    ChecklistAssignment.user_id == user.id,
                    Application.owner_id == user.id,
                )
            )
        )
    # else:
    # stmt = stmt.where(Application.creator_id == user.id)

    total_count = db.scalar(select(func.count()).select_from(stmt.subquery()))
    sort_column = getattr(Application, params.sort_by)
    if params.sort_order == "desc":
        sort_column = desc(sort_column)
    else:
        sort_column = asc(sort_column)

    if params.search and params.search != "null" and params.search_by:
        print("FOUND SEARCH Q", params.search)
        print("FOUND SEARCH BY", params.search_by)
        search_value = f"%{params.search}%"
        search_column = getattr(Application, params.search_by, None)
        if search_column is not None:
            stmt = stmt.where(search_column.ilike(search_value))
            print(stmt)

    if params.page >= 1:
        apps = db.scalars(
            stmt.order_by(sort_column)
            .limit(params.page_size)
            .offset(params.page * params.page_size - params.page_size)
        ).all()
    else:
        print("\nIN ELSE", stmt)
        apps = db.scalars(stmt.order_by(sort_column)).all()

    apps_out = []

    for app in apps:
        if user.role != "admin":
            app_checklists = [
                ChecklistOut(
                    id=chk.id,
                    app_name=app.name,
                    checklist_type=chk.checklist_type,
                    assigned_users=[
                        UserOut.model_validate(a.user) for a in chk.assignments
                    ],
                    is_completed=chk.is_completed,
                    priority=chk.get_priority_for_user(user_id=user.id, db=db),
                    status=chk.status,
                    comment=chk.comment,
                    created_at=chk.created_at,
                    updated_at=chk.updated_at,
                )
                for chk in app.checklists or []
                if app.owner_id == user.id
                or any(a.user_id == user.id for a in chk.assignments)
            ]
        else:
            app_checklists = [
                ChecklistOut(
                    id=chk.id,
                    app_name=app.name,
                    checklist_type=chk.checklist_type,
                    assigned_users=[
                        UserOut.model_validate(a.user) for a in chk.assignments
                    ],
                    is_completed=chk.is_completed,
                    priority=chk.get_priority_for_user(user_id=user.id, db=db),
                    status=chk.status,
                    comment=chk.comment,
                    created_at=chk.created_at,
                    updated_at=chk.updated_at,
                )
                for chk in app.checklists or []
            ]

        apps_out.append(
            ListApplicationsOut(
                id=app.id,
                name=app.name,
                description=app.description,
                is_completed=app.is_completed,
                status=app.status,
                checklists=app_checklists,
                ticket_id=app.ticket_id,
                priority=app.get_priority_for_user(user_id=user.id, db=db),
            )
        )

    return {
        "apps": apps_out,
        "assigned_users": [],
        "total_count": total_count,
    }


def list_apps_with_details(
    db: Session, user: UserOut, params: AppQueryParams
) -> dict[str, Any | list[ApplicationOut]]:
    stmt = select(Application).distinct().where(Application.is_active)

    if user.role != "admin":
        # join checklists and assignments to filter by user_id
        stmt = (
            stmt.outerjoin(Application.checklists)
            .outerjoin(Checklist.assignments)
            .where(
                or_(
                    ChecklistAssignment.user_id == user.id,
                    Application.owner_id == user.id,
                )
            )
        )
    # else:
    # stmt = stmt.where(Application.creator_id == user.id)

    total_count = db.scalar(select(func.count()).select_from(stmt.subquery()))
    sort_column = getattr(Application, params.sort_by)
    if params.sort_order == "desc":
        sort_column = desc(sort_column)
    else:
        sort_column = asc(sort_column)

    if params.search and params.search != "null" and params.search_by:
        print("FOUND SEARCH Q", params.search)
        print("FOUND SEARCH BY", params.search_by)
        search_value = f"%{params.search}%"
        search_column = getattr(Application, params.search_by, None)
        if search_column is not None:
            stmt = stmt.where(search_column.ilike(search_value))

    if params.page >= 1:
        apps = db.scalars(
            stmt.order_by(sort_column)
            .limit(params.page_size)
            .offset(params.page * params.page_size - params.page_size)
        ).all()
    else:
        apps = db.scalars(stmt.order_by(sort_column)).all()

    return {
        "apps": [
            ApplicationOut(
                **app.to_dict(),
            )
            for app in apps
        ],
        "total_count": total_count,
    }


def update_app_status(app_id: str, db: Session):
    try:
        app = db.get(Application, app_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="App not found"
            )

        checklists = app.checklists or []
        if not checklists:
            app.is_completed = False
            app.status = "pending"
            db.commit()
            db.refresh(app)
            return {"msg": f"App {app.name} marked pending (no checklists)"}

        completed = [c.is_completed for c in checklists]
        in_prog = [c.status == "in_progress" for c in checklists]

        if all(completed):
            app.status = "completed"
            app.is_completed = True
        elif any(completed) or any(in_prog):
            app.status = "in_progress"
            app.is_completed = False
        else:
            app.status = "pending"
            app.is_completed = False

        db.commit()
        db.refresh(app)

        return {"msg": f"App {app.name} marked {app.status}"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update application status for {app_id}: {str(e)}",
        )


# def delete_app(app_id: str, db: Session, current_user: UserOut):
#     try:
#         if current_user.role != "admin":
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail=f"You are not authorised to deleted {current_user.full_name}",
#             )
#         app = db.scalar(select(Application).where(Application.id == app_id))
#         if not app:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND, detail=f"App not found {app_id}"
#             )
#         if not app.is_active:
#             db.delete(app)
#             db.commit()
#             del_app = ApplicationOut(
#                 **app.to_dict(),
#                 priority=app.get_priority_for_user(user_id=current_user.id, db=db),
#             ).model_dump()
#             del_app["msg"] = "Successfully deleted app"
#             return del_app

#         setattr(app, "is_active", False)
#         checklists = app.checklists

#         for checklist in checklists:
#             if checklist.is_active:
#                 setattr(checklist, "is_active", False)

#             if checklist.assignments:
#                 for ass in checklist.assignments:
#                     ass.is_active = False

#                 for control in checklist.controls:
#                     if control.is_active:
#                         control.is_active = False
#                     if control.responses:
#                         if control.responses.is_active:
#                             control.responses.is_active = False

#         db.commit()
#         db.refresh(app)
#         del_app = ApplicationOut(
#             **app.to_dict(),
#             priority=app.get_priority_for_user(user_id=current_user.id, db=db),
#         ).model_dump()
#         del_app["msg"] = "Successfully trashed app"
#         return del_app

#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to delete the app {str(e)}",
#         )


# def restore_app(app_id: str, db: Session):
#     try:
#         app = db.scalar(
#             select(Application).where(
#                 and_(Application.id == app_id, not_(Application.is_active))
#             )
#         )

#         if not app:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail=f"Application not found id recieved: {app_id}",
#             )

#         app.is_active = True
#         if app.checklists:
#             for checklist in app.checklists:
#                 checklist.is_active = True
#                 if checklist.assignments:
#                     for ass in checklist.assignments:
#                         ass.is_active = False
#                 if checklist.controls:
#                     for control in checklist.controls:
#                         control.is_active = True
#                         if control.responses:
#                             control.responses.is_active = True

#         db.commit()
#         db.refresh(app)
#         return {"msg": "App restored successfully"}

#     except HTTPException:
#         raise

#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error restoring application {str(e)}",
#         )


# def get_trashed_apps(db: Session):
#     try:
#         trashed_apps = db.scalars(
#             select(Application).where(not_(Application.is_active))
#         ).all()
#         if not trashed_apps:
#             raise HTTPException(
#                 status_code=status.HTTP_204_NO_CONTENT, detail="No apps in trash"
#             )
#         return [
#             ApplicationOut(
#                 **trashed_app.to_dict(),
#                 priority=2,
#             )
#             for trashed_app in trashed_apps
#         ]
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Error fetching trashed apps {str(e)}",
#         )
