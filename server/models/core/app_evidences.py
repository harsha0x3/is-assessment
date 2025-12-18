from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from db.base import Base, BaseMixin


class ApplicationEvidence(Base, BaseMixin):
    __tablename__ = "application_evidences"

    application_id = mapped_column(
        String(40), ForeignKey("applications.id"), nullable=False
    )
    evidence_path = mapped_column(String(888), nullable=False)

    # -- Relationships --
