from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone

from db.base import Base

class DepartmentControl(Base):
    __tablename__ = "department_controls"
    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    department_id: Mapped[int] = mapped_column(Integer, ForeignKey("departments.id", ondelete="cascade", onupdate="cascade"), nullable=False)
    name: Mapped[str] = mapped_column(String(52), nullable=False)
    control_type: Mapped[str] = mapped_column(String(52), nullable=True)

    department = relationship(
        "Department",
        back_populates="controls",
    )

    application_results = relationship(
        "ApplicationControlResult",
        back_populates="control",
        cascade="all, delete-orphan",
    )
    

class ApplicationControlResult(Base):

    __tablename__="application_control_results"
    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    application_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("applications.id"), nullable=False
    )
    department_control_id: Mapped[int] = mapped_column(Integer, ForeignKey("department_controls.id", ondelete="cascade", onupdate="cascade"), nullable=False)
    status: Mapped[str] = mapped_column(String(52), nullable=False)
    updated_by: Mapped[str] = mapped_column(
        String(40), ForeignKey("users.id"), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.now(timezone.utc))

    # --- Relationships ---

    application = relationship(
        "Application",
        back_populates="control_results",
    )

    control = relationship(
        "DepartmentControl",
        back_populates="application_results",
    )

    updated_by_user = relationship(
        "User", foreign_keys=[updated_by]
    )