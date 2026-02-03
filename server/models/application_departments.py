from sqlalchemy import String, ForeignKey, UniqueConstraint, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
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

    # -- Relationships --
    question_links = relationship(
        "AppDeptQuestions",
        back_populates="app_department",
        cascade="all, delete-orphan",
    )

    # -- Table Constraints --
    __table_args__ = (
        UniqueConstraint(
            "application_id",
            "department_id",
            name="uix_application_department",
        ),
    )
