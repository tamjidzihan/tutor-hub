# MASTER PROMPT — RECREATE TUITION TERMINAL

You are a senior full-stack engineer and UI/UX implementation specialist.

Your task is to recreate the publicly accessible website:

REFERENCE WEBSITE:
https://tuitionterminal.com.bd/

The goal is to build a production-quality functional recreation of the website's user experience, visual hierarchy, responsive behavior, pages, navigation, forms, filtering interfaces, cards, dashboards/placeholders, and interactions.

Do NOT merely create a screenshot-like landing page.

The result must be a real, responsive web application with reusable components, routing, state management, forms, filtering, loading states, empty states, and realistic data structures.

---

# 1. IMPORTANT RULES

## Reference-first development

Before writing implementation code:

1. Inspect the reference website.
2. Visit all publicly accessible pages linked from the main navigation/footer.
3. Inspect:
   - homepage
   - tutor-related pages
   - job board
   - category pages
   - tutor details
   - registration/sign-up flows
   - contact/support sections
   - FAQ
   - careers
   - affiliate program
   - become-a-tutor
   - appoint-a-tutor
   - gallery
   - blog
   - privacy/terms pages
4. Record the visual structure and behavior of each page.
5. Identify repeated components.
6. Then implement the application.

Do not blindly copy HTML from the website.

Recreate the interface and functionality using clean, maintainable components.

---

# 2. TECHNOLOGY STACK

Use:

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- Zod
- TanStack Query
- Lucide React icons

Use modern React architecture.

Avoid unnecessary dependencies.

---

# 3. DESIGN OBJECTIVE

The recreation should visually resemble the reference website as closely as reasonably possible.

Pay particular attention to:

- overall page width
- navbar height
- header spacing
- typography
- font weights
- colors
- border radius
- shadows
- cards
- section spacing
- buttons
- icon placement
- image proportions
- background sections
- responsive breakpoints
- mobile navigation
- footer structure

Do NOT redesign the website into a completely different modern SaaS design.

The reference website should remain the visual source of truth.

---

# 4. HOMEPAGE

Recreate the homepage structure.

The homepage currently presents Tuition Terminal as a tutor matching and learning platform.

The hero should communicate the concept of:

"Country's #1 Tutor Matching & Learning Platform"

and explain that users can find suitable tutors for children's learning.

Implement:

## Header

Create a responsive header containing:

- Tuition Terminal logo
- primary navigation
- tutor/student-related navigation
- login/sign-up actions
- relevant CTA buttons
- mobile hamburger menu

The desktop and mobile versions must have appropriate navigation behavior.

---

# 5. HERO SECTION

Create a large hero section containing:

- primary headline
- supporting description
- tutor-search/find-tutor CTA
- appropriate visual/image area
- attractive but restrained background treatment

Include the search/find-tutor interaction.

Example conceptual CTA:

Find Tutor

Do not invent unnecessary marketing copy if equivalent content can be derived from the reference.

---

# 6. STATISTICS SECTION

Recreate the statistics area.

Display counters for items such as:

- Registered Tutors
- Total Applications
- Live Tuition Jobs
- Total Stakeholders

Create reusable statistic cards.

The values should be data-driven.

Example:

{
  registeredTutors: 0,
  totalApplications: 0,
  liveTuitionJobs: 0,
  totalStakeholders: 0
}

Do not hard-code these directly inside JSX.

---

# 7. TUTOR CTA

Recreate the "Want to Become TUTOR" section.

Include:

- heading
- supporting text
- CTA
- relevant illustration

CTA should navigate to the tutor registration flow.

---

# 8. SERVICE CATEGORIES

Create the service/category section.

Include:

- section heading
- "See All"
- category cards
- category icons/images
- hover states

Categories must come from data.

Example structure:

interface ServiceCategory {
    id: string;
    title: string;
    slug: string;
    image?: string;
    description?: string;
}

Clicking a category should navigate to:

/category-details/:id/:slug

or the equivalent routing structure discovered from the reference.

---

# 9. HOW PARENTS/STUDENTS CONNECT

Recreate the four-step process:

1. Create Profile
2. Submit Requirements
3. Get Tutors' CV
4. Select your Tutor

Use a reusable step component.

Each step should contain:

- icon/illustration
- number
- title
- description

The layout should change appropriately on mobile.

---

# 10. TESTIMONIAL SECTION

Recreate:

"Real Happy Parents, Real Stories"

Implement testimonial cards/carousel.

Each testimonial should support:

- quote
- name
- institution
- avatar if available

Use realistic structured sample data.

Do not invent exaggerated content.

---

# 11. TUTORING METHOD

Create the tutoring-method section.

Include the corresponding illustration/image area and explanatory content.

Match the reference layout rather than creating an unrelated design.

---

# 12. TUTOR WORKFLOW

Recreate:

"The ways Tutors can connect with us."

Steps:

1. Create Profile
2. Complete your profile
3. Apply for Tuition Job
4. Start tutoring

Implement these as reusable process cards.

Include:

- icons
- arrows/connecting elements on desktop
- vertical layout on mobile

---

# 13. TUTOR TESTIMONIALS

Create:

"Real Happy Tutors, Real Stories"

Implement testimonial cards.

Include:

- quote
- tutor name
- university/institution
- optional avatar

---

# 14. AFFILIATE SECTION

Recreate the affiliate partner section.

Content should explain that users can participate in the affiliate program.

Include:

- heading
- description
- Join Now button
- responsive layout
- appropriate image/illustration

CTA route:

/affiliate-program

---

# 15. WHY CHOOSE US

Recreate the "WHY CHOOSE US" section.

Include cards such as:

- 24/7 Live Support
- Fast Responsive
- Safe Community
- Better than others

Use reusable feature cards.

Each card should contain:

- icon
- title
- description if present
- hover interaction

---

# 16. STAKEHOLDER TESTIMONIALS

Create the stakeholder statement section.

Support multiple stakeholder types.

Use a carousel/grid depending on the reference behavior.

---

# 17. APP DOWNLOAD SECTION

Recreate the app-download area.

Include:

- heading
- description
- QR code
- mobile/app visual
- app CTA if available

Make the section responsive.

---

# 18. FEATURED / PRESS SECTION

Recreate:

"We were Featured on"

Display publication logos such as the ones visible on the reference site.

The logos should be arranged in a responsive horizontal layout/carousel.

Avoid stretching logos.

Maintain their original aspect ratios.

---

# 19. FOOTER

Recreate the footer carefully.

Include:

## About

Tuition Terminal description.

## Useful Links

Include relevant links such as:

- Affiliate Program
- Our Team
- Become A Tutor
- Careers
- Appoint A Tutor
- Gallery
- Our Blog
- FAQ
- Privacy Policy

## Contact

Include the publicly displayed contact information from the reference website.

## Terms

Include:

- Terms of Use
- Privacy Policy

## Payment/support area

Recreate any payment or service-support information visible in the reference.

## Copyright

Use the current year dynamically.

---

# 20. JOB BOARD

Create a complete Job Board page.

Reference:

/job-board

The page should support:

- job listing cards/table
- pagination
- job ID search
- city filtering
- posted-date filtering
- subject/category filters
- tuition-related filters
- clear filters
- apply/filter button
- loading state
- empty state

The reference site exposes city filters including:

- Dhaka
- Chittagong
- Khulna
- Gazipur
- Narayanganj
- Sylhet
- Cumilla
- Barishal
- Rajshahi
- Rangpur
- Mymensingh

Implement these as dynamic filter options.

Do not hard-code filtering logic into the UI.

Create a structured model:

interface TuitionJob {
    id: string;
    jobId: string;
    title: string;
    location: string;
    area?: string;
    subjects: string[];
    classLevel?: string;
    salary?: string;
    tuitionType?: string;
    postedAt: string;
    status: "active" | "closed";
}

---

# 21. JOB SEARCH

Implement:

Search by Job ID.

Search should:

- debounce input
- update results
- show loading state
- show no-result state
- preserve filters

---

# 22. JOB FILTER SIDEBAR

Create a responsive filter panel.

Desktop:

- sidebar/filter area

Mobile:

- filter button
- slide-over/modal filter panel

Filters should include the options actually available from the reference site.

Provide:

- Apply
- Clear

Do not reload the entire page unnecessarily.

---

# 23. JOB DETAILS

Create a job details page.

Display:

- Job ID
- title
- location
- class
- subjects
- tuition type
- schedule
- salary
- requirements
- additional information
- application CTA

Use reusable information rows.

---

# 24. TUTOR DETAILS

Create a tutor-details page.

Reference route pattern:

/hub/tutor-details/:tutorId

Create a tutor profile containing:

- profile image
- tutor name
- tutor ID
- education
- university
- subjects
- preferred classes
- experience
- location
- teaching preferences
- verification information
- contact/apply CTA

Use a polished profile layout.

---

# 25. CATEGORY DETAILS

Create:

/category-details/:id/:slug

The reference site contains category-detail pages.

Implement:

- category title
- description
- what-you-will-learn/content section
- relevant tutor/service information
- CTA
- rating/review area
- contact CTA

Also implement a graceful empty state.

Example:

"No data available"

Do not allow broken pages when a category has no content.

---

# 26. AUTHENTICATION

Create authentication UI.

Pages:

/login

/register

/forgot-password

Include appropriate roles:

- Student/Parent
- Tutor
- Admin

Use reusable form components.

Validation:

- Zod
- React Hook Form

Show:

- validation errors
- loading
- success
- failure
- disabled submit states

---

# 27. TUTOR REGISTRATION

Create a multi-step tutor onboarding flow.

Suggested steps:

1. Account
2. Personal Information
3. Education
4. Teaching Preferences
5. Location
6. Experience
7. Profile Photo
8. Review
9. Submit

Use a progress indicator.

Save form state between steps.

Validate each step.

---

# 28. STUDENT/PARENT PROFILE

Create a dashboard where a student/parent can:

- manage profile
- submit tutor requirements
- view submitted requirements
- view recommended tutors
- review tutor CVs
- select tutor
- track applications
- view notifications

Use reusable dashboard components.

---

# 29. REQUIREMENT SUBMISSION

Create a tutor requirement form.

Fields should cover information such as:

- student/class
- subjects
- preferred tutor gender
- location
- tutoring type
- days
- time
- budget
- additional requirements

Show a confirmation after successful submission.

---

# 30. TUTOR APPLICATION FLOW

Tutors should be able to:

- browse tuition jobs
- open job details
- apply
- see application status
- withdraw if permitted

Statuses:

- Pending
- Shortlisted
- Selected
- Rejected
- Withdrawn

Use status badges.

---

# 31. DASHBOARD

Create a reusable dashboard shell.

Include:

- sidebar
- topbar
- notification icon
- profile menu
- responsive mobile navigation

Cards:

- Applications
- Active Jobs
- Profile Completion
- Notifications

---

# 32. PROFILE COMPLETION

Implement profile completion percentage.

Example:

Profile completion: 80%

Display:

- progress bar
- percentage
- missing profile fields
- CTA to complete profile

---

# 33. SEARCH / FIND TUTOR

Create a dedicated Find Tutor page.

Support filters such as:

- location
- subject
- class
- gender
- education
- university
- experience
- tuition type
- budget

Display tutor cards.

Tutor card:

- avatar
- name
- education
- subjects
- location
- experience
- rating if available
- profile CTA

---

# 34. GLOBAL STATES

Every API-driven page must have:

## Loading

Skeleton UI.

## Empty

Helpful empty-state message.

## Error

User-friendly error state with retry.

## Success

Normal content.

Do not leave blank screens.

---

# 35. RESPONSIVENESS

The website must work correctly at:

- 320px
- 375px
- 390px
- 414px
- 768px
- 1024px
- 1280px
- 1440px
- 1920px

Pay special attention to:

- navigation
- hero
- cards
- filter sidebar
- job listings
- forms
- dashboard
- footer
- testimonials
- tables

Nothing should overflow horizontally.

---

# 36. MOBILE NAVIGATION

Implement a proper mobile menu.

Requirements:

- hamburger button
- animated menu
- overlay or drawer
- close button
- nested navigation if necessary
- body scroll prevention while open

---

# 37. ANIMATION

Use subtle animations only.

Preferred:

- fade-in
- slide-up
- hover elevation
- button transitions
- carousel transitions

Do NOT over-animate the website.

Animations must never interfere with usability.

Respect:

prefers-reduced-motion.

---

# 38. IMAGE HANDLING

Do not hotlink random external images.

Create an organized asset structure:

src/assets/
    images/
    icons/
    logos/
    illustrations/

If an exact reference asset cannot legally/reliably be reused, use a visually appropriate placeholder and keep the component ready for replacement.

Maintain image aspect ratios.

Use lazy loading where appropriate.

---

# 39. ICONS

Use Lucide React wherever an icon is needed and no exact brand asset exists.

Do not use emojis as UI icons.

---

# 40. API ARCHITECTURE

Separate API logic from UI.

Example:

src/
  api/
    client.ts
    auth.ts
    tutors.ts
    jobs.ts
    categories.ts
    applications.ts
    requirements.ts
    users.ts

Use Axios.

Configure:

VITE_API_URL

Never hard-code API URLs throughout components.

---

# 41. MOCK BACKEND MODE

If no real backend is available, implement a mock data layer.

The frontend must remain completely functional.

Create:

src/mocks/

with:

- tutors.ts
- jobs.ts
- categories.ts
- testimonials.ts
- users.ts

Use TanStack Query-compatible services.

The architecture must make replacing mock services with a Django REST API straightforward.

---

# 42. DJANGO BACKEND OPTION

If backend implementation is requested, use:

- Python
- Django
- Django REST Framework
- PostgreSQL
- JWT authentication

Models:

User
TutorProfile
StudentProfile
Category
TuitionJob
JobApplication
TutorRequirement
Testimonial
Notification
AffiliatePartner
Review

Use UUIDs where appropriate.

Implement:

- authentication
- tutor CRUD
- job CRUD
- application CRUD
- requirement CRUD
- category CRUD
- filtering
- pagination
- permissions

Use DRF serializers, viewsets and routers.

---

# 43. PERMISSIONS

Implement role-based access:

ADMIN
TUTOR
STUDENT
PARENT

Examples:

Tutor:

- create/update own profile
- browse jobs
- apply to jobs

Student/Parent:

- create requirements
- browse tutors
- view tutor profiles
- manage applications

Admin:

- manage users
- manage tutors
- manage jobs
- manage categories
- manage applications
- manage testimonials

Never trust frontend role checks alone.

Backend authorization must enforce permissions.

---

# 44. URL STRUCTURE

Create clean routes.

Example:

/
/find-tutor
/job-board
/job-board/:jobId
/category-details/:id/:slug
/hub/tutor-details/:tutorId

/login
/register
/forgot-password

/become-a-tutor
/appoint-a-tutor
/affiliate-program
/our-team
/careers
/gallery
/blog
/faq
/privacy-policy
/terms

/dashboard
/dashboard/profile
/dashboard/requirements
/dashboard/applications
/dashboard/notifications

Adjust exact routes when reference inspection shows a different public route.

---

# 45. SEO

Implement:

- page titles
- meta descriptions
- canonical URLs
- Open Graph metadata
- semantic HTML
- accessible headings

Example:

Home:

"Tuition Terminal — Tutor Matching & Learning Platform"

Do not duplicate H1 tags unnecessarily.

---

# 46. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard navigation
- visible focus states
- ARIA labels where necessary
- alt text
- accessible dialogs
- accessible dropdowns
- accessible forms

Color contrast must remain readable.

---

# 47. PERFORMANCE

Optimize:

- image loading
- code splitting
- route lazy loading
- React rendering
- API caching
- unnecessary re-renders

Use React.lazy where useful.

---

# 48. ERROR HANDLING

Create a global error handling system.

API errors should produce meaningful messages.

Example:

"Unable to load tuition jobs. Please try again."

Never expose raw backend errors to users.

---

# 49. COMPONENT ARCHITECTURE

Use reusable components.

Example:

src/components/
    layout/
        Header.tsx
        Footer.tsx
        MobileMenu.tsx

    common/
        Button.tsx
        Input.tsx
        Select.tsx
        Modal.tsx
        EmptyState.tsx
        ErrorState.tsx
        LoadingSkeleton.tsx

    home/
        Hero.tsx
        Statistics.tsx
        ServiceCategories.tsx
        StudentWorkflow.tsx
        TutorWorkflow.tsx
        Testimonials.tsx
        AffiliateSection.tsx
        WhyChooseUs.tsx
        AppDownload.tsx
        FeaturedOn.tsx

    tutor/
        TutorCard.tsx
        TutorFilters.tsx
        TutorProfile.tsx

    jobs/
        JobCard.tsx
        JobFilters.tsx
        JobList.tsx
        JobDetails.tsx

    dashboard/
        Sidebar.tsx
        Topbar.tsx
        DashboardCard.tsx

Do not create huge monolithic components.

---

# 50. DATA TYPES

Centralize TypeScript interfaces.

Example:

src/types/

User.ts
Tutor.ts
Job.ts
Category.ts
Application.ts
Requirement.ts
Testimonial.ts

Avoid using `any`.

Use proper types.

---

# 51. FORMS

All forms must support:

- controlled state
- validation
- field errors
- submit loading
- success state
- server errors
- reset

Use React Hook Form + Zod.

---

# 52. TABLES

Where the reference requires data tables:

Implement:

- pagination
- sorting
- filtering
- responsive behavior
- mobile-friendly cards where tables cannot fit

---

# 53. FOOTER AND GLOBAL INFORMATION

Use the actual publicly displayed organizational information from the reference website where appropriate.

Do not invent phone numbers, addresses, emails, certifications, awards, or statistics.

If information is not available, use a clearly marked placeholder.

---

# 54. REFERENCE CONTENT

The reference currently presents Tuition Terminal as a tutor matching/learning platform and includes sections for parents/students, tutors, affiliate partners, support, app download and featured publications.

The public site also exposes a Job Board with filtering and tutor-detail/category routes.

Use the reference site as the source of truth for structure and publicly visible content.

---

# 55. VISUAL QA

After implementation, compare the recreation against the reference.

Check:

## Header

- height
- logo size
- navigation spacing
- button sizes

## Hero

- heading width
- image placement
- CTA placement
- vertical spacing

## Cards

- radius
- shadow
- padding
- typography

## Sections

- max-width
- section spacing
- alignment

## Footer

- columns
- typography
- spacing
- mobile stacking

---

# 56. PAGE-BY-PAGE QA

Test:

1. Home
2. Find Tutor
3. Job Board
4. Job Details
5. Tutor Details
6. Category Details
7. Login
8. Registration
9. Become a Tutor
10. Appoint a Tutor
11. Affiliate Program
12. FAQ
13. Blog
14. Gallery
15. Careers
16. Our Team
17. Privacy
18. Terms
19. Dashboard
20. Profile

Every route must either work or display a deliberate coming-soon/empty state.

No broken links.

No blank pages.

No console errors.

---

# 57. IMPLEMENTATION ORDER

Follow this exact order.

PHASE 1:

Inspect reference website.

PHASE 2:

Create project structure.

PHASE 3:

Implement global styles, fonts, colors and layout system.

PHASE 4:

Implement Header and Footer.

PHASE 5:

Implement Homepage.

PHASE 6:

Implement Job Board.

PHASE 7:

Implement Find Tutor.

PHASE 8:

Implement Tutor Details.

PHASE 9:

Implement Category Details.

PHASE 10:

Implement authentication.

PHASE 11:

Implement tutor/student flows.

PHASE 12:

Implement dashboard.

PHASE 13:

Implement supporting informational pages.

PHASE 14:

Add API/mocking layer.

PHASE 15:

Responsive QA.

PHASE 16:

Visual refinement.

PHASE 17:

Performance/accessibility/SEO.

---

# 58. IMPORTANT CODING RULE

Do not make unrelated design decisions.

If the reference website already provides a visual pattern, reuse that pattern consistently.

Do not introduce:

- random gradients
- excessive glassmorphism
- excessive rounded cards
- excessive animations
- huge typography
- unnecessary dark mode
- unrelated UI frameworks

The goal is faithful recreation.

---

# 59. FINAL REQUIREMENTS

Before considering the project complete:

Run:

npm run build

Fix every build error.

Run the development server.

Test every route.

Check browser console.

Check responsive layouts.

Check forms.

Check filters.

Check navigation.

Check loading/error/empty states.

Verify that:

- no route produces a blank screen
- no images cause broken layouts
- no horizontal scrolling exists on mobile
- buttons work
- forms validate
- filters work
- pagination works
- mobile navigation works
- dashboard navigation works

---

# 60. FINAL DELIVERABLE

Deliver:

1. Fully functional React application
2. Responsive design
3. Reusable components
4. Proper routing
5. Mock/API service layer
6. Authentication-ready architecture
7. Tutor system
8. Job board
9. Tutor search
10. Requirement submission
11. Application system
12. Dashboard
13. Supporting pages
14. SEO metadata
15. Accessibility improvements
16. Production build

Do not stop after creating the homepage.

Continue until the major public flows and pages have been implemented.

The reference website is the primary visual and structural source of truth.