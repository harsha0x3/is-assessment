from sqlalchemy import String, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped, mapped_column
from db.base import Base, BaseMixin


class Comment(Base, BaseMixin):
    __tablename__ = "comments"

    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=True)
    author_id: Mapped[str] = mapped_column(
        String(40),
        ForeignKey("users.id", ondelete="set null", onupdate="cascade"),
        nullable=True,
    )
    application_id: Mapped[str] = mapped_column(
        String(40),
        ForeignKey("applications.id", ondelete="cascade", onupdate="cascade"),
        nullable=False,
    )
    department_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("departments.id", ondelete="cascade", onupdate="cascade"),
        nullable=False,
    )
    # -- Relationships --

    author = relationship("User", back_populates="comments")
    application = relationship("Application", back_populates="comments")
    department = relationship("Department", back_populates="comments")
    evidences = relationship("ApplicationEvidence", back_populates="comment")
