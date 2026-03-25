from db.base import Base
from sqlalchemy import String, Integer, ForeignKey, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone


class Vertical(Base):
    __tablename__ = "verticals"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(70), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)

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

    # -----------------------Relationships-----------------------
    applications = relationship("Application", back_populates="app_vertical")
    owner_links = relationship("VerticalOwnerMap", back_populates="vertical")
    owners = relationship(
        "User", secondary="vertical_owner_map", overlaps="owner_links,vertical_links"
    )


class VerticalOwnerMap(Base):
    __tablename__ = "vertical_owner_map"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vertical_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("verticals.id", ondelete="cascade", onupdate="cascade"),
    )
    user_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("users.id", ondelete="cascade", onupdate="cascade")
    )

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

    # -----------------------Relationships-----------------------
    vertical = relationship("Vertical", back_populates="owner_links", overlaps="owners")
    owner = relationship("User", back_populates="vertical_links", overlaps="owners")
    __table_args__ = (
        UniqueConstraint("vertical_id", "user_id", name="uq_vertical_user"),
    )
