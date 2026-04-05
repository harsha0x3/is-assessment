from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

from .base import Base
from .config import Config


def create_db_engine():
    engine = create_engine(
        url=Config.DATABASE_URL,
        poolclass=QueuePool,
        pool_size=Config.POOL_SIZE,
        max_overflow=Config.MAX_OVERFLOW,
        pool_timeout=Config.POOL_TIMEOUT,
        pool_recycle=Config.POOL_RECYCLE,
        echo=False,
    )
    return engine


engine = create_db_engine()


def create_session_factory():
    SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)
    return SessionLocal


SessionLocal = create_session_factory()


def get_db_conn() -> Generator:
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db():
    engine = create_db_engine()
    Base.metadata.create_all(engine)
