from sqlalchemy import String, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base


class ApplicationAnswer(Base):
    __tablename__ = "application_answers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    app_question_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "application_questions.id",
            ondelete="cascade",
            onupdate="cascade",
        ),
        nullable=False,
    )
    application_id: Mapped[str] = mapped_column(
        String(40),
        ForeignKey(
            "applications.id",
            ondelete="cascade",
            onupdate="cascade",
        ),
        nullable=False,
    )

    answer_text: Mapped[str] = mapped_column(String(300), nullable=True)
    author_id: Mapped[str] = mapped_column(
        String(40),
        ForeignKey(
            "users.id",
            ondelete="set null",
            onupdate="cascade",
        ),
        nullable=True,
    )

    __table_args__ = (UniqueConstraint("application_id", "app_question_id"),)

    application = relationship("Application", back_populates="answers")
    app_question = relationship("ApplicationQuestion", back_populates="answers")
    author = relationship("User")
