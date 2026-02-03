from db.base import Base
from sqlalchemy import Text, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    text = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # relationships
    app_dept_links = relationship(
        "AppDeptQuestions",
        back_populates="question",
        cascade="all, delete-orphan",
    )
