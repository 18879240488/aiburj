# aiburj — AI API Aggregation Platform
# Phase 1: Environment Setup

## Stack
- Backend: Python 3.11+ FastAPI, SQLAlchemy, SQLite
- Frontend: Next.js 14, Tailwind CSS
- Auth: JWT + API Key
- API Format: OpenAI-compatible

## Project Structure
```
backend/
  app/
    main.py          # FastAPI entry
    core/config.py   # Settings
    models/          # SQLAlchemy models
    api/             # Route handlers
frontend/            # Next.js app
```

## Commands
```bash
# Backend
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev
```

## Conventions
- Python: type hints, async where possible, PEP 8
- Commit: feat/fix/docs/chore prefix
- Branch: main for stable, feature branches for work
