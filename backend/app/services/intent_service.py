import asyncio
from sqlalchemy.orm import Session
from .ai.ai_handler import AIHandler
from .automation.naukri_automator import NaukriAutomator
from ..database import models
from ..database.database import SessionLocal # Import SessionLocal
import os

class IntentService:
    def __init__(self): # Remove db from init
        self.ai = AIHandler()
        self.automator = NaukriAutomator(headless=os.getenv("HEADLESS", "False") == "True")

    async def execute_command(self, user_id: int, command: str):
        # Create a fresh database session for the background task
        # Use 'with' to ensure it's closed even if an error occurs
        with SessionLocal() as db:
            # 1. Parse Intent (AI portion remains async)
            print(f"Parsing intent for: {command}")
            parsed = await asyncio.to_thread(self.ai.parse_intent, command)
            intent = parsed.get("intent")
            entities = parsed.get("entities", {})

            if intent == "APPLY_JOBS":
                keyword = entities.get("keyword", "Software Engineer")
                limit = entities.get("limit", 10)
                
                # 2. Start Automator (Run in separate thread)
                print(f"Starting automation thread for: {keyword}")
                await asyncio.to_thread(self.automator.start)
                
                # 3. Login
                user = db.query(models.User).filter(models.User.id == user_id).first()
                if user:
                    email = os.getenv("NAUKRI_EMAIL")
                    password = os.getenv("NAUKRI_PASSWORD")
                    await asyncio.to_thread(self.automator.login, email, password)

                # 4. Search and Process
                jobs_data = await asyncio.to_thread(self.automator.search_jobs, keyword)
                
                for job_data in jobs_data[:min(len(jobs_data), limit)]:
                    # Save job to DB (Check if exists first to avoid duplicates)
                    db_job = db.query(models.Job).filter(models.Job.platform_job_id == job_data['platform_job_id']).first()
                    if not db_job:
                        db_job = models.Job(**job_data)
                        db.add(db_job)
                        db.commit()
                        db.refresh(db_job)

                    # 5. AI Match Score
                    score_data = await asyncio.to_thread(self.ai.score_job, job_data['title'], user.resume_text if user else "")
                    print(f"Job: {job_data['title']} | Score: {score_data.get('score')}")

                    # 6. Apply if score is high enough
                    if score_data.get("score", 0) > 70:
                        success = await asyncio.to_thread(self.automator.apply_to_job, job_data['url'], {})
                        status = "applied" if success else "failed"
                    else:
                        status = "skipped"

                    # 7. Log Application
                    app_log = models.Application(
                        user_id=user_id,
                        job_id=db_job.id,
                        match_score=score_data.get("score"),
                        ai_analysis=score_data.get("reason"),
                        status=status
                    )
                    db.add(app_log)
                    db.commit()

                # Clean up
                await asyncio.to_thread(self.automator.stop)
                print(f"Successfully processed jobs for '{keyword}'.")
                return
            
            print("Command recognized but task not yet implemented or unknown.")
