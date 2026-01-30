import pandas as pd
from models import Application, ApplicationDepartments, Department
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from fastapi import HTTPException, status
from .comments_controller import get_latest_app_dept_comment
import csv


def get_departments_by_application_dict(app_id: str, db: Session) -> dict:
    stmt = (
        select(Department, ApplicationDepartments.status)
        .join(ApplicationDepartments)
        .where(ApplicationDepartments.application_id == app_id)
    )

    results = db.execute(stmt).all()

    if not results:
        exists = db.get(Application, app_id)
        if not exists:
            raise HTTPException(404, "Application not found")

    departments = {}

    for dep, status_ in results:
        comment = get_latest_app_dept_comment(app_id=app_id, dept_id=dep.id, db=db)

        departments[dep.name] = {
            "status": status_,
            "comment": comment.content if comment else "",
        }

    return departments


def get_all_department_names(db: Session) -> list[str]:
    dept_names = db.scalars(select(Department.name)).all()
    return [name for name in dept_names]


def build_application_csv_row(
    app: Application, departments: dict, all_departments: list[str]
) -> dict:
    row = {
        "application_name": app.name,
        "description": app.description,
        "environment": app.environment,
        "region": app.region,
        "vendor_company": app.vendor_company,
        "app_priority": app.app_priority,
        "app_technology": app.app_tech,
        "vertical": app.vertical,
        "imitra_ticket_id": app.imitra_ticket_id,
        "overall_status": app.status,
        "titan_spoc": app.titan_spoc,
        "start_date": app.started_at,
        "app_url": app.app_url,
        "user_type": app.user_type,
        "data_type": app.data_type,
    }

    for dept_name in all_departments:
        row[f"{dept_name}_status"] = departments.get(dept_name, {}).get("status", "")
        row[f"{dept_name}_comment"] = departments.get(dept_name, {}).get("comment", "")

    return row


def export_application_overview_rows(db: Session) -> list[dict]:
    applications = db.scalars(select(Application)).all()
    all_departments = get_all_department_names(db)

    rows = []

    for app in applications:
        departments = get_departments_by_application_dict(app_id=app.id, db=db)

        rows.append(build_application_csv_row(app, departments, all_departments))

    return rows
