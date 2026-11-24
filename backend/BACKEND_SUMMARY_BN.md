# TutorHub Backend — বিস্তারিত সারাংশ

## ১. Backend-এর ভূমিকা

TutorHub backend একটি REST API ভিত্তিক tuition marketplace platform। এটি tuition, tutor profile, student requirement, application, review, community post, messaging, notification, affiliate এবং administration-এর কাজ পরিচালনা করে।

Backend-এ মূল framework হলো **Django 5** এবং API layer হিসেবে ব্যবহৃত হয়েছে **Django REST Framework (DRF)**। Authentication, authorization, validation, serialization, pagination এবং OpenAPI documentation-এর জন্য Django ecosystem-এর package ব্যবহার করা হয়েছে।

## ২. মূল প্রযুক্তি ও package

- **Python 3.12**: Backend runtime
- **Django 5**: MVC/MVT-এর বদলে Django app এবং ORM architecture
- **Django REST Framework (DRF)**: REST API views, serializers এবং permissions
- **SimpleJWT**: Access এবং refresh token authentication
- **django-cors-headers**: Frontend থেকে CORS-enabled API access
- **django-filter**: Query parameter-based filtering
- **drf-spectacular**: OpenAPI 3 schema, Swagger এবং Redoc
- **Pillow**: Image validation, EXIF correction এবং avatar optimization
- **Celery**: Background task framework
- **Redis**: Celery broker এবং cache/message infrastructure
- **Gunicorn**: Production WSGI server option
- **python-dotenv**: Environment variable loading
- **PyMySQL**: Production MySQL/MariaDB driver
- **SQLite**: Development database
- **PostgreSQL**: Docker Compose database service
- **Docker / Docker Compose**: Backend, frontend, database এবং Redis orchestration

মূল dependencyগুলো [`backend/requirements.txt`](requirements.txt)-এ সংরক্ষিত আছে।

## ৩. Backend folder structure

```text
backend/
├── apps/
│   ├── accounts/          # Custom user, JWT auth, profile image, role switching
│   ├── affiliates/        # Affiliate partner registration এবং statistics
│   ├── ai/                # Gemini AI এবং heuristic fallback services
│   ├── applications/      # Tuition job application lifecycle
│   ├── categories/        # Subjects এবং service categories
│   ├── common/            # Shared models, permissions, pagination, exceptions, image utilities
│   ├── content/           # Blog, FAQ, team, career এবং gallery content
│   ├── dashboard/         # Role-based dashboard, platform statistics, admin management
│   ├── locations/         # City এবং area/location data
│   ├── messaging/         # Conversation এবং direct message APIs
│   ├── notifications/     # In-app notification এবং read status
│   ├── posts/             # Community feed, likes, comments এবং reports
│   ├── requirements/      # Student tuition requirements এবং tutor matching
│   ├── reviews/           # Tutor reviews, ratings এবং AI insight
│   ├── testimonials/      # Published testimonial data
│   ├── tuition_jobs/      # Tuition job listing এবং CRUD
│   └── tutors/            # Tutor profile, education, experience এবং search
├── config/
│   ├── settings/
│   │   ├── base.py        # Shared Django এবং DRF configuration
│   │   ├── development.py # SQLite এবং development settings
│   │   └── production.py  # MySQL এবং production security settings
│   ├── asgi.py            # ASGI application entry point
│   ├── wsgi.py            # WSGI application entry point
│   ├── celery.py          # Celery app configuration
│   └── urls.py            # Root URL routing এবং API documentation routes
├── env/                   # Local Python virtual environment
├── media/                 # Uploaded profile, post এবং content media
├── db.sqlite3             # Development SQLite database
├── Dockerfile             # Python 3.12 Docker image setup
├── manage.py              # Django management entry point
├── requirements.txt       # Python dependencies
└── tests.py/              # App-level test modules
```

প্রতিটি domain app সাধারণত নিচের Django component ধরে:

- `models.py`: Database model
- `serializers.py`: Request/response data conversion
- `views.py`: API controller এবং business logic
- `urls.py`: App-local endpoint routing
- `admin.py`: Django admin registration
- `apps.py`: Django app configuration
- `migrations/`: Schema migration history
- `tests.py`: App-level automated tests

## ৪. Application architecture

### 4.1 Accounts

`accounts` app custom user model প্রদান করে। Supported role হলো:

- `STUDENT`
- `TUTOR`
- `ADMIN`

Features:

- Registration এবং login
- SimpleJWT access/refresh token
- `/auth/me/` দিয়ে current user read/update
- Profile avatar upload এবং delete
- Avatar image square crop, resize এবং WebP optimization
- Role switching
- Custom user manager
- Django permissions mixins

Profile image upload-এর maximum size 10 MB। Image normalizer EXIF orientation ব্যবহার করে সঠিক rotation করে, 400x400 resolution পর্যন্ত resize করে এবং metadata strip করে।

### 4.2 Tutors

Tutor domain-এ:

- Tutor profile
- University, department এবং academic qualification
- Education records
- Experience records
- City, area এবং preferred locations
- Subjects, classes এবং curriculum
- Tuition fee expectation
- Verification status
- Availability এবং featured status
- Rating এবং completed tuition statistics

Tutor profile detail এবং list-এর জন্য আলাদা DRF serializers আছে।

### 4.3 Tuition jobs এবং requirements

- `tuition_jobs`: Student বা institution-এর tuition job listing
- `requirements`: Student-এর learning requirement পোস্ট
- Requirement-এর উপর ভিত্তি করে tutor matching score হিসাব
- Subject overlap, location proximity, tutor qualification, experience এবং rating দিয়ে ranking
- Selected tutor record করা

### 4.4 Applications

- Tutor job application submit করা
- Student বা tutor-এর নিজের applications দেখা
- Job owner-এর জন্য job-specific applications দেখা
- Application detail retrieve বা delete করা
- Application status management

### 4.5 Reviews

- Student থেকে tutor review এবং 1-5 star rating
- Tutor নিজের profile review করতে পারবে না
- Tutor-wise review overview
- Rating distribution
- AI-generated review insight ও sentiment support

### 4.6 Messaging

- 1-to-1 conversation
- Participant-based conversation access
- Conversation create/list/detail
- Message create/read/delete
- Sender name, role এবং avatar
- Current user-এর জন্য `is_mine` flag
- Unread message count
- Mark conversation as read

### 4.7 Notifications

- In-app notification list
- Single notification read
- Mark-all-as-read
- Unread count
- Notification linked to application, message অথবা platform event

### 4.8 Community posts

- Create, list, detail, update এবং delete post
- Category-based feed
- Post like/unlike
- Comments
- Report inappropriate content
- Author avatar এবং author information
- AI-based feed ranking support

### 4.9 AI

`apps/ai/` Gemini-compatible এবং fallback-based architecture দেয়।

- AI availability/status endpoint
- Tutor recommendation
- Tutor review summarization
- Gemini API configuration
- API failure বা missing key-এর ক্ষেত্রে deterministic heuristic fallback
- Product flow যাতে AI unavailable হলেও stop না করে

### 4.10 Dashboard

- Student dashboard statistics
- Tutor dashboard statistics
- Admin platform overview
- Platform-wide user/tutor/job/review count
- Admin resource list/detail/update/delete
- Tutor verification এবং availability management

### 4.11 Supporting domains

- `locations`: City এবং area
- `categories`: Service category এবং subcategory
- `affiliates`: Affiliate partner এবং affiliate registration stats
- `testimonials`: Homepage/client testimonial
- `content`: Blog, FAQ, team, career এবং gallery

## ৫. Authentication ও authorization

### Authentication

`JWTAuthentication` REST Framework-এর default authentication class। Frontend bearer token হিসেবে access token পাঠায়:

```http
Authorization: Bearer <access_token>
```

Token configuration:

- Access token lifetime: 1 day
- Refresh token lifetime: 7 days
- Refresh token rotation enabled
- Rotated refresh token blacklisting enabled
- Update last login enabled

### Permission model

Custom permission classes আছে:

- `IsTutor`
- `IsStudent`
- `IsParent` backward-compatible alias
- `IsAdminUserRole`
- `IsOwnerOrReadOnly`

REST Framework-এর permission class app এবং role অনুযায়ী endpoint protect করে। Admin, owner এবং read-only access object-level permission-এর মাধ্যমে নিয়ন্ত্রণ করা যায়।

## ৬. REST API routing

মূল API prefix হলো `/api/v1/`।

| Domain | Prefix |
|---|---|
| Authentication | `/api/v1/auth/` |
| Locations | `/api/v1/locations/` |
| Categories | `/api/v1/categories/` |
| Tutors | `/api/v1/tutors/` |
| Tuition jobs | `/api/v1/jobs/` |
| Applications | `/api/v1/applications/` |
| Requirements | `/api/v1/requirements/` |
| Reviews | `/api/v1/reviews/` |
| Testimonials | `/api/v1/testimonials/` |
| Affiliates | `/api/v1/affiliates/` |
| Content | `/api/v1/content/` |
| Dashboard | `/api/v1/dashboard/` |
| AI | `/api/v1/ai/` |
| Notifications | `/api/v1/notifications/` |
| Messaging | `/api/v1/conversations/` |
| Community posts | `/api/v1/posts/` |

Documentation routes:

- `/admin/`: Django Admin
- `/api/schema/`: OpenAPI schema
- `/api/docs/`: Swagger UI
- `/api/redoc/`: Redoc documentation

## ৭. Serialization এবং response conventions

DRF `ModelSerializer` ব্যবহার করে database model থেকে JSON response তৈরি করা হয়। Nested data-এর জন্য custom list/detail serializers রাখা হয়েছে, বিশেষ করে:

- Tutor list এবং detail আলাদা payload
- Job list এবং detail আলাদা payload
- Application create এবং read আলাদা payload
- Message serializer sender context এবং unread state দেয়

List endpoints pagination ব্যবহার করে। Default page size 12 এবং maximum 100। Paginated response:

```json
{
  "count": 0,
  "total_pages": 0,
  "current_page": 1,
  "next": null,
  "previous": null,
  "results": []
}
```

## ৮. Database configuration

Development-এ:

- SQLite
- Database file: `backend/db.sqlite3`
- `DEBUG=True`
- CORS allow-all configuration

Production-এ:

- MySQL configuration
- Environment variable-driven credentials
- SSL redirect optional
- Secure session এবং CSRF cookies
- `ALLOWED_HOSTS` environment থেকে split করে নেয়

Docker Compose-এ PostgreSQL 15 service আছে। Production settings MySQL ব্যবহার করে। এই difference deployment করার আগে resolve করা গুরুত্বপূর্ণ।

## ৯. Static ও media file handling

- `STATIC_URL=/static/`
- `STATIC_ROOT=staticfiles`
- `MEDIA_URL=/media/`
- `MEDIA_ROOT=backend/media`
- Development-এ Django `MEDIA_URL` serve করে
- Profile avatar বিশেষভাবে optimize করে `profiles/` media folder-এ save করা যায়
- Request context থাকলে image URL absolute URI হিসাবে build করা উচিত

Avatar loading fix-এর জন্য login এবং registration response-এ `UserSerializer`-কে `{'request': request}` context দেওয়া হয়েছে। এতে profile image `/media/...` relative URL-এর বদলে absolute loadable URL পায়।

## ১০. Django Admin

Django Admin `/admin/` route থেকে accessযোগ্য। Domain app-এর `admin.py` database objects verify/manage করার জন্য admin registration করে। Production environment-এ admin route protection এবং HTTPS ব্যবহার করা উচিত।

## ১১. Celery এবং Redis

Backend Celery integration রাখে:

- Celery app name: `tutorhub`
- Django settings namespace: `CELERY`
- Autodiscovery: Installed apps-এর tasks
- Redis Docker service
- Celery-ready architecture

বর্তমান compose service Redis 6379 port-এ চালু করার setup আছে। Heavy work, notification, AI বা future scheduled task Celery দিয়ে offload করা যেতে পারে।

## ১২. Docker setup

Docker Compose services:

- `backend`: Python Django API, port 8000
- `db`: PostgreSQL 15, port 5432
- `redis`: Redis 7, port 6379
- `frontend`: Node 20/Vite dev server, port 5173

Backend Docker image:

- Python 3.12 slim
- GCC এবং PostgreSQL development library install
- `requirements.txt` install
- Source copy
- Port 8000 expose
- Django runserver start

## 13. Environment variables

প্রধান environment variable:

- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`
- `SECURE_SSL_REDIRECT`
- `AI_PROVIDER`
- `AI_MODEL`
- `AI_API_KEY` / `GEMINI_API_KEY`
- `CELERY_BROKER_URL`

Sensitive credential কখনো source code বা git-এ commit করা উচিত নয়।

## 14. Testing

Backend test modules app-wise আছে, যেমন:

- Accounts avatar upload ও login URL test
- Dashboard tests
- Messaging tests

Test চালানোর সাধারণ command:

```powershell
cd backend
.\env\Scripts\python.exe manage.py test
```

নির্দিষ্ট app test:

```powershell
.\env\Scripts\python.exe manage.py test apps.accounts
```

System check:

```powershell
.\env\Scripts\python.exe manage.py check
```

## 15. Development run process

Backend locally চালানোর ধাপ:

```powershell
cd backend
.\env\Scripts\python.exe manage.py migrate
.\env\Scripts\python.exe manage.py runserver 0.0.0.0:8000
```

Docker দিয়ে চালানো:

```powershell
docker compose up --build
```

Backend API: `http://localhost:8000/`

Swagger UI: `http://localhost:8000/api/docs/`

## 16. Important implementation conventions

- Shared behavior `apps/common/`-এ রাখা হয়েছে
- API domain অনুযায়ী modular app হিসেবে ভাগ করা হয়েছে
- Permission role এবং ownership দিয়ে enforce করা হয়েছে
- Database object-এর জন্য Django ORM এবং migration ব্যবহার হয়েছে
- Request/response conversion DRF serializer দিয়ে করা হয়েছে
- Pagination reusable `StandardResultsSetPagination` থেকে নেওয়া হয়েছে
- Uploaded image server-side process করা হয়েছে
- AI system missing API key বা provider failure handle করার fallback রাখে
- API documentation এবং Django admin default tooling দিয়ে রাখা হয়েছে

## 17. Deployment-এর আগে যাচাইযোগ্য বিষয়

- Docker Compose PostgreSQL নিয়ে production settings MySQL mismatch সমাধান করা
- Production database migration PostgreSQL বা MySQL কোনটি হবে তা স্থির করা
- `SECRET_KEY`, API key এবং database password environment থেকে নেওয়া
- `ALLOWED_HOSTS` production domain নির্দিষ্ট করা
- HTTPS এবং secure cookie configuration enabled করা
- Media file storage local disk না হলে object storage ব্যবহার করা
- Static file production collect এবং serve strategy নির্ধারণ করা
- Celery worker আলাদা process হিসেবে চালানো
- Gunicorn চালিয়ে Django runserver ব্যবহার না করা
- CORS origin production frontend domain-এ সীমাবদ্ধ করা
- Database backup, migration rollback এবং health check যুক্ত করা
