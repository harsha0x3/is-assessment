from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base


class AppQuestionSet(Base):
    __tablename__ = "question_sets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    questions = relationship(
        "ApplicationQuestion",
        back_populates="question_set",
        cascade="all, delete-orphan",
    )


class ApplicationQuestion(Base):
    __tablename__ = "application_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question_set_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("question_sets.id", ondelete="cascade"),
        nullable=False,
    )
    sequence_number: Mapped[int] = mapped_column(Integer, nullable=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(20), nullable=True)
    is_high: Mapped[bool] = mapped_column(Boolean, default=False)
    is_medium: Mapped[bool] = mapped_column(Boolean, default=False)

    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    question_set = relationship("AppQuestionSet", back_populates="questions")
    answers = relationship("ApplicationAnswer", back_populates="app_question")
    options = relationship("ApplicationQuestionOption", back_populates="app_question")

class ApplicationQuestionOption(Base):
    __tablename__ = 'application_question_options'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    app_question_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "application_questions.id",
            ondelete="cascade",
            onupdate="cascade",
        ),
        nullable=False,
    )
    sequence_number: Mapped[int] = mapped_column(Integer, nullable=True)
    text: Mapped[str] = mapped_column(String(212), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    weight: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    app_question = relationship("ApplicationQuestion", back_populates="options")
