from models import User, DepartmentUsers, Department
from schemas import auth_schemas as a_schemas
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
from fastapi import HTTPException, status


def admin_create_user(payload: a_schemas.RegisterRequest, db: Session):
    try:
        existing_user = db.scalar(select(User).where(User.email == payload.email))
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        new_user = User(
            full_name=payload.full_name,
            email=payload.email,
            role=payload.role,
        )
        new_user.set_password(payload.email)
        if payload.enable_mfa:
            _recovery_codes = new_user.enable_mfa()
            _mfa_uri = new_user.get_mfa_uri()

        db.add(new_user)
        db.flush()

        new_usr_associations = [
            DepartmentUsers(user_id=new_user.id, department_id=dept_id)
            for dept_id in payload.department_ids
        ]
        db.add_all(new_usr_associations)
        db.flush()
        db.commit()
        db.refresh(new_user)

        user_depts: list[a_schemas.DepartmentInAuth] = [
            a_schemas.DepartmentInAuth(
                user_dept_id=link.id,
                department_role=link.role,
                department_id=link.department.id,
                department_name=link.department.name,
                department_description=link.department.description,
            )
            for link in new_user.department_links
        ]

        return a_schemas.UserWithDepartmentInfo(
            id=new_user.id,
            full_name=new_user.full_name,
            email=new_user.email,
            role=new_user.role,
            created_at=new_user.created_at,
            updated_at=new_user.updated_at,
            departments=user_depts,
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error in creating new user", "err_stack": str(e)},
        )


def update_user_profile(
    user_id: str,
    current_user: a_schemas.UserOut,
    db: Session,
    payload: a_schemas.UserUpdateRequest,
):
    try:
        editing_user = db.scalar(select(User).where(User.id == user_id))

        if not editing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User Not Found",
            )

        # ---------------- Update basic fields ----------------
        for key, val in payload.model_dump(
            exclude_none=True, exclude_unset=True
        ).items():
            if key != "department_ids":
                setattr(editing_user, key, val)

        # ---------------- Update departments (SAFE) ----------------
        if payload.department_ids is not None:
            departments = db.scalars(
                select(Department).where(Department.id.in_(payload.department_ids))
            ).all()

            if len(departments) != len(set(payload.department_ids)):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more departments not found",
                )

            # Index existing links by department_id
            existing_links = {
                link.department_id: link for link in editing_user.department_links
            }

            incoming_ids = set(payload.department_ids)

            # UPDATE existing / INSERT new
            for dept in departments:
                if dept.id in existing_links:
                    # update existing link if needed
                    existing_links[dept.id].role = None
                else:
                    editing_user.department_links.append(
                        DepartmentUsers(
                            department=dept,
                            role=None,
                        )
                    )

            # DELETE removed departments
            for dept_id, link in existing_links.items():
                if dept_id not in incoming_ids:
                    db.delete(link)

        db.commit()
        db.refresh(editing_user)

        # ---------------- Build response ----------------
        user_depts: list[a_schemas.DepartmentInAuth] = [
            a_schemas.DepartmentInAuth(
                user_dept_id=link.id,
                department_role=link.role,
                department_id=link.department.id,
                department_name=link.department.name,
                department_description=link.department.description,
            )
            for link in editing_user.department_links
        ]

        return a_schemas.UserWithDepartmentInfo(
            id=editing_user.id,
            full_name=editing_user.full_name,
            email=editing_user.email,
            role=editing_user.role,
            created_at=editing_user.created_at,
            updated_at=editing_user.updated_at,
            departments=user_depts,
        )

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "msg": "Failed to update user",
                "err_stack": str(e),
            },
        )


def get_all_users(db: Session):
    try:
        users = (
            db.scalars(
                select(User).where(User.is_active).order_by(desc(User.created_at))
            )
            .unique()
            .all()
        )
        print("LENGTH OF ALL USERS = ", len(users))
        total_users = db.scalar(select(func.count(User.id)).where(User.is_active))
        result: list[a_schemas.AllUsersWithDepartments] = []
        for user in users:
            user_depts: list[a_schemas.DepartmentInAuth] = []
            for usr_dept, dept in zip(user.department_links, user.departments):
                user_dept_info = a_schemas.DepartmentInAuth(
                    user_dept_id=usr_dept.id,
                    department_role=usr_dept.role,
                    department_id=dept.id,
                    department_name=dept.name,
                    department_description=dept.description,
                )
                user_depts.append(user_dept_info)
            res_data = a_schemas.AllUsersWithDepartments(
                id=user.id,
                full_name=user.full_name,
                email=user.email,
                role=user.role,
                created_at=user.created_at,
                updated_at=user.updated_at,
                departments=user_depts,
                mfa_recovery_codes=user.mfa_recovery_codes,
                mfa_secret=user.mfa_secret,
            )
            result.append(res_data)

        return {"users": result, "total_count": total_users}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"msg": "Error getting all users", "err_stack": str(e)},
        )
