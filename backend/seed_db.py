from app.database.database import SessionLocal
from app.database import models
import os

def seed():
    db = SessionLocal()
    try:
        # Check if user exists
        user = db.query(models.User).filter(models.User.id == 1).first()
        if not user:
            print("Creating default user (ID=1)...")
            new_user = models.User(
                id=1,
                email=os.getenv("NAUKRI_EMAIL", "admin@example.com"),
                full_name="Default User",
                resume_text="I am a software engineer with experience in React and Python.",
                experience_years=2.0,
                current_ctc=1000000.0,
                expected_ctc=1500000.0,
                notice_period_days=30,
                location_pref="Bengaluru"
            )
            db.add(new_user)
            db.commit()
            print("User created successfully.")
        else:
            print("User already exists.")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
