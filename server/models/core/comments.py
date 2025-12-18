from sqlalchemy import String, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped, mapped_column
from db.base import Base, BaseMixin


class Comment(Base, BaseMixin):
    __tablename__ = "comments"

    content: Mapped[str] = mapped_column(Text, nullable=False)
    author_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("users.id"), nullable=False
    )
    application_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("applications.id"), nullable=False
    )
    department_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("departments.id"), nullable=False
    )
    # -- Relationships --

    author = relationship("User", back_populates="comments")
    application = relationship("Application", back_populates="comments")
    department = relationship("Department", back_populates="comments")
