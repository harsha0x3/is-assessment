from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from sqlalchemy import String, Integer, ForeignKey, DateTime, UniqueConstraint
from db.base import Base


class AppDeptQuestions(Base):
    __tablename__ = "app_dept_questions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_dept_id: Mapped[str] = mapped_column(
        String(40),
        ForeignKey(
            "application_departments.id",
            ondelete="cascade",
            onupdate="cascade",
        ),
        nullable=False,
    )
    question_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "questions.id",
            ondelete="cascade",
            onupdate="cascade",
        ),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    sequence_number: Mapped[int] = mapped_column(Integer, nullable=True)

    question = relationship("Question", back_populates="app_dept_links")

    app_department = relationship(
        "ApplicationDepartment",
        back_populates="question_links",
    )

    answer = relationship(
        "AppDeptAnswers",
        back_populates="app_dept_question",
        uselist=False,
        cascade="all, delete-orphan",
    )

    __table_args__ = (UniqueConstraint("app_dept_id", "question_id"),)
