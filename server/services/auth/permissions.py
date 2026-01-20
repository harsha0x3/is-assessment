from sqlalchemy import select
from sqlalchemy.orm import Session
from models import DepartmentUsers


def is_user_of_dept(dept_id: int, user_id: str, db: Session) -> bool:
    user_dept = db.scalar(
        select(DepartmentUsers).where(
            DepartmentUsers.user_id == user_id,
            DepartmentUsers.department_id == dept_id,
        )
    )

    if user_dept:
        return True
    return False
