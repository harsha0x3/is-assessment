# controllers\department_controller.py
from fastapi import HTTPException, status
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session
from models import (
    Application,
    Department,
    DepartmentUsers,
    ApplicationDepartments,
    Comment,
)
from schemas import department_schemas as d_schemas


def create_new_department(payload: d_schemas.DepartmentCreate, db: Session):
    try:
        existing_department = (
            db.query(Department)
            .filter(
                or_(
                    Department.name == payload.name,
                )
            )
            .first()
        )
        if existing_department:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department with the same name already exists.",
            )

        new_department = Department(
            name=payload.name,
            description=payload.description,
        )
        db.add(new_department)
        db.commit()
        db.refresh(new_department)
        return new_department

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating department: {str(e)}",
        )


def add_departments_to_application(app_id: str, department_ids: list[int], db: Session):
    try:
        application = db.get(Application, app_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found.",
            )
        departments = (
            db.query(Department).filter(Department.id.in_(department_ids)).all()
        )
        if len(departments) != len(department_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more departments not found.",
            )
        existing = {d.id for d in application.departments}

        new_departments = [d for d in departments if d.id not in existing]
        application.departments.extend(new_departments)
        db.commit()
        return application

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding departments to application: {str(e)}",
        )


def get_all_departments(db: Session):
    try:
        departments = db.query(Department).all()
        return [d_schemas.DepartmentOut.model_validate(d) for d in departments]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching departments: {str(e)}",
        )


def is_user_in_department(user_id: str, department_id: int, db: Session) -> bool:
    association = db.scalar(
        select(DepartmentUsers).where(
            and_(
                Department.id == department_id,
                DepartmentUsers.user_id == user_id,
            )
        )
    )
    return association is not None


def get_departments_by_application(app_id: str, db: Session):
    try:
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

        return [
            d_schemas.AppDepartmentOut(
                id=dep.id,
                name=dep.name,
                description=dep.description,
                created_at=dep.created_at,
                updated_at=dep.updated_at,
                status=status,  # 👈 coming from ApplicationDepartments
            )
            for dep, status in results
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to load departments: {str(e)}")


def add_user_to_department(
    payload: d_schemas.NewUserDepartmentAssign, department_id: int, db: Session
):
    try:
        department = db.get(Department, department_id)
        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found.",
            )
        is_association = is_user_in_department(
            user_id=payload.user_id, department_id=department_id, db=db
        )

        if is_association:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already in the department.",
            )

        new_association = DepartmentUsers(
            department_id=department_id,
            user_id=payload.user_id,
            role=payload.role,
        )
        db.add(new_association)
        db.commit()
        return department

    except HTTPException:
        raise


def add_user_to_multiple_departments(
    payload: d_schemas.NewUserDepartmentAssign, department_ids: list[int], db: Session
):
    try:
        # Fetch departments
        departments = (
            db.query(Department).filter(Department.id.in_(department_ids)).all()
        )

        if len(departments) != len(department_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more departments not found.",
            )

        created_count = 0
        skipped = []

        for department_id in department_ids:
            # Check if user already in department
            if is_user_in_department(
                user_id=payload.user_id,
                department_id=department_id,
                db=db,
            ):
                skipped.append(department_id)
                continue

            # Create association
            new_association = DepartmentUsers(
                department_id=department_id,
                user_id=payload.user_id,
                role=payload.role,
            )
            db.add(new_association)
            created_count += 1

        db.commit()

        return {
            "created": created_count,
            "skipped_existing": skipped,
            "data": department_ids,
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


def get_department_info(db: Session, app_id: str, dept_id: int):
    try:
        stmt = (
            select(Department, ApplicationDepartments.status)
            .join(
                ApplicationDepartments,
                ApplicationDepartments.department_id == Department.id,
            )
            .where(
                and_(
                    ApplicationDepartments.application_id == app_id,
                    ApplicationDepartments.department_id == dept_id,
                )
            )
        )

        result = db.execute(stmt).first()

        if not result:
            raise HTTPException(status_code=404, detail="Department not found")

        dept, dept_status = result

        stmt_comments = (
            select(Comment)
            .where(
                Comment.department_id == dept_id,
                Comment.application_id == app_id,
            )
            .order_by(Comment.created_at.desc())
        )

        comments = db.scalars(stmt_comments).all()

        comments = [d_schemas.CommentOutNoDep.model_validate(cmt) for cmt in comments]

        return d_schemas.DepartmentInfo(
            id=dept.id,
            name=dept.name,
            description=dept.description,
            created_at=dept.created_at,
            updated_at=dept.updated_at,
            status=dept_status,
            comments=comments,
        )
    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting department info",
        )


def change_department_app_status(
    app_id: str, dept_id: int, status_val: str, db: Session
):
    try:
        allowed_statuses = {"pending", "in-progress", "completed", "rejected"}
        if status_val not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status value",
            )

        dept_app = db.scalar(
            select(ApplicationDepartments).where(
                ApplicationDepartments.application_id == app_id,
                ApplicationDepartments.department_id == dept_id,
            )
        )

        if not dept_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application and department are not mapped",
            )

        dept_app.status = status_val

        dept_apps = (
            db.execute(
                select(ApplicationDepartments).where(
                    ApplicationDepartments.application_id == app_id
                )
            )
            .scalars()
            .all()
        )

        app = db.get(Application, app_id)
        if not app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found",
            )

        if all(d.status == "completed" for d in dept_apps):
            app.status = "completed"
            app.is_completed = True
        elif app.status == "completed":
            app.status = "in-progress"
            app.is_completed = False

        db.commit()
        return app

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error changing the status of the department",
        )
