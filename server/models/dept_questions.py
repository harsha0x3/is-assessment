from db.base import Base
from sqlalchemy import Text, Integer, DateTime, Boolean, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone


class DeptQuestionSet(Base):
    __tablename__ = "dept_question_sets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id", ondelete="cascade"),
        nullable=False,
        unique=True,  # ONE active template per department
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    department = relationship("Department", back_populates="question_set")
    questions = relationship(
        "DeptQuestion",
        back_populates="question_set",
        cascade="all, delete-orphan",
    )


class DeptQuestion(Base):
    __tablename__ = "dept_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question_set_id: Mapped[int] = mapped_column(
        ForeignKey("dept_question_sets.id", ondelete="cascade"),
        nullable=False,
    )

    sequence_number: Mapped[int] = mapped_column(Integer, nullable=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    question_set = relationship("DeptQuestionSet", back_populates="questions")
    answers = relationship(
        "AppDeptAnswer",
        back_populates="dept_question",
        cascade="all, delete-orphan",
    )
