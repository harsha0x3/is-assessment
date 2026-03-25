from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

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
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    go_live_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    app_category: Mapped[str] = mapped_column(String(40), nullable=True)
    category_status: Mapped[str] = mapped_column(String(40), nullable=True)

    updated_by: Mapped[str] = mapped_column(
        String(40),
        ForeignKey("users.id", ondelete="set null", onupdate="cascade"),
        nullable=True,
    )

    updated_by_user = relationship("User", foreign_keys=[updated_by])
    # -- Table Constraints --
    __table_args__ = (
        UniqueConstraint(
            "application_id",
            "department_id",
            name="uix_application_department",
        ),
    )
