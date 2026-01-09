from sqlalchemy import String, ForeignKey, UniqueConstraint, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base, BaseMixin


class DepartmentUsers(Base, BaseMixin):
    __tablename__ = "department_users"

    department_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("departments.id"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("users.id"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(40), nullable=True)

    department = relationship("Department", back_populates="user_links")
    user = relationship("User", back_populates="department_links")

    # -- Table Constraints --
    __table_args__ = (
        UniqueConstraint(
            "department_id",
            "user_id",
            name="uix_department_user",
        ),
    )
