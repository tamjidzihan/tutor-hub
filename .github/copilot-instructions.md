# TutorHub Copilot Instructions

## Project summary
- This repo is a full-stack tuition marketplace inspired by Tuition Terminal.
- The frontend is a React + TypeScript + Vite application.
- The backend is a Django REST API with modular apps under `backend/apps`.

## Frontend design guidance
- Keep the visual language premium and trustworthy: clean whites, deep navy accents, and green brand highlights.
- Favor readable typography, generous spacing, rounded cards, and subtle shadows.
- Preserve the education-focused business context: parents, students, tutors, and verification trust.
- Avoid dark text on dark backgrounds; maintain strong contrast for accessibility.
- Keep interactions simple and useful: search flows, tutor cards, CTA buttons, and dashboard actions should feel polished and clear.

## Coding rules
- Prefer minimal, maintainable changes over large rewrites.
- Keep TypeScript strict enough to avoid runtime surprises.
- Reuse shared components rather than duplicating layout logic.
- When changing styles, preserve existing app structure and route behavior.
- Run the frontend build after styling or component changes to catch mistakes.

## Commit and release expectations
- Keep changes focused and reviewable.
- Do not commit generated build artifacts unless explicitly required.
- Do not include the local skill clone folder in the project commit unless it is intentionally needed.
