from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    
    # Career Details
    resume_text = Column(Text)
    experience_years = Column(Float)
    current_ctc = Column(Float)
    expected_ctc = Column(Float)
    notice_period_days = Column(Integer)
    location_pref = Column(String)
    skills = Column(Text) # JSON or comma-separated
    
    # Playwright Session
    naukri_credentials = Column(Text) # Encrypted or JSON

    applications = relationship("Application", back_populates="user")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    platform_job_id = Column(String, unique=True, index=True)
    title = Column(String)
    company = Column(String)
    location = Column(String)
    salary = Column(String)
    experience_req = Column(String)
    description = Column(Text)
    url = Column(String)
    source = Column(String, default="naukri")
    scraped_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="job")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    
    match_score = Column(Float)
    ai_analysis = Column(Text) # Reason for applying/skipping
    status = Column(String) # "applied", "skipped", "failed", "pending"
    applied_at = Column(DateTime, default=datetime.utcnow)
    
    # Auto-filled data sent to the form
    form_data_sent = Column(Text) # JSON string of fields like Exp, CTC, etc.

    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String) # "LOGIN", "SCRAPE", "APPLY", "COMMAND"
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
