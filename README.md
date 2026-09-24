# TutorHub

TutorHub is a full-stack tuition marketplace inspired by Bangladesh's Tuition Terminal platform. It combines a React + TypeScript frontend with a Django REST API backend to support tutor discovery, tuition job listings, applications, requirements, dashboards, and role-based workflows.

## Overview

This repository contains two major parts:

- Frontend: a Vite-based React application for the public website and authenticated user portals
- Backend: a Django project with modular apps for accounts, tutors, tuition jobs, applications, requirements, content, and dashboard APIs

The project is designed to mirror the public UX of a tuition matching platform while providing a working backend API foundation for real product flows.

## Tech stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form + Zod
- TanStack Query
- Lucide React icons

### Backend
- Python 3.12+
- Django 5.x
- Django REST Framework
- PostgreSQL support via Docker / SQLite for local quick start
- Simple JWT
- django-filter
- drf-spectacular
- Celery + Redis
- CORS support and environment-based config

## Project structure

```text
TutorHub/
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── affiliates/
│   │   ├── applications/
│   │   ├── categories/
│   │   ├── content/
│   │   ├── dashboard/
│   │   ├── locations/
│   │   ├── requirements/
│   │   ├── reviews/
│   │   ├── testimonials/
│   │   ├── tuition_jobs/
│   │   └── tutors/
│   ├── config/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── db.sqlite3
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker-compose.yml
├── README.md
├── Tuition Terminal — Django REST Backend Master Prompt.md
├── Tuition Terminal — Full Website Clone Master Prompt.md
└── ...
```

## Key features

- Public tuition marketplace pages: home, job board, tutor search, category pages, blog, FAQ, gallery, and policy pages
- Tutor and guardian-facing workflows for applying to jobs and posting requirements
- Role-aware dashboard screens for tutors, students/parents, and admins
- API-first backend architecture for listing, filtering, and retrieving tutor and tuition-job data
- JWT-based authentication and permission handling
- OpenAPI schema and interactive Swagger docs
- Docker-based local setup for the full stack

## Backend architecture

The backend is organized into modular Django apps under `backend/apps`. Some of the main API areas include:

- `accounts` — users, authentication, and profile support
- `tutors` — tutor profiles and educational data
- `tuition_jobs` — tuition opportunities and job listings
- `applications` — tutor job applications
- `requirements` — parent/student tuition requirement submissions
- `categories` — subjects and service categories
- `locations` — city and area data
- `content` — FAQs, blog posts, and other informational content
- `dashboard` — summary and analytics data endpoints

The project root URL configuration mounts these APIs under `/api/v1/`.

## Frontend routes

The frontend app includes public pages and dashboard views such as:

- `/`
- `/job-board`
- `/job-board/:jobId`
- `/find-tutor`
- `/hub/tutor-details/:tutorId`
- `/become-a-tutor`
- `/appoint-a-tutor`
- `/blog`
- `/faq`
- `/dashboard`
- `/dashboard/profile`
- `/dashboard/applications`

## Quick start

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker Desktop or Docker Engine (optional but recommended)

### Option 1: Run with Docker Compose

From the project root:

```bash
docker compose up --build
```

This will start:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/api/docs/
- Admin: http://localhost:8000/admin/

> The Docker setup uses PostgreSQL and Redis services defined in `docker-compose.yml`.

### Option 2: Run locally without Docker

#### Backend

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

By default, the app uses SQLite for local development. The API will run at:

- http://localhost:8000
- http://localhost:8000/api/docs/

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

- http://localhost:5173

## Environment and configuration

The backend is configured to read environment values such as:

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`

The project includes environment-aware settings in:

- `backend/config/settings/base.py`
- `backend/config/settings/development.py`
- `backend/config/settings/production.py`

## API highlights

Key API routes mounted from the Django project include:

- `/api/v1/auth/`
- `/api/v1/tutors/`
- `/api/v1/jobs/`
- `/api/v1/applications/`
- `/api/v1/requirements/`
- `/api/v1/categories/`
- `/api/v1/locations/`
- `/api/v1/content/`
- `/api/v1/dashboard/`

Swagger/OpenAPI docs are enabled through `drf-spectacular`:

- `/api/schema/`
- `/api/docs/`
- `/api/redoc/`

## Notes

- This project is a full-stack tuition marketplace clone and learning project, not a production deployment template out of the box.
- Local development starts with SQLite by default; Docker uses PostgreSQL and Redis for a closer production-like environment.
- The frontend and backend are separated cleanly, making it easy to evolve each side independently.

## Suggested next steps

- Add proper seeded demo data for tutors, jobs, and requirements
- Configure production environment variables and deployment settings
- Add real user registration and upload flows
- Expand dashboard analytics and moderation features
- Add tests across API endpoints and frontend flows

## License

A repository license file was not found in the project root at the time of writing, so this README does not claim a specific license. If you plan to publish or distribute the code, add an explicit license file before release.
