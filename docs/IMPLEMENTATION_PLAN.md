# IndoKerja — Implementation Plan

---

# 1. Purpose

This document defines the implementation order for the IndoKerja Job
Application Management technical assessment.

The project must be developed incrementally.

Each major stage should be:

1. Inspected
2. Implemented
3. Reviewed
4. Validated
5. Tested where relevant
6. Completed before moving to the next major stage

Codex or any automated coding agent must not automatically implement
multiple future stages at once.

The functional and technical source of truth is:

`PROJECT_SPEC.md`

---

# 2. Development Priorities

Development priorities are:

1. Functional correctness
2. Security
3. Database integrity
4. Authentication and authorization
5. REST API correctness
6. Error handling
7. Code maintainability
8. Responsive and understandable UI
9. Deployment reliability

Do not overengineer.

Prefer:

```text
simple
+
correct
+
secure
+
maintainable
```

over:

```text
complex
+
unnecessary
+
fragile
```

---

# 3. General Workflow

Before working on any stage:

1. Read `PROJECT_SPEC.md`.
2. Read `IMPLEMENTATION_PLAN.md`.
3. Read `AGENTS.md` if present.
4. Inspect the existing repository.
5. Run `git status`.
6. Identify what already exists.
7. Identify what is incomplete.
8. Preserve working code where appropriate.

Do not rebuild the project from scratch unless explicitly instructed.

Do not replace existing architecture simply because another architecture
is also valid.

---

# 4. Cross-Cutting Engineering Quality Gates

These requirements apply to every implementation stage.

A stage is not complete merely because the feature appears to work.

For every feature, review the areas below where relevant.

---

## 4.1 Functional Correctness

Ask:

- Does the implementation satisfy `PROJECT_SPEC.md`?
- Does the normal use case work?
- Are important edge cases handled?
- Are business rules enforced by the backend?

---

## 4.2 Authentication

Ask:

- Does this endpoint require authentication?
- Is a valid JWT required?
- Is authentication checked before protected data is accessed?

Authentication must be implemented when the feature requires it.

Do not postpone it until a later audit.

---

## 4.3 Authorization

Ask:

- Which role is allowed?
- Is role authorization enforced by the backend?
- Can another role bypass the frontend and call the endpoint directly?

Frontend route guards do not replace backend authorization.

---

## 4.4 Resource Ownership

Ask:

- Can one Job Seeker access another Job Seeker's data?
- Can Company A access Company B's resources?
- Is ownership derived from authenticated identity?
- Is ownership checked through actual database relationships?

Never trust client-supplied ownership identifiers without validation.

---

## 4.5 Input Validation

Ask:

- Is the request body validated?
- Are route parameters validated?
- Are relevant query parameters validated?
- Are enum values validated?
- Are unexpected or unsafe fields prevented from reaching Prisma?

Use Zod for backend input validation.

Do not pass arbitrary request objects directly into database operations.

---

## 4.6 Database Integrity

Ask:

- Are relationships correct?
- Are required unique constraints present?
- Are foreign keys correct?
- Are useful indexes present?
- Could concurrent requests violate a business rule?
- Does this operation require a transaction?

Do not rely only on frontend validation.

---

## 4.7 Error Handling

Ask:

- Is the HTTP status code meaningful?
- Is the error understandable?
- Does the response expose internal information?
- Are expected business errors distinguished from unexpected server
  failures?

Use centralized error handling.

---

## 4.8 Security

Ask:

- Could this endpoint leak sensitive data?
- Could a user manipulate an ID to access another user's data?
- Could a request update fields that should not be client-controlled?
- Are password hashes excluded?
- Are JWTs or secrets being logged?
- Is rate limiting needed?
- Is authentication required?
- Is role authorization required?
- Is ownership validation required?

Security must be handled when building the feature.

---

## 4.9 Type Safety

Ask:

- Is TypeScript strictness preserved?
- Is `any` avoided?
- Are unsafe casts avoided?
- Are API and domain types understandable?

Do not weaken TypeScript configuration merely to silence errors.

---

## 4.10 Code Quality

Ask:

- Is business logic placed in services?
- Are controllers focused on HTTP concerns?
- Is duplicate logic avoided?
- Are functions reasonably focused?
- Are names understandable?
- Is unnecessary abstraction being introduced?
- Is dead code being created?

---

## 4.11 Frontend User Experience

For frontend work, ask:

- Is there a loading state?
- Is there an empty state where applicable?
- Is an API error understandable?
- Is success feedback provided where useful?
- Are buttons disabled while submitting?
- Can duplicate submissions accidentally occur?
- Are labels understandable?
- Does the page work on smaller screens?
- Are controls keyboard-accessible?

---

## 4.12 Verification

Run the relevant available commands.

Backend may include:

```bash
npm run build
npm test
npx prisma format
npx prisma validate
```

Frontend may include:

```bash
npm run build
npm run lint
```

Run additional relevant checks where appropriate.

Never claim a command passed unless it was actually executed successfully.

If an environment limitation prevents verification:

1. Clearly state the limitation.
2. Do not claim success.
3. Provide the exact command that still needs to be executed.

---

# 5. Development Stages

The implementation is divided into:

```text
Stage 1  — Architecture & Project Setup
Stage 2  — Database Schema & Prisma
Stage 3  — Authentication & Authorization
Stage 4  — Jobs Backend API
Stage 5  — Applications & Application History Backend
Stage 6  — Backend Integration & Testing
Stage 7  — Frontend Foundation & Authentication
Stage 8  — Job Seeker Frontend
Stage 9  — Company Frontend
Stage 10 — Frontend Integration & Responsive UI
Stage 11 — Final Security & Code Quality Audit
Stage 12 — Deployment
Stage 13 — Final Assessment Audit & Documentation
```

Do not automatically proceed to the next major stage.

---

# 6. Stage 1 — Architecture & Project Setup

## Objective

Establish and verify the project foundation.

This stage is expected to already be substantially implemented.

Codex must audit the existing code before changing anything.

---

## 6.1 Backend

Verify:

- Node.js
- TypeScript
- Express.js
- Prisma
- PostgreSQL configuration
- Express application setup
- Vercel serverless entry point
- local development server
- environment validation
- Prisma singleton
- global error handling foundation
- Helmet
- authentication rate limiter foundation
- CORS configuration
- development logging
- ESLint
- Prettier
- Jest
- `.gitignore`
- `.env.example`

Expected structure:

```text
indokerja-backend/
├── api/
│   └── index.ts
├── prisma/
├── src/
│   ├── config/
│   ├── middlewares/
│   ├── modules/
│   ├── utils/
│   ├── app.ts
│   └── server.local.ts
├── package.json
├── tsconfig.json
├── vercel.json
└── .env.example
```

`app.ts` must not contain `app.listen()`.

Local listening belongs in:

`server.local.ts`

---

## 6.2 Frontend

Verify:

- React
- TypeScript
- Vite
- React Router DOM
- Axios
- React Hook Form
- Zod
- appropriate folder foundation

Expected structure:

```text
src/
├── api/
├── components/
├── context/
├── features/
├── hooks/
├── routes/
└── types/
```

---

## 6.3 Validation

Run available build commands.

Backend:

```bash
npm run build
```

Frontend:

```bash
npm run build
```

---

## 6.4 Completion Criteria

Stage 1 is complete when:

- existing architecture is understood
- backend builds
- frontend builds
- deployment structure is compatible with the planned architecture
- environment examples exist
- no blocking architecture issue remains

Do not modify correct existing code unnecessarily.

---

# 7. Stage 2 — Database Schema & Prisma

## Objective

Create a clean relational PostgreSQL schema for the complete assessment
domain.

---

## 7.1 Models

Implement:

- User
- Company
- Job
- Application
- ApplicationStatusHistory

---

## 7.2 Enums

Implement:

### UserRole

```text
JOB_SEEKER
COMPANY
```

### JobType

```text
FULL_TIME
PART_TIME
CONTRACT
INTERNSHIP
```

### ApplicationStatus

```text
APPLIED
REVIEWING
SHORTLISTED
REJECTED
ACCEPTED
```

---

## 7.3 Required Relationships

Implement relationships representing:

```text
User
 |
 | Company user
 v
Company
 |
 | 1:N
 v
Job
 |
 | 1:N
 v
Application
 |
 | 1:N
 v
ApplicationStatusHistory
```

Job Seeker applications relate to the Job Seeker User.

---

## 7.4 Constraints

Implement:

- unique User email
- unique Company.userId
- unique Application(jobId, jobSeekerId)
- appropriate foreign keys
- appropriate indexes

Review referential actions carefully.

Do not add cascade behavior blindly.

Use cascade/restrict behavior only when its consequences are understood
and appropriate for the domain.

---

## 7.5 Salary

Salary is stored as numeric monthly Indonesian Rupiah.

Do not store formatted currency text.

---

## 7.6 Seed

Create:

```text
prisma/seed.ts
```

Minimum development seed:

- 1 Job Seeker
- 2 Companies
- several jobs
- example applications
- example ApplicationStatusHistory records

Seed passwords must be hashed using bcrypt.

---

## 7.7 Migration

If valid development database credentials are available, generate/apply
the appropriate migration.

If database credentials are unavailable:

- do not invent credentials
- do not claim migration succeeded
- prepare the schema correctly
- clearly report the migration command that remains to be executed

---

## 7.8 Validation

Run:

```bash
npx prisma format
npx prisma validate
npm run build
```

Run migration-related checks when the database is available.

---

## 7.9 Completion Criteria

- Prisma schema is valid.
- Relations are correct.
- Duplicate applications are protected at database level.
- Useful indexes exist.
- Seed file exists.
- Passwords in seed are hashed.
- Backend build passes.

Stop after Stage 2.

---

# 8. Stage 3 — Authentication & Authorization

## Objective

Implement secure authentication and role-based access control.

---

## 8.1 Required Endpoints

Implement:

```http
POST /api/auth/register
POST /api/auth/login
```

An authenticated identity endpoint is recommended:

```http
GET /api/auth/me
```

if useful for frontend authentication restoration.

---

## 8.2 Registration

Support:

- Job Seeker registration
- Company registration

Use appropriate Zod validation.

Company registration should create the required Company profile relation.

Where multiple writes must succeed together, use a database transaction.

---

## 8.3 Password Security

Use bcrypt.

Requirements:

- validate new registration passwords for a minimum of 12 characters
- reject new registration passwords exceeding 72 UTF-8 bytes
- require at least one uppercase ASCII letter, lowercase ASCII letter, digit,
  and non-alphanumeric, non-whitespace symbol for registration
- preserve password whitespace without trimming or normalization
- apply strength rules to registration only, not login of existing accounts
- hash before database insert
- never store plain-text passwords
- never return password hashes
- never log passwords

---

## 8.4 Login

On successful login:

1. Verify email/password.
2. Generate signed JWT.
3. Include required authenticated identity claims.
4. Return safe user information.

Do not put sensitive information into JWT claims.

---

## 8.5 Middleware

Complete and verify:

```text
authenticate.ts
authorize.ts
```

Authentication middleware must:

- extract Bearer token
- verify JWT
- reject missing/invalid/expired tokens
- expose trusted authenticated-user information

Authorization middleware must support:

```text
JOB_SEEKER
COMPANY
```

---

## 8.6 Security

Implement at this stage, not later:

- authentication validation
- role authorization
- bcrypt
- JWT expiration
- auth endpoint rate limiting
- safe errors
- no password hash exposure

---

## 8.7 Validation

Run:

```bash
npm run build
npm test
```

Add meaningful authentication tests where useful.

---

## 8.8 Completion Criteria

- Job Seeker registration works.
- Company registration works.
- Both roles can login.
- Password hashing is correct.
- JWT works.
- Missing/invalid token is rejected.
- Wrong role is rejected.
- Password hash is not exposed.

Stop after Stage 3.

---

# 9. Stage 4 — Jobs Backend API

## Objective

Implement Job functionality.

---

## 9.1 Job List

Implement an endpoint for retrieving available jobs.

Recommended:

```http
GET /api/jobs
```

Return required information:

- title
- Company
- location
- salary
- job type

Avoid exposing unnecessary private data.

---

## 9.2 Job Detail

Recommended:

```http
GET /api/jobs/:jobId
```

Return:

- title
- Company
- location
- salary
- job type
- description

Validate route parameters.

Handle missing jobs correctly.

---

## 9.3 Create Job

Implement a Company-only endpoint.

Recommended:

```http
POST /api/jobs
```

Validate:

- title
- location
- salary
- jobType
- description

Determine ownership using authenticated Company identity.

Do not accept arbitrary ownership from request body.

---

## 9.4 Company Job List

Implement a way for a Company to retrieve its own jobs.

Choose a clear, consistent REST endpoint.

Possible example:

```http
GET /api/company/jobs
```

or an equivalent design consistent with the actual routing structure.

Do not unnecessarily duplicate logic.

---

## 9.5 Security Requirements

Before considering the feature complete verify:

- authentication where required
- Company role authorization
- ownership
- route parameter validation
- request body validation
- explicit field mapping
- safe responses
- safe error handling

---

## 9.6 Validation

Run:

```bash
npm run build
npm test
```

---

## 9.7 Completion Criteria

- Jobs can be listed.
- Job detail works.
- Company can create a job.
- Company can retrieve its own jobs.
- Company identity cannot be spoofed from request body.
- Validation works.
- Ownership is enforced.

Stop after Stage 4.

---

# 10. Stage 5 — Applications & Application History Backend

## Objective

Implement the core Job Application business process.

This is one of the most important stages of the assessment.

---

## 10.1 Apply Job

Create an endpoint for Job Seekers to apply.

Example REST design:

```http
POST /api/jobs/:jobId/applications
```

Only `JOB_SEEKER` may use it.

---

## 10.2 Apply Logic

The service should:

1. Identify authenticated Job Seeker.
2. Validate Job ID.
3. Verify Job exists.
4. Check whether the Job Seeker already applied.
5. Create Application with `APPLIED`.
6. Create ApplicationStatusHistory with `APPLIED`.

Steps 5 and 6 must use a transaction.

---

## 10.3 Duplicate Protection

Protect duplicates through:

1. service-level check
2. compound database unique constraint

If duplicate application occurs:

```http
409 Conflict
```

Handle database-level unique violations safely.

Do not leak Prisma errors.

---

## 10.4 My Applications

Create an endpoint that returns applications belonging to the
authenticated Job Seeker.

Example:

```http
GET /api/applications/me
```

Return useful related Job and Company information.

Never accept a different Job Seeker ID from the client as proof of
ownership.

---

## 10.5 Company Candidates

Create an endpoint allowing a Company to view applications associated
with its own jobs.

A possible design:

```http
GET /api/jobs/:jobId/applications
```

Before returning applications:

1. authenticate Company
2. verify Company role
3. retrieve Job
4. verify Job belongs to authenticated Company
5. return candidates

---

## 10.6 Status Update

Create an endpoint such as:

```http
PATCH /api/applications/:applicationId/status
```

Only Company users may use it.

Before changing the status:

1. authenticate
2. authorize Company
3. validate Application ID
4. retrieve Application and related Job
5. verify owning Company
6. validate requested ApplicationStatus
7. compare requested and current status

If requested status equals current status:

```http
400 Bad Request
```

Do not update the Application.

Do not create history.

---

## 10.7 Status Transaction

For a valid status change:

```text
Update Application.status
+
Insert ApplicationStatusHistory
```

Use a Prisma transaction.

Both writes must succeed or both must fail.

---

## 10.8 Security Review

Specifically test against ID manipulation.

Examples:

- Company A requests Company B application ID.
- Company A requests candidate data for Company B Job ID.
- Job Seeker attempts Company status route.
- Company attempts Job Seeker apply route.

All must be rejected appropriately.

---

## 10.9 Completion Criteria

- Job Seeker can apply.
- Initial status is APPLIED.
- Initial APPLIED history exists.
- Duplicate application is prevented.
- Job Seeker can retrieve own applications.
- Company can retrieve its own candidates.
- Company can change status.
- History is recorded.
- Same-status update is rejected.
- Cross-Company access is blocked.
- Cross-role access is blocked.

Stop after Stage 5.

---

# 11. Stage 6 — Backend Integration & Testing

## Objective

Verify the backend as one coherent system before major frontend feature
implementation begins.

---

## 11.1 Critical Automated Tests

Prioritize tests covering business rules.

### Applications

Test:

- first application succeeds
- duplicate application fails
- initial status is APPLIED
- initial history exists

### Ownership

Test:

- Company A can access Company A data
- Company A cannot access Company B candidate data
- Company A cannot update Company B application

### Status

Test:

- valid status update succeeds
- status update creates history
- invalid status fails
- same-status update fails
- same-status update does not create history

### Authentication and Authorization

Test:

- anonymous protected request fails
- wrong role fails
- valid role succeeds

---

## 11.2 Manual API Flow

Test the complete backend workflow.

### Step 1

Register Company A.

### Step 2

Login Company A.

### Step 3

Create Job A.

### Step 4

Register/login Job Seeker.

### Step 5

Retrieve available jobs.

### Step 6

Retrieve Job A detail.

### Step 7

Apply to Job A.

### Step 8

Attempt duplicate application.

Expected:

```http
409 Conflict
```

### Step 9

Login Company A.

### Step 10

Retrieve Job A candidates.

### Step 11

Change candidate status.

### Step 12

Retrieve Job Seeker applications.

Verify updated status.

### Step 13

Use Company B account to attempt access to Company A application.

Expected:

```http
403 Forbidden
```

---

## 11.3 Validation

Run:

```bash
npm run build
npm test
npx prisma format
npx prisma validate
```

---

## 11.4 Completion Criteria

The main backend workflow works end-to-end.

Do not begin major frontend feature work until backend API contracts are
reasonably stable.

Stop after Stage 6.

---

# 12. Stage 7 — Frontend Foundation & Authentication

## Objective

Complete the frontend foundation and authentication flow.

---

## 12.1 API Client

Complete:

```text
axiosInstance.ts
auth.api.ts
```

Axios should:

- use `VITE_API_BASE_URL`
- attach JWT to authenticated requests
- safely handle authentication failure

Do not log tokens.

---

## 12.2 Authentication State

Use React Context.

Expected authentication state should support:

- authenticated user
- user role
- token/session state
- authentication loading state where necessary

Do not introduce Redux or Zustand.

---

## 12.3 Routes

Implement:

- public routes
- protected routes
- Job Seeker-only routes
- Company-only routes

Frontend protection improves UX.

Backend remains the actual security boundary.

---

## 12.4 Login

Implement:

- email
- password
- validation
- loading state
- submit prevention while loading
- API error feedback

---

## 12.5 Registration

Support:

- Job Seeker
- Company

Use:

- React Hook Form
- Zod

Provide appropriate fields based on selected role.

---

## 12.6 Logout

Logout should:

- clear token
- clear authentication context
- return user to appropriate public route

---

## 12.7 Validation

Run:

```bash
npm run build
```

Run:

```bash
npm run lint
```

if the script exists.

---

## 12.8 Completion Criteria

- Registration works.
- Login works.
- Logout works.
- Authentication persists appropriately.
- Invalid session is handled.
- Role routes work.
- Forms validate.
- UI includes loading and error feedback.

Stop after Stage 7.

---

# 13. Stage 8 — Job Seeker Frontend

## Objective

Implement the complete Job Seeker workflow.

---

## 13.1 Job List Page

Display:

- Job title
- Company
- Location
- formatted salary
- Job type

Provide:

- loading state
- error state
- empty state

---

## 13.2 Job Detail Page

Display:

- Job title
- Company
- location
- salary
- Job type
- description

Provide Apply Job action.

---

## 13.3 Apply UX

When Apply is clicked:

- disable button while submitting
- prevent repeated frontend submission
- show success feedback
- show understandable API errors

Backend remains the source of truth for duplicate prevention.

If the backend returns `409 Conflict`, display an understandable message.

---

## 13.4 My Applications

Display:

- Job
- Company
- location
- Job type
- application date
- current status

Provide readable status presentation.

---

## 13.5 Security

The frontend must not assume that hiding Company navigation prevents
Company API access.

Do not expose or log the JWT.

---

## 13.6 Completion Criteria

From the frontend a Job Seeker can:

1. Login.
2. View jobs.
3. View job detail.
4. Apply.
5. Receive feedback.
6. View My Applications.
7. View current status.

Stop after Stage 8.

---

# 14. Stage 9 — Company Frontend

## Objective

Implement the complete Company workflow.

---

## 14.1 My Jobs

Display jobs owned by authenticated Company.

Provide:

- loading state
- empty state
- error state

---

## 14.2 Create Job

Form fields:

- Title
- Location
- Salary
- Job Type
- Description

Use:

- React Hook Form
- Zod

Requirements:

- meaningful labels
- input validation
- submit loading state
- duplicate-submit prevention
- API error feedback
- success feedback

---

## 14.3 Candidates

Display:

- Candidate name
- Candidate email
- Job
- Application date
- Current status

---

## 14.4 Status Update

Allow selection of:

```text
APPLIED
REVIEWING
SHORTLISTED
REJECTED
ACCEPTED
```

Prevent unnecessary submission when the selected status is unchanged
where possible.

Backend still validates this rule.

Show:

- updating/loading state
- success feedback
- API error feedback

---

## 14.5 Completion Criteria

From the frontend Company can:

1. Login.
2. View its jobs.
3. Create a job.
4. View candidates.
5. Change application status.
6. Receive understandable feedback.

Stop after Stage 9.

---

# 15. Stage 10 — Frontend Integration & Responsive UI

## Objective

Improve usability, consistency, and responsive behavior without turning
the project into a design-heavy assessment.

---

## 15.1 Reusable Components

Extract reusable components where real duplication exists.

Possible components:

- Button
- Input
- Select
- Badge
- Loading indicator
- Error state
- Empty state
- Page container
- navigation/layout components

Do not create a large custom design system.

---

## 15.2 Responsive Design

Verify:

- desktop
- tablet
- mobile

Review:

- navigation
- forms
- job cards
- tables
- candidate list
- application list
- spacing
- overflowing content

Use cards or controlled horizontal scrolling if tables become unusable
on mobile.

---

## 15.3 Accessibility

Review:

- semantic HTML
- labels
- keyboard accessibility
- focus state
- meaningful button text
- understandable heading hierarchy

---

## 15.4 UX Consistency

Verify all asynchronous screens appropriately handle:

- loading
- errors
- empty results
- success feedback

Ensure important buttons cannot be accidentally submitted multiple
times.

---

## 15.5 Completion Criteria

The application is:

- readable
- understandable
- responsive
- consistent
- usable on desktop and mobile

Stop after Stage 10.

---

# 16. Stage 11 — Final Security & Code Quality Audit

## Objective

Perform a final technical audit.

This stage is not where security is first implemented.

Security should already exist throughout previous stages.

This stage verifies that no important issue remains.

---

## 16.1 Authentication Review

Verify:

- bcrypt implementation
- JWT signature validation
- JWT expiration
- protected routes
- safe login errors
- rate limiting

---

## 16.2 Authorization Review

Verify:

- backend role guards
- Company ownership
- Job Seeker ownership
- direct API access cannot bypass frontend restrictions

---

## 16.3 Input Review

Verify Zod validation for:

- body
- params
- relevant query parameters
- enums
- salary
- authentication fields

Search for unsafe direct usage such as passing uncontrolled request
objects into Prisma.

---

## 16.4 Data Exposure Review

Verify API never returns:

- passwordHash
- token unnecessarily
- secrets
- Prisma internals
- stack traces
- sensitive logs

---

## 16.5 Database Review

Verify:

- foreign keys
- unique email
- unique Company relation
- duplicate application constraint
- indexes
- transactions

---

## 16.6 Frontend Security Review

Verify:

- no dangerous HTML rendering
- no JWT console logging
- no passwords logged
- no sensitive data included unnecessarily in client state
- authenticated failures are handled safely

---

## 16.7 TypeScript Review

Verify:

- strict mode
- minimal `any`
- no unnecessary unsafe casts
- API/domain types are understandable

---

## 16.8 Architecture Review

Verify:

```text
Route
↓
Middleware
↓
Controller
↓
Service
↓
Prisma
```

Controllers should remain thin.

Business rules should not be duplicated across controllers.

---

## 16.9 Cleanup

Remove:

- debug logs
- obsolete commented code
- unused imports
- unused dependencies
- dead files
- temporary development code

Do not remove documentation that is still useful.

---

## 16.10 Validation

Backend:

```bash
npm run build
npm test
npx prisma format
npx prisma validate
```

Frontend:

```bash
npm run build
```

Run lint where available.

---

## 16.11 Completion Criteria

No significant security, code quality, type safety, database integrity,
or assessment-blocking issue remains.

Stop after Stage 11.

---

# 17. Stage 12 — Deployment

## Objective

Deploy the complete application.

---

## 17.1 PostgreSQL

Use Neon PostgreSQL.

Configure:

```text
DATABASE_URL
DIRECT_URL
```

Apply production migrations using the appropriate direct connection.

Never commit production database credentials.

---

## 17.2 Backend

Deploy:

```text
indokerja-backend
```

to Vercel.

Configure:

```text
DATABASE_URL
DIRECT_URL
JWT_SECRET
JWT_EXPIRES_IN
CORS_ORIGIN
NODE_ENV
```

Verify:

```http
GET /api/health
```

---

## 17.3 Frontend

Deploy:

```text
indokerja-frontend
```

as a separate Vercel project.

Configure:

```text
VITE_API_BASE_URL
```

pointing to the production backend API.

---

## 17.4 Production CORS

Backend production CORS should use the exact configured frontend origin.

Do not use:

```text
*
```

unless explicitly justified for a different environment.

---

## 17.5 Production End-to-End Test

Verify:

1. Register Company.
2. Login Company.
3. Create Job.
4. Register/Login Job Seeker.
5. View Job.
6. Apply.
7. Duplicate Apply fails.
8. Company sees candidate.
9. Company changes status.
10. Job Seeker sees updated status.
11. Company B cannot modify Company A application.

---

## 17.6 Completion Criteria

- Neon works.
- Backend production works.
- Frontend production works.
- CORS works.
- Authentication works.
- End-to-end application flow works.

Stop after Stage 12.

---

# 18. Stage 13 — Final Assessment Audit & Documentation

## Objective

Prepare the repositories for technical assessment submission.

---

## 18.1 README Documentation

Backend and frontend README files should clearly document:

- Project overview
- Features
- Technology stack
- Requirements
- Local setup
- Environment variables
- Installation
- Database migration
- Seed
- Development command
- Build command
- Testing command
- Demo credentials where appropriate
- Production URL

README should allow a reviewer to understand how to run the project
without guessing.

---

## 18.2 Repository Cleanup

Verify:

- `.env` is ignored
- `.env.example` exists
- no credentials are committed
- no temporary files remain
- no obsolete source files remain
- no unnecessary build artifacts are committed
- dependencies are appropriate

---

## 18.3 Final Technical Commands

Backend:

```bash
npm run build
npm test
npx prisma format
npx prisma validate
```

Frontend:

```bash
npm run build
```

Run lint where configured.

---

# 19. Final Assessment Checklist

## Authentication

- [ ] Job Seeker can register.
- [ ] Company can register.
- [ ] Job Seeker can login.
- [ ] Company can login.
- [ ] JWT authentication works.
- [ ] Wrong role is rejected.

## Jobs

- [ ] Job list works.
- [ ] Job detail works.
- [ ] Required fields are displayed.
- [ ] Company can create Job.
- [ ] Company can view its own Jobs.

## Applications

- [ ] Job Seeker can apply.
- [ ] Initial status is APPLIED.
- [ ] Initial history is created.
- [ ] Duplicate application is rejected.
- [ ] Database duplicate constraint works.
- [ ] My Applications works.

## Candidates

- [ ] Company can view candidates.
- [ ] Company ownership is enforced.
- [ ] Company B cannot access Company A application.

## Status

- [ ] APPLIED is supported.
- [ ] REVIEWING is supported.
- [ ] SHORTLISTED is supported.
- [ ] REJECTED is supported.
- [ ] ACCEPTED is supported.
- [ ] Company can update status.
- [ ] Status history is created.
- [ ] Same-status update is rejected.
- [ ] Same-status update creates no history.

## Database

- [ ] PostgreSQL is used.
- [ ] Prisma schema validates.
- [ ] Relationships are correct.
- [ ] Foreign keys are correct.
- [ ] Unique constraints are correct.
- [ ] Useful indexes exist.
- [ ] Transactions protect related writes.

## API

- [ ] REST API is consistent.
- [ ] Zod validation works.
- [ ] Errors are predictable.
- [ ] HTTP status codes are meaningful.
- [ ] Internal errors are not exposed.

## Security

- [ ] bcrypt hashes passwords.
- [ ] JWT is verified.
- [ ] JWT expiration is enforced.
- [ ] Role authorization is backend-enforced.
- [ ] Ownership is backend-enforced.
- [ ] Helmet is enabled.
- [ ] Auth rate limiting exists.
- [ ] Production CORS is restricted.
- [ ] Password hashes are not exposed.
- [ ] Secrets are not committed.
- [ ] No sensitive logs remain.

## Code Quality

- [ ] TypeScript strictness is preserved.
- [ ] `any` is minimal.
- [ ] Controllers are thin.
- [ ] Business logic is in services.
- [ ] Validation is reusable.
- [ ] Dead code is removed.
- [ ] No unnecessary architecture is introduced.

## Frontend

- [ ] Login works.
- [ ] Registration works.
- [ ] Job Seeker flow works.
- [ ] Company flow works.
- [ ] Loading states exist.
- [ ] Error states exist.
- [ ] Empty states exist.
- [ ] Forms prevent duplicate submission.
- [ ] UI works on desktop.
- [ ] UI works on mobile.
- [ ] Basic accessibility is respected.

## Deployment

- [ ] Backend is online.
- [ ] Frontend is online.
- [ ] Neon is connected.
- [ ] CORS works.
- [ ] Production end-to-end flow passes.

---

# 20. Rules for Codex and Coding Agents

These rules apply whenever an automated coding agent works on the project.

## Before Coding

Always:

1. Read `PROJECT_SPEC.md`.
2. Read `IMPLEMENTATION_PLAN.md`.
3. Read `AGENTS.md` if available.
4. Inspect relevant existing files.
5. Run `git status`.
6. Understand existing implementation.
7. Identify files that need changes.

Do not edit files blindly.

---

## During Implementation

Always:

1. Work only on the requested stage.
2. Preserve working architecture.
3. Follow existing project conventions.
4. Implement security with the feature.
5. Implement validation with the feature.
6. Implement authorization with the feature.
7. Implement ownership checks with the feature.
8. Handle important edge cases.
9. Keep TypeScript strict.
10. Avoid unrelated refactoring.
11. Avoid unnecessary dependencies.
12. Avoid unnecessary abstraction.

---

## Security Rule

Do not treat security as a separate feature that can simply be added later.

For every backend feature, determine whether it requires:

- authentication
- authorization
- ownership validation
- input validation
- database constraints
- transaction handling
- safe serialization
- secure error handling

Implement those protections during the same stage.

---

## Verification Rule

After implementation, run all relevant available validation commands.

Do not claim:

- build passed
- test passed
- migration passed
- Prisma validated
- lint passed

unless the command was actually executed successfully.

If something cannot be run because of missing environment configuration,
state that clearly.

---

## Completion Report

At the end of every stage provide:

### Summary

What was implemented.

### Files Created

List new files.

### Files Modified

List modified files.

### Technical Decisions

Explain important implementation decisions.

### Security Review

Explain what security considerations were implemented.

### Database Considerations

Explain constraints, transactions, relationships, or indexes relevant to
the stage.

### Validation

List commands actually executed.

Example:

```text
npm run build       PASS
npm test            PASS
npx prisma validate PASS
```

Do not fabricate results.

### Known Limitations

Mention anything that could not be completed or verified.

### Next Recommended Stage

State the next stage.

Do not start it automatically.

---

# 21. Ambiguity Rule

If a requirement is ambiguous and the decision could materially affect:

- architecture
- database design
- API contract
- authentication
- authorization
- security
- ownership rules
- deployment architecture
- major user workflow

STOP before implementing that decision.

Explain:

1. what is ambiguous
2. available reasonable options
3. advantages/disadvantages where relevant
4. recommended option

Wait for user confirmation.

For minor implementation details that do not materially affect the
requirements, use the simplest maintainable solution and document the
decision.

Do not ask unnecessary questions about trivial coding details.

---

# 22. Overengineering Rule

Do not introduce architecture merely because it is considered an advanced
pattern.

Do not add:

- microservices
- CQRS
- event sourcing
- repository abstraction without need
- dependency injection frameworks
- message queues
- Redis
- GraphQL
- Redux
- complex state machines
- generic abstraction layers

unless a real requirement justifies them.

Preferred backend architecture remains:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

The goal is professional simplicity.

---

# 23. Final Development Principle

The purpose of this assessment is not to produce the largest application.

The goal is to produce an application that demonstrates:

```text
Correct Functionality
        +
Good Database Design
        +
Secure Backend
        +
Clean REST API
        +
Maintainable Code
        +
Responsive UI
        +
Reliable Deployment
```

Always prioritize these qualities over unnecessary feature quantity.
