# Repository Guidelines

## Sources of Truth & Workflow

Read `docs/PROJECT_SPEC.md` and `docs/IMPLEMENTATION_PLAN.md` before coding. The specification defines requirements; the plan defines the 13-stage order. Inspect existing code and `git status`, implement only the requested/current stage, validate its completion criteria, report limitations, and stop. Do not begin later stages or rebuild working architecture.

## Project Structure & Architecture

Backend code lives in `src/`; `app.ts` configures Express without `listen()`, while `server.local.ts` starts local development. `api/index.ts` is the Vercel entry point. Keep configuration in `src/config/`, middleware in `src/middlewares/`, and features in `src/modules/`. Prisma schema, migrations, and seeds belong in `prisma/`; documentation belongs in `docs/`.

Follow `Route -> Middleware -> Controller -> Service -> Prisma`. Controllers handle HTTP concerns; services own business rules, ownership, transactions, and database access. Avoid technologies outside the documented scope.

## Build, Test, and Development Commands

- `npm install`: install packages and generate Prisma Client.
- `npm run dev`: run the local API with automatic restarts.
- `npm run build`: generate Prisma Client and compile strict TypeScript to `dist/`.
- `npm test`: run Jest tests.
- `npx prisma format && npx prisma validate`: format and validate schema changes.
- `npm run prisma:migrate`: apply committed migrations when valid database credentials exist.

Copy `.env.example` to `.env`; verify `GET /api/health`. Never claim a check passed unless it was run successfully.

## Style, Validation & API Conventions

Use 2-space indentation, `camelCase` values/functions, `PascalCase` types, and descriptive files such as `application.service.ts`. Prettier uses single quotes, semicolons, trailing commas, and 100-character lines. Run `npx prettier --check .` and `npx eslint src api`.

Validate bodies, parameters, queries, and enums with Zod, then explicitly map allowed fields to Prisma. Use predictable `{ success, message?, data? }` responses and centralized safe errors with meaningful HTTP status codes.

## Testing & Security

Name Jest tests `*.test.ts`. Prioritize authentication, role enforcement, cross-company ownership, duplicate applications, initial `APPLIED` history, transactional status changes, and same-status rejection. Use transactions for coupled writes and database constraints for integrity.

Never expose or log passwords, hashes, JWTs, Prisma errors, or secrets. Hash passwords with bcrypt; verify JWTs server-side; enforce role and ownership checks on every protected operation. Preserve Helmet, restricted CORS, auth rate limiting, JSON limits, and centralized error handling. Never commit `.env`; update `.env.example` with safe placeholders.

## Commits & Pull Requests

Use Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). PRs must identify the stage, summarize changes, link issues, list commands run, and highlight migrations, API contracts, environment changes, security decisions, and limitations.
