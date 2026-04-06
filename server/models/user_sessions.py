from sqlalchemy import ForeignKey, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base, BaseMixin
from services.auth.utils import hash_token, verify_token
from datetime import datetime


class UserSession(Base, BaseMixin):
    __tablename__ = "user_sessions"

    user_id: Mapped[str] = mapped_column(
        String(40), ForeignKey("users.id"), nullable=False
    )

    refresh_token_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    access_token_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    csrf_token: Mapped[str] = mapped_column(String(255), nullable=False)

    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(
        String(45), nullable=True
    )  # IPv6 safe

    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user = relationship("User", back_populates="sessions")

    def set_refresh_token(self, refresh_token: str) -> None:
        self.refresh_token_hash = hash_token(refresh_token)

    def verify_refresh_token(self, plain_refresh_token: str) -> bool:
        return verify_token(
            token=plain_refresh_token, hashed_token=self.refresh_token_hash
        )

    def set_access_token(self, access_token: str) -> None:
        self.access_token_hash = hash_token(access_token)

    def verify_access_token(self, plain_access_token: str) -> bool:
        return verify_token(
            token=plain_access_token, hashed_token=self.access_token_hash
        )
