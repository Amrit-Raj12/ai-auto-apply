from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv, find_dotenv

# Load local environment variables if they exist
load_dotenv(find_dotenv(".env.local"))
load_dotenv() # Fallback to .env if needed

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/job_automation")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
