from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base, BaseMixin


class ApplicationEvidence(Base, BaseMixin):
    __tablename__ = "application_evidences"

    application_id = mapped_column(
        String(40), ForeignKey("applications.id", onupdate="cascade"), nullable=False
    )
    department_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("departments.id", onupdate="cascade"), nullable=True
    )
    comment_id = mapped_column(
        String(40), ForeignKey("comments.id", onupdate="cascade"), nullable=True
    )
    uploader_id = mapped_column(
        String(40), ForeignKey("users.id", onupdate="cascade"), nullable=False
    )
    evidence_path = mapped_column(String(888), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=True)

    # -- Relationships --

    comment = relationship("Comment", back_populates="evidences")
    application = relationship("Application", back_populates="evidences")
    uploader = relationship("User", back_populates="uploaded_evidences")
    department = relationship("Department", back_populates="evidences")
