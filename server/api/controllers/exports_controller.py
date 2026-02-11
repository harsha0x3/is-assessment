from models import Application, ApplicationDepartments, Department
from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from fastapi.responses import FileResponse
from .comments_controller import get_latest_app_dept_comment
import csv
from collections import defaultdict

import os
import zipfile
import tempfile


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


def get_vertical_applications(db: Session):
    try:
        stmt = (
            select(
                Application.vertical,
                Application.name.label("app_name"),
                Application.status.label("app_status"),
                Department.name.label("department"),
                ApplicationDepartments.status.label("department_status"),
            )
            .join(
                ApplicationDepartments,
                Application.id == ApplicationDepartments.application_id,
            )
            .join(Department, Department.id == ApplicationDepartments.department_id)
        )

        rows = db.execute(stmt).all()

        response = defaultdict(dict)

        for row in rows:
            vertical = row.vertical or "Unknown"
            app_key = row.app_name

            if app_key not in response[vertical]:
                response[vertical][app_key] = {
                    "app_name": row.app_name,
                    "app_status": row.app_status,
                    "departments": {},
                }

            response[vertical][app_key]["departments"][row.department] = (
                row.department_status
            )

        # Convert inner dicts to lists
        final_response = {
            vertical: list(apps.values()) for vertical, apps in response.items()
        }

        return final_response

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting department details",
        )


def export_vertical_applications_zip(db: Session):
    try:
        stmt = (
            select(
                Application.vertical,
                Application.name.label("app_name"),
                Application.status.label("app_status"),
                Department.name.label("department"),
                ApplicationDepartments.status.label("department_status"),
            )
            .join(
                ApplicationDepartments,
                Application.id == ApplicationDepartments.application_id,
            )
            .join(Department, Department.id == ApplicationDepartments.department_id)
        )

        rows = db.execute(stmt).all()

        # ---------------------------------------
        # 1. Organize data
        # ---------------------------------------
        vertical_data = defaultdict(lambda: defaultdict(dict))
        all_departments = set()

        for row in rows:
            vertical = row.vertical or "Unknown"
            app = row.app_name

            vertical_data[vertical][app]["app_status"] = row.app_status
            vertical_data[vertical][app].setdefault("departments", {})
            vertical_data[vertical][app]["departments"][row.department] = (
                row.department_status
            )

            all_departments.add(row.department)

        departments = sorted(all_departments)

        # ---------------------------------------
        # 2. Create temp directory & ZIP
        # ---------------------------------------
        temp_dir = tempfile.mkdtemp()
        zip_path = os.path.join(temp_dir, "applications_by_vertical.zip")

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for vertical, apps in vertical_data.items():
                csv_file = os.path.join(temp_dir, f"{vertical}.csv")

                with open(csv_file, mode="w", newline="", encoding="utf-8") as f:
                    writer = csv.writer(f)

                    # Header
                    writer.writerow(["App Name", "App Status", *departments])

                    # Rows
                    for app_name, app_data in apps.items():
                        row = [
                            app_name,
                            app_data["app_status"],
                        ]

                        for dept in departments:
                            row.append(app_data["departments"].get(dept, "N/A"))

                        writer.writerow(row)

                zipf.write(csv_file, arcname=f"{vertical}.csv")

        # ---------------------------------------
        # 3. Return ZIP file
        # ---------------------------------------
        return FileResponse(
            path=zip_path,
            filename="applications_by_vertical.zip",
            media_type="application/zip",
        )

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error exporting applications",
        )
