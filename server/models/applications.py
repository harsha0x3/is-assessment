from sqlalchemy import ForeignKey, String, Text, Integer, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from datetime import datetime
from db.base import Base, BaseMixin


class Application(Base, BaseMixin):
    __tablename__ = "applications"

    name: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    environment: Mapped[str] = mapped_column(String(512), nullable=True)
    region: Mapped[str] = mapped_column(String(100), nullable=True)
    owner_name: Mapped[str] = mapped_column(String(512), nullable=True)
    vendor_company: Mapped[str] = mapped_column(String(666), nullable=True)
    app_priority: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    infra_host: Mapped[str] = mapped_column(String(512), nullable=True)
    app_tech: Mapped[str] = mapped_column(Text, nullable=True)
    vertical: Mapped[str] = mapped_column(String(128), nullable=True)
    is_completed: Mapped[bool] = mapped_column(default=False)
    creator_id: Mapped[str] = mapped_column(String(40), ForeignKey("users.id"))
    owner_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("users.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(String(40), default="new_request")
    titan_spoc: Mapped[str] = mapped_column(String(100), nullable=True)
    imitra_ticket_id: Mapped[str] = mapped_column(String(40), nullable=True)

    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    app_url: Mapped[str] = mapped_column(Text, nullable=True)

    user_type: Mapped[str] = mapped_column(String(252), nullable=True)
    data_type: Mapped[str] = mapped_column(String(252), nullable=True)

    app_type: Mapped[str] = mapped_column(String(100), nullable=True)
    is_app_ai: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)

    question_set_id: Mapped[int | None] = mapped_column(
        ForeignKey("question_sets.id", ondelete="set null"),
        nullable=True,
    )

    # -- Relationships --
    creator = relationship(
        "User", back_populates="created_applications", foreign_keys=[creator_id]
    )
    owner = relationship(
        "User", back_populates="owned_applications", foreign_keys=[owner_id]
    )
    comments = relationship("Comment", back_populates="application")
    departments = relationship(
        "Department", secondary="application_departments", back_populates="applications"
    )
    evidences = relationship("ApplicationEvidence", back_populates="application")

    question_set = relationship("AppQuestionSet")
    answers = relationship(
        "ApplicationAnswer",
        back_populates="application",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<app_id={self.id}, app_name={self.name}>"
