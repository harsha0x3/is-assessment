from fastapi import HTTPException, status
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import Session, selectinload
from models import ExecutiveSummary, Application, ApplicationDepartments, User
from schemas import exec_summary_schemas as exec_schemas
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone, timedelta


def create_app_exec_summary(db: Session, payload: exec_schemas.ExecSummaryInput):
    try:
        new_exec_summary = ExecutiveSummary(**payload.model_dump())
        db.add(new_exec_summary)
        db.commit()
        db.refresh(new_exec_summary)

        return new_exec_summary.to_dict()
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid application or user id",
        )
    except HTTPException:
        raise
    except Exception as e:
        print("Errror in adding exec summary", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Errror in adding exec summary",
        )


def get_application_exec_summary(app_id: str, db: Session):
    try:
        app = db.get(Application, app_id)

        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Application not found"
            )
        data = db.scalars(
            select(ExecutiveSummary)
            .where(
                and_(
                    ExecutiveSummary.application_id == app_id,
                    ExecutiveSummary.is_active,
                    ExecutiveSummary.scope == "application",
                )
            )
            .order_by(desc(ExecutiveSummary.created_at))
            .options(selectinload(ExecutiveSummary.author))
        )
        result: list[exec_schemas.ExecSummaryOut] = []

        for datum in data:
            result.append(exec_schemas.ExecSummaryOut.model_validate(datum))

        return result
    except HTTPException:
        raise
    except Exception as e:
        print("err in getting app's exec summary", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting application's executive summary",
        )


def get_dept_exec_summary(app_id: str, db: Session, dept_id: int):
    try:
        app_dept = db.scalar(
            select(ApplicationDepartments).where(
                and_(
                    ApplicationDepartments.application_id == app_id,
                    ApplicationDepartments.department_id == dept_id,
                    ApplicationDepartments.is_active,
                )
            )
        )

        print("APP DEPT", app_dept)

        if not app_dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Invalid request"
            )
        data = db.scalars(
            select(ExecutiveSummary)
            .where(
                and_(
                    ExecutiveSummary.application_id == app_id,
                    ExecutiveSummary.department_id == dept_id,
                    ExecutiveSummary.is_active,
                    ExecutiveSummary.scope == "department",
                )
            )
            .order_by(desc(ExecutiveSummary.created_at))
            .options(selectinload(ExecutiveSummary.author))
        )
        result: list[exec_schemas.DeptExecSummaryOut] = []

        for datum in data:
            result.append(exec_schemas.DeptExecSummaryOut.model_validate(datum))

        return result
    except HTTPException:
        raise
    except Exception as e:
        print("err in getting app's exec summary", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting application's executive summary",
        )


def get_latest_exec_summary_by_app_name(app_id: str, db: Session):
    try:
        # Get the application by name
        app = db.get(Application, app_id)

        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found",
            )

        # Get the latest executive summary by created_at
        latest_summary = db.scalar(
            select(ExecutiveSummary)
            .where(
                ExecutiveSummary.application_id == app.id, ExecutiveSummary.is_active
            )
            .order_by(desc(ExecutiveSummary.created_at))
            .options(selectinload(ExecutiveSummary.author))
        )

        if not latest_summary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No executive summaries found for this application",
            )

        return exec_schemas.ExecSummaryOut.model_validate(latest_summary)

    except HTTPException:
        raise
    except Exception as e:
        print("Error in getting latest exec summary:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


def update_exec_summary(
    db: Session, payload: exec_schemas.ExecSummaryUpdate, current_user: User
):
    try:
        exec_summary = db.get(ExecutiveSummary, payload.id)

        if not exec_summary or not exec_summary.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Executive summary not found",
            )

        if exec_summary.scope == "department":
            user_depts = [
                dept.department_id
                for dept in current_user.departments
                if dept.is_active
            ]
            if exec_summary.department_id not in user_depts:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to update this executive summary",
                )
        elif exec_summary.scope == "application":
            if current_user.role not in ["admin", "manager"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to update this executive summary",
                )

        exec_created_at = exec_summary.created_at
        if exec_created_at.tzinfo is None:  # naive datetime from DB
            exec_created_at = exec_created_at.replace(tzinfo=timezone.utc)

        if datetime.now(timezone.utc) - exec_created_at > timedelta(days=8):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot update executive summary after 8 days of creation",
            )

        # Check if it's within 8 days of creation
        if datetime.now(timezone.utc) - exec_created_at > timedelta(days=8):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot update executive summary after 8 days of creation",
            )

        # Update fields from payload
        for field, value in payload.model_dump(exclude={"id"}).items():
            if hasattr(exec_summary, field):
                setattr(exec_summary, field, value)

        db.add(exec_summary)
        db.commit()
        db.refresh(exec_summary)

        return exec_schemas.ExecSummaryOut.model_validate(exec_summary)

    except HTTPException:
        raise
    except Exception as e:
        print("Error updating executive summary:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )
