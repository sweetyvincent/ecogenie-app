import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://ecogenie:ecogenie_pass@localhost:5432/ecogenie_db"
)

# Connect to database. In production, we'd use connection pooling.
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
  """FastAPI Dependency to get database session."""
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()
