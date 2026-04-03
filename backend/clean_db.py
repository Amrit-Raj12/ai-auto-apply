from app.database.database import SessionLocal
from app.database import models

def clean():
    db = SessionLocal()
    try:
        # Update jobs with null location instead of deleting
        print("Fixing jobs with missing locations...")
        updated = db.query(models.Job).filter(models.Job.location == None).update({"location": "Remote/India"})
        db.commit()
        print(f"Updated {updated} job entries with default location.")
    except Exception as e:
        print(f"Error updating database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clean()
