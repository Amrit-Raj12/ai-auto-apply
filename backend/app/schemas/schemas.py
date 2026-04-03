from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    resume_text: Optional[str] = None
    experience_years: Optional[float] = None
    current_ctc: Optional[float] = None
    expected_ctc: Optional[float] = None
    notice_period_days: Optional[int] = None
    location_pref: Optional[str] = None
    skills: Optional[str] = None

    class Config:
        from_attributes = True

class JobBase(BaseModel):
    platform_job_id: str
    title: str
    company: str
    location: Optional[str] = None
    salary: Optional[str] = None
    experience_req: Optional[str] = None
    url: str

class Job(JobBase):
    id: int
    scraped_at: datetime

    class Config:
        from_attributes = True

class ApplicationBase(BaseModel):
    user_id: int
    job_id: int
    status: str

class ApplicationCreate(ApplicationBase):
    match_score: float
    ai_analysis: str

class Application(ApplicationBase):
    id: int
    applied_at: datetime
    match_score: float
    ai_analysis: str
    form_data_sent: Optional[str] = None

    class Config:
        from_attributes = True

class CommandRequest(BaseModel):
    command: str

class CommandResponse(BaseModel):
    intent: str
    action: str
    entities: dict
    message: str
