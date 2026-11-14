TUTORHUB AI PRESENTATION KIT
Prepared from the TutorHub repository snapshot on 7 November 2026.

START HERE
1. Open AI_Presentation_Prompt.txt and copy its complete contents into your presentation-making AI.
2. Upload northern_university.jpeg, the screenshots from screenshots\, and the SVG logos from technology_logos\ alongside the prompt.
3. The prompt asks for an editable 16:9 PowerPoint, a 10-minute presentation, speaker notes, accurate sources, restrained transitions, and honest evaluation claims.
4. Northern University Bangladesh and its logo are supplied. Department and course-code details are not provided; fill in those placeholders yourself. Team names, roles, student IDs, and supervisor are supplied in the prompt.

SCREENSHOTS
01_login.png — actual TutorHub sign-in screen.
02_registration.png — actual TutorHub sign-up screen.
03_tutor_directory_demo.png — actual rendered tutor directory, with synthetic demo tutor profiles returned by a temporary browser-only API mock.
04_job_board_demo.png — actual rendered tuition job board, with synthetic demo job records returned by a temporary browser-only API mock.

The tutor/job list screenshots are UI illustrations only. Their names, tutor/job IDs, ratings, salaries, counts, and records are not real listings or measured platform data. Do not present them as user evidence.

TECHNOLOGY LOGOS
technology_logos\ contains SVG logos for React, TypeScript, Python, Django, Vite, Tailwind CSS, React Router, TanStack Query, Axios, SQLite, PostgreSQL, JWT, Gemini, Celery, and Redis. Use the text labels as the source of truth; Django REST Framework is represented by the Django logo because there is no separate DRF mark in this set. Icons are gathered from the Simple Icons CDN; respective marks remain the property of their owners.

UNIVERSITY LOGO
northern_university.jpeg — supplied Northern University Bangladesh logo and wordmark. Use it on the title slide without stretching or changing its proportions.

ACCURACY NOTES
- Current tutor recommendation scoring is rule-based/heuristic. Gemini integration is used for review analysis/summary when configured; it is not the tutor-match score.
- Current base Django settings use SQLite. PostgreSQL appears in dependencies and Docker Compose, but active app database configuration must be checked before saying it is the live database.
- Verified test snapshot: 18 Django tests passed. No user study or recommendation-performance measurements were provided.
- Frontend build snapshot has a TypeScript unused-import diagnostic for ClipboardList in frontend/src/components/dashboard/DashboardLayout.tsx.
- University: Northern University Bangladesh. Supplied team: Md.Riad sarker (Team Lead · Full-stack, ID 42230200750), Sadika afrin tumpa (Frontend Developer, ID 42230200745), and Mst. Tisma Hossain (QA & Documentation, ID 42230200729). Supervisor: Rama Kundu Prova. Department and course code remain unspecified.

REFERENCE FILES
AI_Presentation_Prompt.txt — ready-to-paste prompt and complete slide-by-slide requirements.
northern_university.jpeg — supplied university logo/wordmark for title-slide branding.
screenshots\ — captured product screen images.
technology_logos\ — technology logo SVG files.
