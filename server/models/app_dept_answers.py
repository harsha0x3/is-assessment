from sqlalchemy import String, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base


class AppDeptAnswer(Base):
    __tablename__ = "app_dept_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    application_id: Mapped[str] = mapped_column(
        String(40),
        ForeignKey("applications.id", ondelete="cascade"),
        nullable=False,
    )

    department_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("departments.id", ondelete="cascade"),
        nullable=False,
    )

    dept_question_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("dept_questions.id", ondelete="cascade"),
        nullable=False,
    )

    answer_text: Mapped[str] = mapped_column(String(1000), nullable=True)
    author_id: Mapped[str] = mapped_column(
        String(40),
        ForeignKey("users.id", ondelete="set null"),
        nullable=True,
    )

    __table_args__ = (
        UniqueConstraint(
            "application_id",
            "department_id",
            "dept_question_id",
            name="uix_app_dept_question_answer",
        ),
    )

    dept_question = relationship("DeptQuestion", back_populates="answers")
    application = relationship("Application")
    department = relationship("Department")
    author = relationship("User")
