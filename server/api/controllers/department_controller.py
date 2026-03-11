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
    DepartmentControl,
    ApplicationControlResult
)
from datetime import datetime, timezone
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
        
        if not application.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Application is deleted"
            )
        departments = (
            db.query(Department).where(Department.is_active).filter(Department.id.in_(department_ids)).all()
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
        departments = db.query(Department).where(Department.is_active).all()
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
            select(Department, ApplicationDepartments)
            .join(ApplicationDepartments)
            .where(and_(ApplicationDepartments.application_id == app_id, ApplicationDepartments.is_active))
        )

        departments = db.execute(stmt).all()

        if not departments:
            exists = db.get(Application, app_id)
            if not exists:
                raise HTTPException(404, "Application not found")
            
        results: list[d_schemas.AppDepartmentOut] = []

        for dep, app_dept in departments:
            controls = db.execute(
    select(
        DepartmentControl.id,
        DepartmentControl.name,
        ApplicationControlResult.status
    )
    .join(ApplicationControlResult,
          ApplicationControlResult.department_control_id == DepartmentControl.id)
    .where(
        ApplicationControlResult.application_id == app_id,
        DepartmentControl.department_id == dep.id
    )
).all()
            controls_out = [
                d_schemas.ControlResultOut.model_validate(c) for c in controls
            ]

            results.append(d_schemas.AppDepartmentOut(
                id=dep.id,
                name=dep.name,
                description=dep.description,
                status=app_dept.status,
                started_at=app_dept.started_at,
                ended_at=app_dept.ended_at,
                controls=controls_out,
                app_category=app_dept.app_category,
            category_status=app_dept.category_status,
            ))

        return results
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
            select(Department, ApplicationDepartments)
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
            raise HTTPException(404, "Department not found")

        dept, app_dept = result

        # get all department statuses for go-live check
        all_dept_status = db.scalars(
            select(ApplicationDepartments.status).where(
                ApplicationDepartments.application_id == app_id
            )
        ).all()

        # get comments
        cmnt_query = db.scalars(
            select(Comment)
            .where(
                and_(
                    Comment.application_id == app_id,
                    Comment.department_id == dept_id,
                )
            )
            .order_by(Comment.created_at.desc())
        ).all()

        comments = [
            d_schemas.CommentOut.model_validate(c)
            for c in cmnt_query
        ]

        # fetch controls + results
        controls = db.execute(
            select(
                DepartmentControl.id,
                DepartmentControl.name,
                ApplicationControlResult.status,
            )
            .outerjoin(
                ApplicationControlResult,
                and_(
                    ApplicationControlResult.department_control_id == DepartmentControl.id,
                    ApplicationControlResult.application_id == app_id,
                ),
            )
            .where(
                DepartmentControl.department_id == dept_id
            )
        ).all()

        controls_out = [
            d_schemas.ControlResultOut.model_validate(c)
            for c in controls
        ]

        return d_schemas.DepartmentInfo(
            id=dept.id,
            name=dept.name,
            description=dept.description,
            status=app_dept.status,
            comments=comments,
            can_go_live=all(status == "cleared" for status in all_dept_status),
            started_at=app_dept.started_at,
            ended_at=app_dept.ended_at,
            app_category=app_dept.app_category,
            category_status=app_dept.category_status,
            controls=controls_out,
        )

    except HTTPException:
        raise

    except Exception as e:
        print("ERRO IN DEP INFO",e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "msg": "Error getting department info",
                "err_stack": str(e),
            },
        )
    
def change_department_app_status(
    app_id: str, dept_id: int, payload: d_schemas.DeptStatusPayload, db: Session
):
    try:
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
        
        print("DEPT UPDATE PAYLOAD", payload.model_dump())

        prev_status = dept_app.status

        for key, val in payload.model_dump(
            exclude_unset=True, exclude_none=True
        ).items():
            if hasattr(dept_app, key):
                if key == "started_at" and val:
                    print("Started at")
                    dept_app.started_at = datetime.now(timezone.utc).replace(
                        year=val.year,
                        month=val.month,
                        day=val.day,
                    )

                elif key == "ended_at" and val:
                    print("ENDED AT")
                    dept_app.ended_at = datetime.now(timezone.utc).replace(
                        year=val.year,
                        month=val.month,
                        day=val.day,
                    )
                else:
                    setattr(dept_app, key, val)

        if dept_app.status != prev_status and dept_app.status in [
            "cleared",
            "closed",
        ]:
            dept_app.ended_at = datetime.now(timezone.utc)

        db.flush()
        if payload.status and payload.status is not None:
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

            if all(d.status == "cleared" for d in dept_apps):
                app.status = "completed"
                app.is_completed = True
                app.completed_at = datetime.now(timezone.utc)
            elif app.status == "completed":
                app.status = "in_progress"
                app.is_completed = False

        db.commit()
        return "Changes made successfully"

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error changing the status of the department",
        )


def update_control_result(
    app_id: str,
    control_id: int,
    control_status: str,
    user_id: str,
    db: Session
):
    try:
        # 1️⃣ Get control to determine department
        control = db.get(DepartmentControl, control_id)

        if not control:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Control not found"
            )

        dept_id = control.department_id

        # 2️⃣ Update or insert control result
        result = db.scalar(
            select(ApplicationControlResult).where(
                ApplicationControlResult.application_id == app_id,
                ApplicationControlResult.department_control_id == control_id
            )
        )

        if not result:
            result = ApplicationControlResult(
                application_id=app_id,
                department_control_id=control_id,
                status=control_status,
                updated_by=user_id,
                updated_at=datetime.now(timezone.utc)
            )
            db.add(result)
        else:
            result.status = control_status
            result.updated_by = user_id
            result.updated_at = datetime.now(timezone.utc)

        db.flush()

        # 3️⃣ Get all control statuses for this department + application
        control_statuses = db.scalars(
            select(ApplicationControlResult.status)
            .join(
                DepartmentControl,
                DepartmentControl.id == ApplicationControlResult.department_control_id
            )
            .where(
                ApplicationControlResult.application_id == app_id,
                DepartmentControl.department_id == dept_id
            )
        ).all()

        # 4️⃣ Derive department workflow status
        if any(s == "remediation_required" for s in control_statuses):
            dept_status = "hold"

        elif all(s in ("compliant", "not_applicable", "risk_accepted") for s in control_statuses):
            dept_status = "cleared"

        else:
            dept_status = "in_progress"

        # 5️⃣ Update ApplicationDepartments
        dept_app = db.scalar(
            select(ApplicationDepartments).where(
                ApplicationDepartments.application_id == app_id,
                ApplicationDepartments.department_id == dept_id
            )
        )

        if dept_app:
            dept_app.status = dept_status

            if not dept_app.started_at:
                dept_app.started_at = datetime.now(timezone.utc)

        # 6️⃣ Update application completion status
        dept_statuses = db.scalars(
            select(ApplicationDepartments.status).where(
                ApplicationDepartments.application_id == app_id
            )
        ).all()

        app = db.get(Application, app_id)

        if app:
            if all(s == "cleared" for s in dept_statuses):
                app.status = "completed"
                app.is_completed = True
                app.completed_at = datetime.now(timezone.utc)
            else:
                if app.status == "completed":
                    app.status = "in_progress"
                    app.is_completed = False
                    app.completed_at = None

        db.commit()

        return {"message": "Control result updated successfully"}

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating control result: {str(e)}"
        )
    
def create_department_control(
    dept_id: int,
    payload: d_schemas.DepartmentControlCreate,
    db: Session
):
    try:
        dept = db.get(Department, dept_id)

        if not dept:
            raise HTTPException(404, "Department not found")

        control = DepartmentControl(
            department_id=dept_id,
            name=payload.name,
            control_type=payload.control_type
        )

        db.add(control)
        db.commit()
        db.refresh(control)

        return control

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error creating department control: {str(e)}"
        )
    
def get_department_controls(dept_id: int, db: Session):
    try:
        controls = db.scalars(
            select(DepartmentControl).where(
                DepartmentControl.department_id == dept_id
            )
        ).all()

        return [
            d_schemas.DepartmentControlOut.model_validate(c)
            for c in controls
        ]

    except Exception as e:
        raise HTTPException(500, str(e))