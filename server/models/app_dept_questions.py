from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from sqlalchemy import (
    String,
    Integer,
    ForeignKey,
    DateTime,
    UniqueConstraint,
    Boolean,
    ForeignKeyConstraint,
)
from db.base import Base


class AppDeptQuestions(Base):
    __tablename__ = "app_dept_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    application_id: Mapped[str] = mapped_column(String(40), nullable=False)
    department_id: Mapped[int] = mapped_column(Integer, nullable=False)

    question_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("questions.id", ondelete="cascade"),
        nullable=False,
    )

    sequence_number: Mapped[int] = mapped_column(Integer, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    __table_args__ = (
        # 🔗 LINK to application_departments
        ForeignKeyConstraint(
            ["application_id", "department_id"],
            [
                "application_departments.application_id",
                "application_departments.department_id",
            ],
            ondelete="cascade",
        ),
        # one question once per app+dept
        UniqueConstraint("application_id", "department_id", "question_id"),
    )

    # relationships
    question = relationship("Question", back_populates="app_dept_links")
    app_department = relationship(
        "ApplicationDepartments",
        back_populates="question_links",
    )

    answer = relationship(
        "AppDeptAnswers",
        back_populates="app_dept_question",
        uselist=False,
        cascade="all, delete-orphan",
    )
