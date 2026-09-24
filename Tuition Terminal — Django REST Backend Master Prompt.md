# MASTER PROMPT — TUITION TERMINAL BACKEND

You are a senior Python/Django backend engineer and API architect.

Build a production-ready backend for a full recreation of the Tuition Terminal platform:

REFERENCE WEBSITE:
https://tuitionterminal.com.bd/

The backend must support the frontend application with real REST APIs rather than static/mock data.

Use the public website only as a reference for publicly visible functionality, page flows, entities, fields, and user interactions.

Do NOT copy proprietary source code.

---

# 1. TECHNOLOGY STACK

Use:

- Python 3.12+
- Django 5.x
- Django REST Framework
- PostgreSQL
- Simple JWT
- django-filter
- Celery
- Redis
- drf-spectacular
- Pillow
- django-cors-headers
- Gunicorn

Optional where appropriate:

- Cloudinary or S3-compatible object storage
- Firebase Cloud Messaging
- SMTP/email provider
- SMS provider

Use environment variables for all secrets and deployment configuration.

---

# 2. PROJECT STRUCTURE

Create a clean modular Django project.

Recommended:

backend/
│
├── manage.py
│
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   └── celery.py
│
├── apps/
│   ├── accounts/
│   ├── tutors/
│   ├── students/
│   ├── parents/
│   ├── categories/
│   ├── tuition_jobs/
│   ├── requirements/
│   ├── applications/
│   ├── reviews/
│   ├── testimonials/
│   ├── notifications/
│   ├── affiliates/
│   ├── content/
│   └── dashboard/
│
├── common/
│   ├── permissions/
│   ├── pagination/
│   ├── exceptions/
│   ├── responses/
│   ├── validators/
│   └── utils/
│
├── media/
├── static/
├── requirements.txt
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md

Keep apps logically separated.

Do not create one giant Django app.

---

# 3. ARCHITECTURE PRINCIPLES

Follow:

- RESTful API design
- thin views
- reusable serializers
- service layer for complex business logic
- model-level validation where appropriate
- database constraints
- indexes for frequently searched fields
- pagination
- filtering
- ordering
- permissions
- transactional operations
- consistent error responses

Avoid putting complex business logic directly inside serializers or views.

For complex operations use:

services.py

Example:

applications/services.py
requirements/services.py
tutors/services.py

---

# 4. API PREFIX

All APIs must use:

/api/v1/

Example:

/api/v1/auth/
/api/v1/tutors/
/api/v1/jobs/
/api/v1/categories/

Version the API from the beginning.

---

# 5. CUSTOM USER MODEL

Create a custom User model from the beginning.

Use UUID primary key.

Fields:

id
email
phone
password
first_name
last_name
profile_image
role
is_active
is_verified
is_staff
is_superuser
created_at
updated_at
last_login

Roles:

ADMIN
TUTOR
STUDENT
PARENT
STAFF

Use email as the primary authentication identifier.

Make email unique.

Normalize email.

---

# 6. USER ROLE MODEL

Implement role-based access control.

Example:

class UserRole:

ADMIN
STAFF
TUTOR
STUDENT
PARENT

Do not rely only on frontend role checks.

Every protected API must enforce backend permissions.

---

# 7. AUTHENTICATION

Implement JWT authentication.

Endpoints:

POST /api/v1/auth/register/
POST /api/v1/auth/login/
POST /api/v1/auth/token/refresh/
POST /api/v1/auth/logout/
GET /api/v1/auth/me/
POST /api/v1/auth/verify-email/
POST /api/v1/auth/resend-verification/
POST /api/v1/auth/forgot-password/
POST /api/v1/auth/reset-password/

Use:

Access token
Refresh token

Configure reasonable token lifetimes through environment variables.

---

# 8. REGISTRATION

Registration must support:

Tutor
Student
Parent

Example:

POST /api/v1/auth/register/

Request:

{
    "email": "user@example.com",
    "password": "strong-password",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "01XXXXXXXXX",
    "role": "TUTOR"
}

Validate:

- email
- password
- phone
- role
- duplicate accounts

Never return passwords.

---

# 9. EMAIL VERIFICATION

Implement email verification.

Flow:

1. User registers.
2. Backend creates verification token.
3. Email is sent asynchronously.
4. User clicks verification link.
5. Backend verifies account.

Use Django signing/token utilities.

Do not store raw verification tokens unnecessarily.

---

# 10. TUTOR PROFILE

Create:

TutorProfile

Fields should support:

user
tutor_id
profile_photo
date_of_birth
gender
about
present_address
permanent_address
city
area
education_level
university
department
graduation_year
experience_years
expected_salary
preferred_salary
teaching_experience
is_verified
is_available
profile_completion
created_at
updated_at

Use a generated public tutor ID.

Example:

TT-T-000001

Do not expose database IDs as public identifiers where unnecessary.

---

# 11. TUTOR EDUCATION

Create:

TutorEducation

Fields:

id
tutor
degree
institution
subject
department
passing_year
result
is_current

One tutor can have multiple education records.

---

# 12. TUTOR EXPERIENCE

Create:

TutorExperience

Fields:

id
tutor
organization
position
description
start_date
end_date
is_current

---

# 13. TUTOR SUBJECTS

Create:

Subject

Fields:

id
name
slug
category
is_active

Create tutor-subject relationship.

Support many-to-many relationships.

---

# 14. TUTOR PREFERENCES

Create:

TutorPreference

Fields:

tutor
preferred_classes
preferred_subjects
preferred_locations
preferred_gender
preferred_tuition_type
minimum_salary
maximum_salary
available_days
available_time

Use normalized relationships where appropriate.

---

# 15. TUTOR PROFILE COMPLETION

Implement automatic profile completion calculation.

Example:

Required:

- basic profile
- profile photo
- education
- subjects
- location
- experience
- preferences

Calculate:

0–100%

Expose:

GET /api/v1/tutors/me/completion/

Response:

{
    "percentage": 80,
    "missing_fields": [
        "profile_photo",
        "preferred_locations"
    ]
}

---

# 16. TUTOR SEARCH

Endpoint:

GET /api/v1/tutors/

Support:

?page=1
&page_size=20

Filters:

?city=Dhaka
&area=Mirpur
&gender=MALE
&subject=English
&class_level=HSC
&university=Dhaka University
&experience_min=2
&experience_max=10
&available=true
&verified=true

Search:

?search=Tamzid

Ordering:

?ordering=-created_at

Use django-filter.

Do not implement filtering manually in every view.

---

# 17. TUTOR DETAILS

Endpoint:

GET /api/v1/tutors/{tutor_id}/

Return:

- profile
- education
- experience
- subjects
- preferences
- reviews
- rating
- verification status

Public profile must not expose private information.

Do not expose:

- password
- private email unless intended
- private phone
- internal admin notes

---

# 18. TUITION JOB MODEL

Create:

TuitionJob

Fields:

id
job_id
title
description
student_name/private_identifier
class_level
subjects
location
city
area
tuition_type
preferred_tutor_gender
days_per_week
preferred_days
preferred_time
salary_min
salary_max
additional_requirements
status
posted_by
application_deadline
created_at
updated_at

Statuses:

DRAFT
PUBLISHED
PAUSED
CLOSED
CANCELLED

Generate public Job ID.

Example:

TT-J-000001

---

# 19. JOB BOARD API

Endpoints:

GET /api/v1/jobs/
GET /api/v1/jobs/{job_id}/
POST /api/v1/jobs/
PATCH /api/v1/jobs/{job_id}/
DELETE /api/v1/jobs/{job_id}/

Only authorized users can create jobs.

Admin/staff can manage all jobs.

Parents/students can manage their own jobs.

---

# 20. JOB FILTERING

Support filters:

job_id
city
area
subject
class_level
tuition_type
gender
salary_min
salary_max
days
status
posted_date

Example:

GET /api/v1/jobs/?city=Dhaka&subject=English&status=PUBLISHED

Search:

GET /api/v1/jobs/?search=TT-J-000001

Use django-filter.

---

# 21. JOB SEARCH BY JOB ID

Implement optimized Job ID lookup.

If the request is:

GET /api/v1/jobs/?job_id=TT-J-000001

Return matching job.

Add database index to job_id.

---

# 22. JOB APPLICATION

Create:

JobApplication

Fields:

id
application_id
job
tutor
cover_message
status
admin_note
applied_at
updated_at

Statuses:

PENDING
SHORTLISTED
SELECTED
REJECTED
WITHDRAWN

Prevent duplicate applications.

Database constraint:

unique(job, tutor)

---

# 23. APPLY TO JOB

Endpoint:

POST /api/v1/jobs/{job_id}/apply/

Example:

{
    "cover_message": "I am interested in this tuition..."
}

Rules:

- user must be a tutor
- tutor must be active
- tutor profile should be sufficiently complete
- job must be published
- job must not be closed
- tutor cannot apply twice

Use transaction.atomic().

---

# 24. APPLICATION LIST

Tutor:

GET /api/v1/applications/my/

Parent/student:

GET /api/v1/applications/job/{job_id}/

Admin:

GET /api/v1/admin/applications/

Support filtering by:

status
job
tutor
date

---

# 25. APPLICATION STATUS

Endpoint:

PATCH /api/v1/applications/{application_id}/status/

Only authorized users may change statuses.

When status changes:

- create notification
- optionally send email
- record status history

---

# 26. APPLICATION HISTORY

Create:

ApplicationStatusHistory

Fields:

application
old_status
new_status
changed_by
note
created_at

Never lose application history.

---

# 27. TUTOR REQUIREMENT

Create:

TutorRequirement

This represents a parent/student requesting a tutor.

Fields:

id
requirement_id
created_by
student_name
class_level
subjects
city
area
preferred_gender
tuition_type
days_per_week
preferred_days
preferred_time
budget_min
budget_max
additional_requirements
status
created_at
updated_at

Statuses:

DRAFT
SUBMITTED
MATCHING
SHORTLISTED
TUTOR_SELECTED
CLOSED
CANCELLED

---

# 28. REQUIREMENT API

Endpoints:

POST /api/v1/requirements/
GET /api/v1/requirements/
GET /api/v1/requirements/{id}/
PATCH /api/v1/requirements/{id}/
DELETE /api/v1/requirements/{id}/

Users can only manage their own requirements.

Admin/staff can manage all requirements.

---

# 29. TUTOR MATCHING

Implement a basic matching service.

Create:

requirements/services.py

Function:

match_tutors(requirement)

Matching factors:

1. Subject
2. Class level
3. Location
4. Preferred gender
5. Tuition type
6. Availability
7. Salary/budget
8. Experience

Return ranked matches based on transparent matching criteria.

Do NOT use an opaque AI system initially.

Store match score if useful.

Example:

TutorMatch

requirement
tutor
score
matching_reasons
created_at

---

# 30. RECOMMENDED TUTORS

Endpoint:

GET /api/v1/requirements/{id}/recommended-tutors/

Response:

{
    "results": [
        {
            "tutor_id": "TT-T-000001",
            "score": 92,
            "matching_reasons": [
                "Subject matched",
                "Location matched",
                "Availability matched"
            ]
        }
    ]
}

---

# 31. TUTOR SELECTION

A parent/student should be able to select a tutor from the recommended tutors.

Endpoint:

POST /api/v1/requirements/{id}/select-tutor/

Body:

{
    "tutor_id": "TT-T-000001"
}

Validate:

- requirement belongs to user
- tutor exists
- tutor is available
- requirement is active

Create appropriate relationship/application record.

---

# 32. REVIEWS

Create:

TutorReview

Fields:

id
tutor
reviewer
rating
comment
is_published
created_at
updated_at

Rating:

1–5

Validate rating.

Prevent unauthorized reviews.

---

# 33. TUTOR RATINGS

Calculate:

average_rating
total_reviews

Avoid calculating unnecessarily on every request if performance becomes an issue.

Consider denormalized counters if required.

---

# 34. TESTIMONIALS

Create:

Testimonial

Fields:

id
name
role
organization
avatar
quote
type
rating
is_featured
is_published
display_order
created_at

Types:

PARENT
TUTOR
STAKEHOLDER

Public API:

GET /api/v1/testimonials/

Filters:

?type=PARENT
?type=TUTOR
?type=STAKEHOLDER

---

# 35. CATEGORIES

Create:

Category

Fields:

id
name
slug
description
image
icon
parent
is_active
display_order

Support nested categories if necessary.

Endpoints:

GET /api/v1/categories/
GET /api/v1/categories/{slug}/

---

# 36. SUBJECTS

Create:

Subject

Fields:

id
name
slug
category
is_active

Endpoints:

GET /api/v1/subjects/

Support filtering by category.

---

# 37. LOCATIONS

Do not duplicate city names across multiple models.

Create:

City
Area

Relationships:

City
  └── Area

Example:

Dhaka
    ├── Mirpur
    ├── Uttara
    ├── Dhanmondi
    └── Mohammadpur

Endpoints:

GET /api/v1/locations/cities/
GET /api/v1/locations/cities/{id}/areas/

---

# 38. NOTIFICATIONS

Create:

Notification

Fields:

id
recipient
title
message
type
reference_type
reference_id
is_read
created_at

Types:

APPLICATION
APPLICATION_STATUS
JOB
REQUIREMENT
TUTOR_MATCH
SYSTEM

Endpoints:

GET /api/v1/notifications/
POST /api/v1/notifications/{id}/read/
POST /api/v1/notifications/read-all/

---

# 39. EMAIL NOTIFICATIONS

Use Celery for email.

Examples:

User registration
Email verification
Password reset
Job application
Application status change
Tutor match
Tutor selected
Requirement submitted

Never block API requests while waiting for email delivery.

---

# 40. CELERY

Configure:

Celery
Redis

Tasks:

send_email
send_verification_email
send_application_notification
send_status_notification
calculate_tutor_matches

Use retry policies for external email failures.

---

# 41. AFFILIATE PROGRAM

Create:

AffiliatePartner

Fields:

id
user
affiliate_code
name
email
phone
status
commission_rate
total_referrals
total_earnings
created_at

Statuses:

PENDING
ACTIVE
SUSPENDED
REJECTED

---

# 42. AFFILIATE REFERRALS

Create:

AffiliateReferral

Fields:

id
affiliate
referred_user
source
status
created_at

Prevent duplicate referral attribution.

---

# 43. AFFILIATE API

Endpoints:

POST /api/v1/affiliates/apply/
GET /api/v1/affiliates/me/
GET /api/v1/affiliates/me/referrals/
GET /api/v1/affiliates/me/earnings/

Admin endpoints:

GET /api/v1/admin/affiliates/
PATCH /api/v1/admin/affiliates/{id}/status/

---

# 44. CONTENT MANAGEMENT

Create simple CMS models for public pages.

Models:

Page
BlogPost
FAQ
GalleryItem
TeamMember
Career
FeaturedPublication

---

# 45. BLOG API

Endpoints:

GET /api/v1/blog/
GET /api/v1/blog/{slug}/

Support:

- pagination
- search
- categories
- published status

Admin can create/update/delete posts.

---

# 46. FAQ API

Create:

FAQ

Fields:

question
answer
category
display_order
is_active

Endpoint:

GET /api/v1/faq/

Support category filtering.

---

# 47. GALLERY API

Create:

GalleryItem

Fields:

title
image
description
category
display_order
is_published
created_at

Endpoint:

GET /api/v1/gallery/

---

# 48. TEAM API

Create:

TeamMember

Fields:

name
designation
photo
bio
social_links
display_order
is_active

Endpoint:

GET /api/v1/team/

---

# 49. CAREERS API

Create:

Career

Fields:

title
department
location
employment_type
description
requirements
salary_range
application_email
is_active
created_at

Endpoints:

GET /api/v1/careers/
GET /api/v1/careers/{id}/

---

# 50. FEATURED PUBLICATIONS

Create:

FeaturedPublication

Fields:

name
logo
url
display_order
is_active

Endpoint:

GET /api/v1/featured-publications/

---

# 51. CONTACT FORM

Create:

ContactMessage

Fields:

id
name
email
phone
subject
message
status
created_at

Statuses:

NEW
IN_PROGRESS
RESOLVED

Endpoint:

POST /api/v1/contact/

Send admin notification asynchronously.

---

# 52. DASHBOARD APIs

Create dashboard summary endpoints.

Tutor:

GET /api/v1/dashboard/tutor/

Return:

- profile completion
- applications
- shortlisted applications
- selected applications
- available jobs
- notifications

Student/Parent:

GET /api/v1/dashboard/student/

Return:

- requirements
- recommended tutors
- applications
- selected tutors
- notifications

Admin:

GET /api/v1/dashboard/admin/

Return:

- users
- tutors
- jobs
- applications
- requirements
- pending approvals
- statistics

---

# 53. ADMIN

Use Django Admin.

Customize admin for:

User
TutorProfile
TutorEducation
TutorExperience
Subject
Category
TuitionJob
JobApplication
TutorRequirement
TutorReview
Testimonial
Notification
AffiliatePartner
AffiliateReferral
BlogPost
FAQ
GalleryItem
TeamMember
Career
ContactMessage

Add:

- search
- filters
- list_display
- autocomplete
- readonly fields
- bulk actions

---

# 54. ADMIN ACTIONS

Provide actions for:

- verify tutor
- unverify tutor
- publish job
- close job
- approve affiliate
- reject affiliate
- publish testimonial
- publish blog
- mark contact resolved

---

# 55. API RESPONSE FORMAT

Use a consistent response structure.

Success:

{
    "success": true,
    "message": "Request successful.",
    "data": {}
}

Error:

{
    "success": false,
    "message": "Validation failed.",
    "errors": {
        "email": [
            "A user with this email already exists."
        ]
    }
}

For paginated responses:

{
    "success": true,
    "message": "Jobs retrieved successfully.",
    "data": {
        "count": 100,
        "next": "...",
        "previous": "...",
        "results": []
    }
}

Keep API responses consistent.

---

# 56. PAGINATION

Default:

20 items per page.

Maximum:

100.

Allow:

?page=2&page_size=20

Never allow unlimited result sets.

---

# 57. FILTERING

Use django-filter.

Avoid manually parsing query parameters whenever possible.

Implement reusable FilterSets.

Example:

JobFilter
TutorFilter
ApplicationFilter
RequirementFilter

---

# 58. SEARCH

Use DRF SearchFilter where appropriate.

For PostgreSQL, consider PostgreSQL full-text/trigram search for larger datasets.

Do not over-engineer this initially.

---

# 59. DATABASE INDEXES

Add indexes for frequently searched fields:

User.email
User.phone
TutorProfile.tutor_id
TutorProfile.city
TutorProfile.area
TuitionJob.job_id
TuitionJob.city
TuitionJob.status
TuitionJob.created_at
JobApplication.status
JobApplication.created_at
Category.slug

Use unique constraints where appropriate.

---

# 60. TRANSACTIONS

Use transaction.atomic() for operations such as:

- job application
- tutor selection
- requirement submission
- affiliate referral creation
- status changes

Ensure partial writes cannot leave inconsistent data.

---

# 61. CONCURRENCY

Prevent race conditions.

Example:

Two tutors cannot both create duplicate applications.

Two users cannot simultaneously select conflicting tutors.

Use:

- unique constraints
- select_for_update()
- transactions

where appropriate.

---

# 62. FILE UPLOADS

Support:

- profile pictures
- tutor documents
- education certificates
- blog images
- gallery images
- team photos

Validate:

- file size
- MIME type
- extension
- image dimensions where appropriate

Never blindly trust uploaded file extensions.

---

# 63. MEDIA STORAGE

Development:

local MEDIA_ROOT.

Production:

Cloudinary or S3-compatible storage.

All storage configuration must come from environment variables.

Do not hard-code production credentials.

---

# 64. CORS

Configure CORS using environment variables.

Example:

CORS_ALLOWED_ORIGINS=

Do not use:

CORS_ALLOW_ALL_ORIGINS=True

in production.

---

# 65. SECURITY

Implement:

- CSRF configuration
- secure cookies where applicable
- HTTPS settings
- HSTS in production
- secure headers
- rate limiting/throttling
- password validation
- upload validation
- object-level permissions
- SQL injection protection through ORM
- XSS-safe output
- authentication throttling

Never expose secrets.

---

# 66. API THROTTLING

Configure DRF throttling.

Examples:

Anonymous:

100/hour

Authenticated:

1000/hour

Authentication endpoints should have stricter throttling.

Make limits configurable.

---

# 67. OBJECT PERMISSIONS

Example:

A tutor must not be able to edit another tutor's profile.

A student must not view another student's private requirements.

A parent must not modify another parent's application.

A tutor must not modify another tutor's application.

Admin/staff can manage authorized resources.

Implement custom permission classes where required.

---

# 68. SERIALIZERS

Use separate serializers where useful.

Example:

TutorListSerializer
TutorDetailSerializer
TutorCreateSerializer
TutorUpdateSerializer

Do not use one enormous serializer for every operation.

---

# 69. VIEWS

Prefer:

ModelViewSet

where CRUD behavior is appropriate.

Use APIView for specialized actions.

Example:

ApplyToJobAPIView
SelectTutorAPIView
RecommendedTutorsAPIView

Keep specialized business operations explicit.

---

# 70. URLS

Use DRF routers for standard CRUD.

Example:

/api/v1/tutors/
/api/v1/jobs/
/api/v1/categories/
/api/v1/applications/

Use explicit routes for actions:

/api/v1/jobs/{job_id}/apply/
/api/v1/requirements/{id}/select-tutor/

---

# 71. OPENAPI DOCUMENTATION

Use drf-spectacular.

Expose:

/api/schema/
/api/docs/
/api/redoc/

Every endpoint should have:

- description
- request schema
- response schema
- authentication information
- possible errors

---

# 72. TESTING

Write automated tests.

Use pytest or Django TestCase.

Minimum tests:

Authentication
Registration
Login
Tutor profile
Tutor search
Job creation
Job filtering
Job application
Duplicate application prevention
Application status
Requirement creation
Tutor matching
Tutor selection
Reviews
Permissions
Notifications
Affiliate registration
Contact form

---

# 73. TEST PERMISSIONS

Explicitly test:

Tutor cannot modify another tutor.

Student cannot modify another student's requirement.

Student cannot change application status without permission.

Tutor cannot approve themselves.

Anonymous users cannot access private dashboards.

Admin can access administrative endpoints.

---

# 74. SEED DATA

Create a management command:

python manage.py seed_data

Populate:

- cities
- areas
- subjects
- categories
- sample tutors
- sample jobs
- testimonials
- FAQs
- team members
- featured publications

Do not create fake production claims.

Clearly mark seed/demo data.

---

# 75. DATABASE MIGRATIONS

After creating models:

python manage.py makemigrations
python manage.py migrate

Never modify migrations destructively after deployment without a migration strategy.

---

# 76. ENVIRONMENT VARIABLES

Create:

.env.example

Include:

SECRET_KEY=
DEBUG=
DATABASE_URL=

ALLOWED_HOSTS=

CORS_ALLOWED_ORIGINS=

JWT_ACCESS_MINUTES=
JWT_REFRESH_DAYS=

REDIS_URL=

CELERY_BROKER_URL=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=

DEFAULT_FROM_EMAIL=

MEDIA_STORAGE=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Do not commit .env.

---

# 77. DOCKER

Provide:

Dockerfile
docker-compose.yml

Services:

backend
postgres
redis

Optional:

celery_worker
celery_beat

Example architecture:

backend
   |
   +--- PostgreSQL
   |
   +--- Redis
   |
   +--- Celery Worker

---

# 78. PRODUCTION SERVER

Make backend compatible with:

Gunicorn
Nginx
PostgreSQL
Redis

ASGI support:

Daphne/Uvicorn/Gunicorn worker configuration as appropriate.

Do not assume a specific hosting provider.

---

# 79. LOGGING

Configure structured logging.

Separate:

development
production

Log:

- requests
- errors
- authentication failures
- Celery failures
- important business events

Never log:

- passwords
- JWT tokens
- sensitive personal information unnecessarily

---

# 80. SOFT DELETE

For important business entities, consider soft deletion rather than immediate hard deletion.

Especially:

- users
- tutors
- jobs
- applications
- requirements

Do not destroy historical application records unnecessarily.

---

# 81. AUDIT LOG

Create:

AuditLog

Fields:

id
actor
action
entity_type
entity_id
metadata
created_at

Track important admin/business actions.

Examples:

TUTOR_VERIFIED
JOB_PUBLISHED
JOB_CLOSED
APPLICATION_STATUS_CHANGED
TUTOR_SELECTED
USER_SUSPENDED

---

# 82. PUBLIC VS PRIVATE DATA

Create explicit serializers for public and private data.

Public tutor profile:

- name
- profile photo
- education
- subjects
- experience
- general location
- rating
- availability

Private tutor profile:

- email
- phone
- address
- private documents

Never accidentally expose private fields through a generic serializer.

---

# 83. MATCHING ALGORITHM

Implement deterministic matching first.

Example scoring:

Subject match: 30
Class match: 20
Location: 20
Gender preference: 10
Availability: 10
Budget: 5
Experience: 5

Total:

100

Store reasons:

[
    "Subject matched",
    "Location matched",
    "Availability matched"
]

Make weights configurable.

Do not describe this as AI.

It is a rule-based matching system.

---

# 84. NOTIFICATION EVENTS

Automatically notify users when:

Tutor applies to job.

Parent/student receives application.

Application is shortlisted.

Application is selected.

Application is rejected.

Requirement is submitted.

Tutor is matched.

Tutor is selected.

Job is published/closed where relevant.

---

# 85. API EXAMPLES

The following must work.

GET:

/api/v1/jobs/?city=Dhaka&status=PUBLISHED

GET:

/api/v1/tutors/?subject=English&city=Dhaka

POST:

/api/v1/jobs/TT-J-000001/apply/

POST:

/api/v1/requirements/

GET:

/api/v1/requirements/REQ-000001/recommended-tutors/

POST:

/api/v1/requirements/REQ-000001/select-tutor/

GET:

/api/v1/dashboard/tutor/

---

# 86. FRONTEND INTEGRATION

The backend must be easy to consume from:

React
TypeScript
Axios
TanStack Query

Use predictable response formats.

Return appropriate HTTP status codes.

Examples:

200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error

---

# 87. CACHING

Use Redis caching where useful.

Potential cached data:

- categories
- subjects
- cities
- areas
- featured publications
- published testimonials
- FAQs

Do not cache private user-specific responses without correct cache isolation.

---

# 88. BACKGROUND TASKS

Use Celery for:

- email
- notifications
- expensive matching operations
- image processing if required
- scheduled cleanup

Do not put long-running operations inside synchronous API requests.

---

# 89. CRON / CELERY BEAT

Optional periodic tasks:

- close expired jobs
- send reminder notifications
- cleanup expired tokens
- recalculate statistics
- clean temporary files

---

# 90. API SECURITY REVIEW

Before completion verify:

- IDOR vulnerabilities are prevented.
- Object-level permissions are enforced.
- Private tutor information is protected.
- Users cannot manipulate roles.
- Users cannot submit applications for another tutor.
- Users cannot modify another user's requirements.
- Admin endpoints are protected.
- File uploads are validated.
- Rate limits work.
- Authentication endpoints are throttled.

---

# 91. BACKEND IMPLEMENTATION ORDER

Follow this exact sequence.

PHASE 1:
Project setup.

PHASE 2:
Custom User + authentication.

PHASE 3:
Tutor models and APIs.

PHASE 4:
Subjects/categories/locations.

PHASE 5:
Tuition jobs.

PHASE 6:
Job applications.

PHASE 7:
Student/parent requirements.

PHASE 8:
Tutor matching.

PHASE 9:
Tutor selection.

PHASE 10:
Reviews and testimonials.

PHASE 11:
Notifications.

PHASE 12:
Affiliate system.

PHASE 13:
CMS/public content.

PHASE 14:
Dashboard APIs.

PHASE 15:
Admin.

PHASE 16:
Celery/Redis.

PHASE 17:
OpenAPI documentation.

PHASE 18:
Tests.

PHASE 19:
Security review.

PHASE 20:
Docker/production configuration.

---

# 92. IMPORTANT DEVELOPMENT RULE

Do NOT implement everything in one huge file.

Keep:

models.py
serializers.py
views.py
urls.py
filters.py
permissions.py
services.py
tasks.py
admin.py
tests/

organized per app.

Use shared utilities only when genuinely reusable.

---

# 93. DATABASE DESIGN RULE

Prefer normalized relational design.

Do NOT store things such as:

subjects = "English, Math, Physics"

inside random text fields when a many-to-many relationship is appropriate.

Use proper relationships.

However, preserve snapshot fields where historical records require them.

---

# 94. API DESIGN RULE

Never expose raw Django model structures blindly.

The API contract must be intentionally designed for the frontend.

Public endpoints should return frontend-friendly structures.

Private endpoints should return only necessary information.

---

# 95. DOCUMENTATION

Create:

README.md

Document:

- project setup
- Python version
- virtual environment
- PostgreSQL setup
- Redis setup
- environment variables
- migrations
- seed data
- running server
- Celery worker
- tests
- API documentation
- production deployment

Include Windows and Linux commands where practical.

---

# 96. DEVELOPMENT COMMANDS

Ensure these work:

python manage.py check

python manage.py makemigrations

python manage.py migrate

python manage.py createsuperuser

python manage.py seed_data

python manage.py runserver

pytest

---

# 97. FINAL VALIDATION

Before declaring completion:

Run:

python manage.py check

python manage.py test

pytest

python manage.py makemigrations --check

Verify:

- no pending migrations
- no import errors
- no broken URLs
- no serializer errors
- no permission leaks
- no N+1 queries in obvious list endpoints
- pagination works
- filters work
- authentication works
- JWT refresh works
- tutor search works
- job search works
- job application works
- requirements work
- tutor matching works
- notifications work
- admin works
- OpenAPI docs work

---

# 98. FINAL DELIVERABLE

The final backend must provide a complete REST API for the Tuition Terminal recreation.

Minimum functional modules:

AUTH
TUTORS
STUDENTS
PARENTS
SUBJECTS
CATEGORIES
LOCATIONS
TUITION JOBS
JOB APPLICATIONS
TUTOR REQUIREMENTS
TUTOR MATCHING
TUTOR SELECTION
REVIEWS
TESTIMONIALS
NOTIFICATIONS
AFFILIATES
BLOG
FAQ
GALLERY
TEAM
CAREERS
CONTACT
DASHBOARDS
ADMIN

The system must be:

- production-ready
- secure
- modular
- documented
- tested
- scalable
- frontend-friendly

Do not stop after creating the models.

Implement the complete API layer, permissions, business logic, filtering, validation, tests, documentation, seed data, and deployment configuration.

The backend must be usable immediately by the React frontend.