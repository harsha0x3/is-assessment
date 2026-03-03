from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint, Date
from sqlalchemy.orm import Mapped, mapped_column
from datetime import date

from db.base import Base, BaseMixin


class ApplicationDepartments(Base, BaseMixin):
    __tablename__ = "application_departments"

    application_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("applications.id"), nullable=False
    )
    department_id: Mapped[str] = mapped_column(
        Integer, ForeignKey("departments.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(40), default="yet_to_connect")
    started_at: Mapped[date] = mapped_column(Date, nullable=True)

    app_category: Mapped[str] = mapped_column(String(40), nullable=True)
    category_status: Mapped[str] = mapped_column(String(40), nullable=True)

    # -- Table Constraints --
    __table_args__ = (
        UniqueConstraint(
            "application_id",
            "department_id",
            name="uix_application_department",
        ),
    )
