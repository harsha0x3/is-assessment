from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base


class AppDeptAnswers(Base):
    __tablename__ = "app_dept_answers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_dept_question_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "app_dept_questions.id",
            ondelete="cascade",
            onupdate="cascade",
        ),
        unique=True,
        nullable=False,
    )

    answer_text: Mapped[str] = mapped_column(String(1000), nullable=True)
    author_id: Mapped[str] = mapped_column(
        String(40),
        ForeignKey(
            "users.id",
            ondelete="set null",
            onupdate="cascade",
        ),
        nullable=True,
    )

    app_dept_question = relationship(
        "AppDeptQuestions",
        back_populates="answer",
    )

    author = relationship("User")
