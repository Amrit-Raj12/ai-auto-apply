from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from .database.database import engine, Base, get_db
from .database import models
from .schemas import schemas
from .services.intent_service import IntentService

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Job Automator API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, allow all. Change to specific frontend URL for production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI Job Automator API is running"}

@app.post("/command")
async def process_command(
    request: schemas.CommandRequest, 
    background_tasks: BackgroundTasks
):
    """
    Process voice or text commands like:
    'Apply to latest 10 React jobs'
    """
    service = IntentService()
    
    # In a real app, user_id would come from Auth/JWT
    # For MVP, using user_id=1
    background_tasks.add_task(service.execute_command, 1, request.command)
    
    return {
        "intent": "PROCESSING",
        "action": "SCRAPE_AND_APPLY",
        "entities": {},
        "message": f"Your request '{request.command}' is being processed in the background. Check the dashboard for updates."
    }

@app.get("/jobs")
def get_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Perform a join or subquery to get application status for each job
    results = []
    jobs = db.query(models.Job).order_by(models.Job.scraped_at.desc()).offset(skip).limit(limit).all()
    
    for job in jobs:
        # Get the latest application for this job
        app = db.query(models.Application).filter(models.Application.job_id == job.id).first()
        results.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "platform_job_id": job.platform_job_id,
            "url": job.url,
            "location": job.location,
            "scraped_at": job.scraped_at,
            "status": app.status if app else "pending",
            "match_score": app.match_score if app else 0,
            "ai_analysis": app.ai_analysis if app else None
        })
    return results

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_jobs = db.query(models.Job).count()
    applied_jobs = db.query(models.Application).filter(models.Application.status == "applied").count()
    skipped_jobs = db.query(models.Application).filter(models.Application.status == "skipped").count()
    
    return {
        "total_jobs_found": total_jobs,
        "total_applied": applied_jobs,
        "total_skipped": skipped_jobs,
        "success_rate": (applied_jobs / total_jobs * 100) if total_jobs > 0 else 0
    }
