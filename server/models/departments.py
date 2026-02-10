from sqlalchemy import String, Boolean, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base
from datetime import datetime, timezone
from sqlalchemy.ext.associationproxy import association_proxy


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(512), nullable=True)

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
    # -- Relationships --
    comments = relationship("Comment", back_populates="department")
    applications = relationship(
        "Application", secondary="application_departments", back_populates="departments"
    )
    evidences = relationship("ApplicationEvidence", back_populates="department")

    user_links = relationship(
        "DepartmentUsers",
        back_populates="department",
        cascade="all, delete-orphan",
    )

    # Convenience read access
    users = association_proxy(
        "user_links",
        "user",
    )
    question_set = relationship("DeptQuestionSet")
