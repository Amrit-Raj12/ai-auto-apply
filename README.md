# AI Job Automation Platform

This project is an AI-powered job application automation platform for Naukri.com. It uses human-like browser automation, AI-driven filtering, and voice/text commands.

## Architecture

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion (Real-time dashboard and voice input).
- **Backend**: FastAPI (Python), SQLAlchemy (API and Orchestration).
- **Automation**: Playwright (Python) (Human-like scraping and application).
- **AI Filtering**: OpenAI (Match scoring and intent parsing).
- **Database**: PostgreSQL (Data persistence).

## Project Structure

```text
/
├── frontend/             # Next.js Application
│   ├── app/              # Routes (Dashboard, Profile)
│   ├── components/       # UI Components (Voice Command Bar, Sidebar)
│   └── ...
├── backend/              # FastAPI Application
│   ├── app/
│   │   ├── api/          # API Endpoints
│   │   ├── services/     # Core logic (AI, Automation, Intent Parsing)
│   │   └── database/     # SQLAlchemy Models & Config
│   └── ...
├── docker-compose.yml    # PostgreSQL Setup
└── requirements.txt      # Python Dependencies
```

## Getting Started

1. **Database**: Run `docker-compose up -d`.
2. **Backend**:
   - `cd backend`
   - Create environment: `python -m venv venv`
   - Activate: `.\venv\Scripts\activate`
   - Install: `pip install -r requirements.txt` (or manually install needed pkgs)
   - Setup `.env` with OpenAI keys and Naukri credentials.
   - Run: `uvicorn app.main:app --reload`
3. **Frontend**:
   - `cd frontend`
   - Install: `npm install`
   - Run: `npm run dev`

## Commands to Try
- "Apply to latest 5 React jobs in Bangalore"
- "Search for Frontend Developer roles"
- "Update my profile with my new resume"
