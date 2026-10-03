# TutorHub — AI-Powered Tuition Matching & Learning Platform

TutorHub is a full-stack, authenticated-first tuition matching, direct messaging, and peer learning platform. Built with React 19 + TypeScript on the frontend and Django 5 + Django REST Framework on the backend, it features Google Gemini AI integration, real-time student-tutor messaging, interactive community discussions, tutor reviews with AI insights, and role-scoped dashboards.

---

## 🚀 Key Product Features

### 1. Simplified 3-Role System
The platform strictly supports three roles:
- **`STUDENT`**: Browse verified tutors, post tuition jobs, message tutors directly, submit ratings & reviews, and engage in the community feed.
- **`TUTOR`**: Build comprehensive tutor profiles, apply to tuition jobs, message interested students, track performance metrics, and share educational posts.
- **`ADMIN`**: Platform-wide user management, tutor verification, job moderation, and analytics.

*(Note: The legacy `PARENT` role was completely sunset and migrated to `STUDENT` across the database and user interfaces).*

### 2. Google Gemini AI Integration
A pluggable AI service architecture powered by Google's Gemini API (`gemini-1.5-flash`):
- **Tutor Review Summarization & Sentiment:** Analyzes student reviews to generate an executive AI summary, sentiment breakdown, and highlighted tutor strengths.
- **AI Tutor Recommendations:** Recommends the best matching tutors based on a student's subjects, budget range, and learning requirements.
- **Community Feed Personalization:** "AI For You" ranking that prioritizes academic and relevant posts for learners.
- **Resilient Heuristics Fallback:** If `GEMINI_API_KEY` is not configured or network requests fail, the platform automatically falls back to deterministic rule-based algorithms with zero user interruption.

### 3. Student ↔ Tutor Direct Messaging
- **Real-Time Split Screen Chat:** Student and tutor can engage in 1-on-1 private conversations.
- **Conversation Management:** Automatic participant binding, unread message badges, last message previews, and responsive mobile-ready sidebar.
- **One-Click Contact:** "Message Tutor" direct CTA buttons on tutor profile pages.

### 4. Community Feed & Social Discussions
- **Peer & Educator Posts:** Share questions, study tips, tuition notices, and general discussions.
- **Category Filtering:** Filter posts by `Academic`, `Tuition Advice`, `Exam Prep`, `Career`, etc.
- **Engagement:** Like posts, comment in threads, and report inappropriate content.
- **Toggleable AI Curation:** Switch between "Latest" and "AI Recommended" feeds.

### 5. Tutor Reviews & Rating Distribution
- **Verified Student Feedback:** 1 to 5-star ratings with detailed written feedback.
- **Rating Distribution Breakdown:** Visual distribution bars (5★ through 1★) with total review counts and average rating calculation.
- **AI Insights Card:** Highlights overall student sentiment and key teaching strengths.
- **Anti-Self-Review:** Tutors cannot review themselves.

### 6. In-App Notifications
- **Header Notification Bell:** Live unread count badge in the navigation bar.
- **Interactive Dropdown:** View recent messages, review notices, and application updates.
- **Mark as Read:** One-click single item or "Mark all as read" API synchronization.

### 7. Advanced Tutor Search with Budget Filters
- Search by subject, university, city/district, location, tuition type (Online, Home, Group).
- **Budget Range Filtering:** `min_budget` and `max_budget` parameters accurately filter tutors by their expected monthly salary (৳ BDT).
- **AI Recommendation Sorting:** Toggle to order results using Gemini AI matching criteria.

### 8. Authenticated-First Experience
- Unauthenticated access is restricted to `/login`, `/register`, and `/forgot-password`.
- Root path (`/`) dynamically redirects authenticated users to `/feed` and guests to `/login`.
- Global JWT token interceptor automatically handles authorization headers and session expiration.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Vanilla CSS Design System
- **Routing:** React Router v7
- **State & Data Fetching:** TanStack React Query v5 + Axios
- **Forms & Validation:** React Hook Form + Zod
- **Icons:** Lucide React

### Backend
- **Framework:** Django 5.x + Django REST Framework (DRF)
- **Language:** Python 3.12+
- **AI Provider:** Google Gemini API (`gemini-1.5-flash`) via `backend/apps/ai/`
- **Authentication:** SimpleJWT (JSON Web Tokens)
- **Database:** SQLite (development) / PostgreSQL (production)
- **Task Queue:** Celery + Redis
- **Documentation:** OpenAPI 3 schema via `drf-spectacular`

---

## 📁 Repository Structure

```text
tutor_hub/
├── backend/
│   ├── apps/
│   │   ├── accounts/          # User model (STUDENT, TUTOR, ADMIN), JWT auth
│   │   ├── ai/                # BaseAIService & GeminiAIService integration
│   │   ├── applications/      # Tutor applications for tuition jobs
│   │   ├── categories/        # Tuition subjects and grade categories
│   │   ├── content/           # FAQs, policies, site content
│   │   ├── dashboard/         # Role-tailored dashboard analytics
│   │   ├── locations/         # Bangladesh divisions, districts, areas
│   │   ├── messaging/         # Conversation and Message models & APIs
│   │   ├── notifications/     # In-app notification delivery and read status
│   │   ├── posts/             # Community social feed, likes, comments, reports
│   │   ├── requirements/      # Student tuition requirement postings
│   │   ├── reviews/           # Tutor reviews, rating distribution & AI insights
│   │   ├── tuition_jobs/      # Tuition job board listings
│   │   └── tutors/            # Tutor profiles, qualifications & budget filters
│   ├── config/
│   │   ├── settings/          # base.py, development.py, production.py
│   │   ├── urls.py            # API v1 routes mount
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios API clients (ai, messaging, posts, reviews, tutors...)
│   │   ├── components/        # Layout, Dashboard, Tutor, Common UI components
│   │   ├── context/           # AuthContext (JWT session state)
│   │   ├── pages/             # Feed, Messages, FindTutor, TutorDetails, JobBoard, Dashboards...
│   │   ├── types/             # TypeScript interfaces and enum types
│   │   ├── App.tsx            # Protected routing and layout hierarchy
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js:** 20+
- **Python:** 3.12+
- **Git**

---

### Backend Setup

1. **Navigate to the backend directory and activate virtual environment:**
   ```bash
   cd backend

   # On Windows (PowerShell):
   .\env\Scripts\activate
   # On macOS/Linux:
   source env/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in `backend/` or export the variables:
   ```env
   SECRET_KEY=your-django-secret-key
   DEBUG=True
   ALLOWED_HOSTS=*
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

   # Google Gemini AI Configuration
   GEMINI_API_KEY=your_gemini_api_key_here
   AI_MODEL=gemini-1.5-flash
   AI_PROVIDER=gemini
   ```
   > **Note:** If `GEMINI_API_KEY` is omitted, all AI endpoints automatically use heuristic fallback algorithms so development never breaks.

4. **Run migrations and start backend server:**
   ```bash
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```
   The backend API will be live at `http://127.0.0.1:8000/`.

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173/`.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🧪 Testing

### Backend Test Suite
Run the full automated test suite covering messaging, posts, reviews, tutors, and dashboard analytics:
```bash
cd backend
python manage.py test
```
All tests verify role permissions, AI fallback behavior, and database integrity.

### Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

---

## 📡 Key API Endpoints (`/api/v1/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login/` | Obtain JWT access and refresh tokens |
| `POST` | `/api/v1/auth/register/` | Register as `STUDENT` or `TUTOR` |
| `GET` | `/api/v1/auth/me/` | Current user profile and role details |
| `GET` | `/api/v1/ai/status/` | Inspect AI engine status and active provider |
| `POST` | `/api/v1/ai/recommend-tutors/` | Gemini-powered tutor matching |
| `POST` | `/api/v1/ai/summarize-tutor-reviews/` | Gemini-powered review summary & sentiment analysis |
| `GET` | `/api/v1/conversations/` | List current user's messaging conversations |
| `POST` | `/api/v1/conversations/` | Start a new conversation with a tutor/student |
| `GET` | `/api/v1/conversations/<id>/messages/` | Get messages in a conversation |
| `POST` | `/api/v1/conversations/<id>/messages/` | Send a message |
| `GET` | `/api/v1/posts/` | Community feed posts (supports `?category=` and `?for_you=true`) |
| `POST` | `/api/v1/posts/` | Create a new community post |
| `POST` | `/api/v1/posts/<id>/like/` | Like or unlike a post |
| `POST` | `/api/v1/posts/<id>/comment/` | Comment on a post |
| `GET` | `/api/v1/reviews/tutor/<id>/` | Tutor reviews with AI insights and rating distribution |
| `POST` | `/api/v1/reviews/` | Submit a new tutor review (students only) |
| `GET` | `/api/v1/notifications/` | Get user notifications with unread count |
| `POST` | `/api/v1/notifications/read-all/` | Mark all notifications as read |
| `GET` | `/api/v1/tutors/` | Search tutors with `min_budget`, `max_budget`, subjects, etc. |
| `GET` | `/api/v1/dashboard/` | Role-tailored dashboard metrics |

---

## 🔒 Security & Roles
- **Role Isolation:** API endpoints enforce permissions using role checks. Students cannot post tutor reviews on their own profiles, tutors cannot review themselves, and users can only view their own conversations and notifications.
- **Authenticated-First Security:** Default permission class is `IsAuthenticated`. Anonymous requests are rejected across all private resources.
