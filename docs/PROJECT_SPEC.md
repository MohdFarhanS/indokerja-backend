# IndoKerja — Job Application Management
## Project Specification

---

## 1. Project Overview

IndoKerja is a simple Job Application Management web application that
simulates the job application process on IndoKerja.id.

The system supports two primary user roles:

1. Job Seeker
2. Company

This project is developed as a technical assessment.

The primary assessment focus is:

- Functional correctness
- Code quality
- Database design
- REST API design
- Authentication
- Authorization
- API validation
- Proper error handling
- Security
- Responsive UI
- Clean and maintainable code

The application must remain focused on the assessment requirements.

Do not introduce unnecessary features or architectural complexity.

Guiding principle:

> Simple, correct, secure, maintainable, and complete is better than
> complex but fragile.

---

# 2. Engineering Standards

The objective is not only to make the application work.

The implementation must follow normal professional web application
engineering practices.

The project should demonstrate:

- secure backend design
- correct authentication and authorization
- relational database integrity
- consistent REST API design
- predictable error handling
- clear separation of concerns
- reusable code where appropriate
- proper TypeScript typing
- responsive user interface
- understandable loading, error, empty, and success states
- maintainable project structure
- secure handling of credentials and user data

A feature is not considered complete only because its happy path works.

Where relevant, each feature must also handle:

- authentication
- authorization
- ownership
- validation
- database integrity
- error handling
- security
- important edge cases
- user feedback
- type safety

Security and validation must be implemented together with each feature.

Do not postpone fundamental security work until the final security audit.

---

# 3. Technology Stack

## 3.1 Frontend

- React.js
- TypeScript
- Vite
- React Router DOM
- Axios
- React Hook Form
- Zod

## 3.2 Backend

- Node.js
- TypeScript
- Express.js

## 3.3 Database

- PostgreSQL
- Neon PostgreSQL for production hosting

## 3.4 ORM

- Prisma

## 3.5 Authentication

- JSON Web Token (JWT)
- Access-token authentication

## 3.6 Password Security

- bcrypt

## 3.7 API

- REST API
- JSON request and response

## 3.8 Validation

Backend:

- Zod

Frontend:

- React Hook Form
- Zod

## 3.9 HTTP Client

- Axios

## 3.10 Testing

- Jest

Testing should focus primarily on critical backend business rules.

## 3.11 Deployment

Frontend:

- Vercel

Backend:

- Vercel Serverless Functions

Database:

- Neon PostgreSQL

---

# 4. User Roles

The application contains exactly two roles.

## 4.1 Job Seeker

A Job Seeker is a user looking for available jobs.

A Job Seeker can:

- Register an account
- Login
- View available job vacancies
- View job details
- Apply for jobs
- View jobs they have applied to
- View the current status of each application

## 4.2 Company

A Company represents an employer.

A Company can:

- Register an account
- Login
- Create job vacancies
- View its own job vacancies
- View candidates who applied to its jobs
- View candidate application information
- Change candidate application status

A Company must never be able to access or manage jobs and applications
belonging to another Company.

---

# 5. Authentication

## 5.1 Registration

The application supports registration for:

- Job Seeker
- Company

### Job Seeker Registration

Required information:

- Name
- Email
- Password
- Role

Role:

`JOB_SEEKER`

### Company Registration

Required information:

- Company Name
- Email
- Password
- Role

Optional information:

- Company Description

Role:

`COMPANY`

The backend must validate registration data before creating the account.

Passwords must be hashed before being stored.

---

## 5.2 Login

Users authenticate using:

- Email
- Password

After successful authentication, the backend returns a JWT access token.

Protected requests use:

```http
Authorization: Bearer <token>
```

JWT expiration must be enforced.

Invalid or expired tokens must not provide access to protected resources.

---

## 5.3 Authentication Token Storage

For this assessment, the frontend stores the JWT access token in:

`localStorage`

Axios attaches the token to protected requests.

Because the token is stored in localStorage, the application must pay
particular attention to XSS prevention.

Do not use unsafe HTML rendering unless absolutely necessary.

---

# 6. Authorization

Authorization must always be enforced on the backend.

Frontend route guards are a user-interface convenience and are not a
security boundary.

Role rules:

- Job Seeker-only routes require `JOB_SEEKER`
- Company-only routes require `COMPANY`

Resource ownership must also be validated.

Examples:

- Company A cannot manage Company B jobs.
- Company A cannot access Company B applications.
- A Job Seeker can only see their own applications.
- A Company can only manage applications associated with jobs owned by
  that Company.

Never trust ownership information supplied by the frontend.

Where possible, resource ownership must be derived from:

1. authenticated user identity
2. database relationships

---

# 7. Job Management

## 7.1 Job Information

Every job vacancy contains:

- Job title
- Company
- Location
- Salary
- Job type
- Job description
- Created date

Company information should be obtained through the Company relationship.

Do not duplicate the Company name inside the Job table unnecessarily.

---

## 7.2 Job Type

Supported job types:

- `FULL_TIME`
- `PART_TIME`
- `CONTRACT`
- `INTERNSHIP`

Job type should use a Prisma/database enum.

---

## 7.3 Salary

For this assessment, salary represents a single monthly salary amount
in Indonesian Rupiah.

Example stored value:

```text
5000000
```

Frontend representation:

```text
Rp5.000.000
```

Salary must be stored as numeric data, not preformatted text.

Do not introduce:

- salary ranges
- salary minimum/maximum
- negotiable salary
- compensation packages
- additional currency models

unless explicitly required later.

---

## 7.4 Create Job

Only a Company user can create a job.

The authenticated Company becomes the owner of the created job.

The backend must derive the Company identity from the authenticated
account.

Do not trust a `companyId` supplied by the frontend when determining
resource ownership.

Required job fields:

- title
- location
- salary
- jobType
- description

---

## 7.5 View Jobs

A Job Seeker can view available job vacancies.

Minimum information displayed:

- Job title
- Company
- Location
- Salary
- Job type

---

## 7.6 View Job Detail

A Job Seeker can view complete information about a selected job.

The detail contains:

- Job title
- Company
- Location
- Salary
- Job type
- Job description

---

## 7.7 Company Job List

A Company can view job vacancies created by that Company.

Company-specific endpoints must not expose internal management
information belonging to another Company.

---

## 7.8 Job Editing and Deletion

Job editing and deletion are outside the current assessment scope.

Do not implement them unless explicitly requested later.

---

# 8. Job Application

## 8.1 Apply Job

Only Job Seekers can apply for a job.

Applying is a one-click action.

No CV, resume, or document upload is required.

The backend determines:

- authenticated Job Seeker
- target Job

Initial application status:

`APPLIED`

---

## 8.2 Duplicate Application Prevention

A Job Seeker must never be able to apply to the same job more than once.

This business rule must be enforced at two levels.

### Service Layer

Before creating the application, verify whether an application already
exists for:

```text
jobId + jobSeekerId
```

### Database Layer

The database must have a compound unique constraint for:

```text
jobId + jobSeekerId
```

The database constraint is mandatory.

This protects the system even if:

- service-level validation fails
- concurrent requests are received
- duplicate requests are submitted quickly

A duplicate application should return:

`409 Conflict`

---

# 9. Application Status

Supported application statuses:

- `APPLIED`
- `REVIEWING`
- `SHORTLISTED`
- `REJECTED`
- `ACCEPTED`

Every new application starts with:

`APPLIED`

Only the Company that owns the related Job may change the application
status.

---

## 9.1 Status Transition Rules

This assessment does not require a complex workflow state machine.

A Company may move an application from its current status to any other
valid ApplicationStatus value.

For example:

```text
APPLIED -> REVIEWING
APPLIED -> SHORTLISTED
APPLIED -> REJECTED
APPLIED -> ACCEPTED
REVIEWING -> SHORTLISTED
REVIEWING -> REJECTED
REVIEWING -> ACCEPTED
```

No mandatory sequential workflow is required.

---

## 9.2 Same Status Update

If the requested status is already the current application status:

- do not update the Application
- do not create a history record
- return `400 Bad Request`

Example error:

```json
{
  "success": false,
  "message": "Application already has this status"
}
```

This prevents meaningless duplicate history records.

---

# 10. Application History

Every meaningful application status must be recorded in
ApplicationStatusHistory.

Application history acts as an audit trail.

---

## 10.1 Initial History

When a Job Seeker successfully applies:

```text
Application.status = APPLIED
```

and:

```text
ApplicationStatusHistory.status = APPLIED
```

must both be created.

These writes should occur atomically using a Prisma transaction.

---

## 10.2 Status Change History

Whenever the owning Company changes the application status:

1. Verify authentication.
2. Verify Company role.
3. Verify resource ownership.
4. Verify requested status.
5. Verify requested status differs from current status.
6. Update `Application.status`.
7. Insert a new `ApplicationStatusHistory`.

The status update and history creation should occur in the same database
transaction.

Existing history must never be overwritten when a status changes.

---

## 10.3 History Information

ApplicationStatusHistory contains at least:

- ID
- Application ID
- Status
- Created timestamp

History records should be treated as immutable audit records.

---

# 11. Job Seeker — My Applications

A Job Seeker can view jobs they have already applied to.

The page should display at least:

- Job title
- Company
- Location
- Job type
- Application date
- Current application status

A Job Seeker must only be able to access their own applications.

---

# 12. Company — Candidates

A Company can view candidates who applied to jobs owned by that Company.

Minimum information:

- Candidate name
- Candidate email
- Job title
- Application date
- Current application status

The Company can update candidate application status.

The backend must verify ownership before:

- returning candidate data
- updating application status

---

# 13. Database Design

The core relational models are:

- User
- Company
- Job
- Application
- ApplicationStatusHistory

---

## 13.1 User

Represents an authenticated account.

Suggested fields:

- id
- name
- email
- passwordHash
- role
- createdAt
- updatedAt

Requirements:

- Email must be unique.
- Password must never be stored in plain text.
- Password hash must never be returned through API responses.

---

## 13.2 Company

Represents Company-specific profile information.

Suggested fields:

- id
- userId
- name
- description
- createdAt
- updatedAt

Relationship:

```text
User 1 --- 0..1 Company
```

A Company profile belongs to one Company user.

`userId` must be unique.

---

## 13.3 Job

Suggested fields:

- id
- companyId
- title
- location
- salary
- jobType
- description
- createdAt
- updatedAt

Relationships:

```text
Company 1 --- N Job
Job 1 --- N Application
```

---

## 13.4 Application

Suggested fields:

- id
- jobId
- jobSeekerId
- status
- createdAt
- updatedAt

Relationships:

```text
Job 1 --- N Application
User 1 --- N Application
Application 1 --- N ApplicationStatusHistory
```

Required unique constraint:

```text
UNIQUE(jobId, jobSeekerId)
```

---

## 13.5 ApplicationStatusHistory

Suggested fields:

- id
- applicationId
- status
- createdAt

Relationship:

```text
Application 1 --- N ApplicationStatusHistory
```

Application history should not require `updatedAt` because history entries
are intended to be immutable.

---

# 14. Database Constraints

At minimum implement:

- unique User email
- unique Company.userId
- foreign key Company -> User
- foreign key Job -> Company
- foreign key Application -> Job
- foreign key Application -> Job Seeker
- foreign key ApplicationStatusHistory -> Application
- compound unique Application(jobId, jobSeekerId)

Add useful indexes for frequently queried relationships such as:

- companyId
- jobId
- jobSeekerId
- applicationId
- application status

Do not add redundant data merely to avoid normal relational joins.

---

# 15. Database Integrity

Database integrity must not depend entirely on frontend or service-layer
validation.

Business rules that can reasonably be represented as database constraints
should be enforced in the database.

Transactions should be used when multiple database writes represent one
logical business operation.

Important examples:

### Apply Job

```text
Create Application
+
Create APPLIED ApplicationStatusHistory
```

### Change Status

```text
Update Application.status
+
Create ApplicationStatusHistory
```

Both operations should be atomic.

---

# 16. Backend Architecture

Use the existing modular architecture.

Expected structure:

```text
src/
├── config/
├── middlewares/
├── modules/
│   ├── auth/
│   ├── jobs/
│   ├── applications/
│   └── companies/
├── utils/
├── app.ts
└── server.local.ts
```

---

## 16.1 Routes

Routes define:

- endpoint path
- HTTP method
- required middleware
- controller

Business logic must not be placed in route definitions.

---

## 16.2 Controllers

Controllers handle HTTP concerns.

Responsibilities:

- read request data
- read route/query parameters
- access authenticated user information
- call service functions
- return appropriate HTTP responses

Controllers should remain thin.

Large business logic must not be placed in controllers.

---

## 16.3 Services

Services contain application business rules.

Responsibilities may include:

- Prisma operations
- duplicate application checking
- ownership checking
- application creation
- status updates
- history creation
- transaction handling

---

## 16.4 Validation

Zod should validate external input where applicable.

This includes:

- request body
- route parameters
- query parameters
- enum values

Invalid client input should normally return:

`400 Bad Request`

Do not pass arbitrary request bodies directly into Prisma.

Explicitly select fields that are allowed to be created or updated.

---

## 16.5 Middleware

Reusable middleware should handle concerns such as:

- authentication
- role authorization
- request validation
- global error handling

Avoid duplicating these concerns inside controllers.

---

# 17. REST API Design

Use conventional REST API practices.

Typical HTTP methods:

- `GET`
- `POST`
- `PATCH`

`DELETE` is not required by the current specification.

Use nouns and resources consistently in endpoint naming.

Avoid action-style endpoint names when a normal REST resource operation
can represent the behavior clearly.

---

# 18. API Response Standard

API responses should remain predictable across modules.

## 18.1 Successful Response

Example:

```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {}
}
```

`message` may be omitted when it does not add useful information.

---

## 18.2 Error Response

Example:

```json
{
  "success": false,
  "message": "You have already applied to this job"
}
```

Validation errors may additionally contain structured errors.

Example:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": [
      "Invalid email address"
    ]
  }
}
```

Internal exception details must not be exposed.

---

## 18.3 HTTP Status Codes

Use HTTP status codes according to their meaning.

Typical examples:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Examples:

- invalid request -> 400
- invalid credentials -> 401
- missing authentication -> 401
- authenticated but wrong role -> 403
- resource ownership violation -> 403
- missing job/application -> 404
- duplicate application -> 409

---

# 19. Error Handling

The backend must use centralized error handling.

Expected categories include:

- validation error
- authentication error
- authorization error
- resource not found
- duplicate/conflict
- business-rule violation
- internal server error

Production API responses must not expose:

- stack traces
- Prisma internals
- database credentials
- raw database errors
- JWT secrets
- password hashes
- environment variables
- filesystem paths

Unexpected server errors should return a generic safe response.

---

# 20. Security by Design

Security is a cross-cutting requirement.

Security must be considered during every implementation stage.

It is not acceptable to create insecure functionality and postpone all
security work until the final audit.

Every backend endpoint must be reviewed for:

1. Authentication
2. Role authorization
3. Resource ownership
4. Input validation
5. Business-rule validation
6. Safe database access
7. Safe response serialization
8. Error information exposure

---

## 20.1 Authentication Security

- Passwords must be hashed using bcrypt.
- Plain-text passwords must never be stored.
- Password hashes must never be returned.
- JWT secrets must come from environment variables.
- JWT expiration must be enforced.
- Invalid tokens must return 401.
- Expired tokens must return 401.
- JWT data must not be trusted before signature verification.

---

## 20.2 Authorization Security

Authorization must be enforced server-side.

Examples:

- Job Seekers cannot access Company-only routes.
- Companies cannot perform Job Seeker-only actions.
- Company A cannot manage Company B jobs.
- Company A cannot manage Company B applications.
- Job Seekers cannot retrieve another user's applications.

Never trust client-provided IDs as proof of ownership.

---

## 20.3 Input Security

All external input is untrusted.

Validate where applicable:

- body
- URL parameters
- query parameters
- email
- password
- job fields
- salary
- job type
- application status

Avoid mass assignment.

Example of what should generally be avoided:

```ts
prisma.job.create({
  data: req.body
});
```

Prefer explicit field mapping after validation.

---

## 20.4 API Security

Use:

- Helmet
- strict CORS configuration
- authentication endpoint rate limiting
- reasonable JSON body limits
- centralized error handling
- appropriate HTTP status codes

Do not expose sensitive information through errors.

---

## 20.5 Frontend Security

Preserve React's normal escaped rendering.

Do not use:

`dangerouslySetInnerHTML`

unless there is a real, reviewed, sanitized requirement.

Do not log:

- JWT tokens
- passwords
- Authorization headers
- sensitive credentials

Because JWT is stored in localStorage, XSS prevention is especially
important.

---

## 20.6 Database Security

Use Prisma for application database access.

Important database constraints must protect data integrity.

Use transactions where operations must succeed or fail as one logical
operation.

---

## 20.7 Secret Management

Never commit:

- `.env`
- database passwords
- JWT secrets
- production credentials

Only `.env.example` should describe required variables.

Production secrets must be configured through deployment environment
variables.

---

# 21. Logging

Development logging may be used for debugging.

Production logging must never expose:

- passwords
- password hashes
- JWT tokens
- Authorization headers
- database credentials
- environment variables

Temporary debug `console.log` statements should not remain in final code.

Operational errors may be logged server-side, but API responses must
remain sanitized.

---

# 22. Frontend Architecture

The frontend should follow the existing feature-oriented structure.

Expected areas include:

```text
src/
├── api/
├── components/
│   ├── common/
│   └── layout/
├── context/
├── features/
│   ├── auth/
│   ├── job-seeker/
│   └── company/
├── hooks/
├── routes/
└── types/
```

Use React Context for authentication.

Do not add Redux or Zustand unless a future requirement clearly requires
more complex global state.

---

# 23. Frontend Pages

## 23.1 Public

### Login Page

Contains:

- Email
- Password
- Login button
- Validation feedback
- Loading state
- API error feedback

### Register Page

Supports:

- Job Seeker registration
- Company registration

The form fields adapt appropriately based on selected role.

---

## 23.2 Job Seeker

### Job List

Displays available jobs.

### Job Detail

Displays complete job information.

Provides Apply Job action.

### My Applications

Displays:

- Job
- Company
- Application date
- Current status

---

## 23.3 Company

### My Jobs

Displays Company-owned jobs.

### Create Job

Contains:

- Title
- Location
- Salary
- Job Type
- Description

### Candidates

Displays:

- Candidate
- Candidate email
- Job
- Application date
- Current application status

Allows changing application status.

---

# 24. Frontend Authentication

Axios should use the configured API base URL.

For protected requests it should attach:

```http
Authorization: Bearer <token>
```

When the API returns an authentication failure caused by an invalid or
expired session:

- clear invalid authentication state
- remove invalid token
- redirect the user to login where appropriate

Do not create redirect loops.

---

# 25. Frontend UX Standards

The frontend must follow common web application usability patterns.

Every asynchronous page should consider:

- loading state
- success state
- error state
- empty state where applicable

Forms should:

- have understandable labels
- use appropriate input types
- show useful validation messages
- disable submission while submitting
- prevent accidental repeated submissions
- display API errors clearly
- remain usable with keyboard navigation

Buttons should clearly describe their action.

Navigation must clearly separate:

- Job Seeker functionality
- Company functionality

Responsive behavior should prioritize usability rather than decorative
complexity.

Basic accessibility should be respected:

- semantic HTML
- associated labels
- keyboard-accessible controls
- meaningful button text
- visible focus states
- readable hierarchy

---

# 26. Responsive UI

The application should work reasonably on:

- desktop
- tablet
- mobile

Pixel-perfect visual design is not required.

Functional clarity is more important than complex visual styling.

Tables must remain usable on smaller screens.

When appropriate, use:

- responsive cards
- controlled horizontal scrolling
- stacked layouts

Do not allow important content to become inaccessible on mobile.

---

# 27. Testing Strategy

Testing should focus on critical business logic.

Do not create a huge test suite merely to increase test count.

Priority cases include:

1. Duplicate job application is rejected.
2. Job Seeker cannot apply twice.
3. New application has APPLIED status.
4. Initial APPLIED history is created.
5. Company cannot access another Company's application.
6. Company cannot manage another Company's job.
7. Valid application status update succeeds.
8. Status update creates history.
9. Same-status update is rejected without new history.
10. Invalid status is rejected.
11. Unauthorized requests are rejected.
12. Incorrect role is rejected.

Tests should verify meaningful behavior rather than implementation details.

---

# 28. Seed Data

Development seed data should include at least:

- 1 Job Seeker account
- 2 Company accounts
- several jobs
- example applications
- application history

Seed passwords must still be hashed with bcrypt.

Demo credentials may be documented in README for assessment purposes.

Do not use real personal credentials.

---

# 29. Environment Configuration

Backend environment variables:

```text
NODE_ENV
PORT
DATABASE_URL
DIRECT_URL
JWT_SECRET
JWT_EXPIRES_IN
CORS_ORIGIN
```

Frontend:

```text
VITE_API_BASE_URL
```

Production values must not be committed to Git.

---

# 30. Deployment Architecture

Production architecture:

```text
User Browser
      |
      v
React + TypeScript + Vite
Vercel Frontend
      |
      | HTTPS REST API
      v
Express + TypeScript
Vercel Serverless Backend
      |
      | Prisma
      v
Neon PostgreSQL
```

Frontend and backend are separate Vercel projects.

Production CORS must allow the configured frontend origin rather than
using a wildcard.

---

# 31. Health Check

The backend should expose a simple unauthenticated health endpoint.

Example:

```http
GET /api/health
```

Example response:

```json
{
  "status": "ok",
  "timestamp": "ISO_TIMESTAMP"
}
```

This endpoint is intended for deployment sanity checks.

---

# 32. Code Quality Standards

The project uses TypeScript strict mode.

Requirements:

- avoid `any` unless genuinely necessary
- avoid unsafe type assertions
- prefer explicit domain types
- use descriptive names
- keep functions focused
- avoid duplicate business logic
- keep controllers thin
- put business logic in services
- keep validation separate
- remove dead code
- remove obsolete commented code
- avoid unnecessary comments explaining obvious syntax
- preserve consistent formatting

Abstraction should solve real duplication or separation problems.

Do not create abstractions merely because they are theoretically
possible.

---

# 33. Avoid Overengineering

Professional engineering does not mean adding unnecessary architecture.

Do not introduce:

- microservices
- repository abstractions without a real need
- dependency injection frameworks
- CQRS
- event sourcing
- message queues
- Redis
- WebSockets
- GraphQL
- complex state machines
- complex design systems
- Redux
- unnecessary generic abstractions

unless explicitly required later.

Preferred backend flow:

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

Keep the implementation straightforward and understandable.

---

# 34. Non-Goals

Unless explicitly requested later, do not implement:

- CV upload
- resume parsing
- file storage
- social login
- email verification
- forgot password
- password-reset email
- chat
- notifications
- interview scheduling
- recommendation engine
- advanced search
- advanced filters
- admin dashboard
- multiple users per Company
- edit job
- delete job
- complex application state machine
- salary range system
- payment system
- microservices
- Redis
- queues
- WebSockets
- GraphQL

These features are outside the current assessment scope.

---

# 35. Definition of Done

The project is considered functionally complete when the following
requirements are satisfied.

## Authentication

- [ ] Job Seeker can register.
- [ ] Company can register.
- [ ] Job Seeker can login.
- [ ] Company can login.
- [ ] Passwords are securely hashed.
- [ ] Protected routes require valid authentication.
- [ ] Role authorization works.

## Jobs

- [ ] Job Seeker can view jobs.
- [ ] Job Seeker can view job detail.
- [ ] Company can create a job.
- [ ] Company can view its own jobs.
- [ ] Company ownership is enforced server-side.

## Applications

- [ ] Job Seeker can apply to a job.
- [ ] Initial status is APPLIED.
- [ ] Initial APPLIED history is created.
- [ ] Duplicate application is prevented at service level.
- [ ] Duplicate application is prevented at database level.
- [ ] Job Seeker can view My Applications.
- [ ] Company can view candidates for its jobs.

## Application Status

- [ ] Company can change candidate status.
- [ ] Current status updates correctly.
- [ ] Every meaningful status change creates history.
- [ ] Same-status update is rejected.
- [ ] Same-status update does not create history.
- [ ] Other Companies cannot update the application.

## Database

- [ ] PostgreSQL is used.
- [ ] Prisma relationships are correct.
- [ ] Foreign keys are correct.
- [ ] Unique constraints are correct.
- [ ] Useful indexes exist.
- [ ] Transactions protect multi-write business operations.

## API

- [ ] REST conventions are reasonably followed.
- [ ] Validation works.
- [ ] API responses are consistent.
- [ ] HTTP status codes are appropriate.
- [ ] Errors do not expose sensitive internals.

## Security

- [ ] bcrypt is used correctly.
- [ ] JWT verification works.
- [ ] Authorization is enforced server-side.
- [ ] Ownership is enforced server-side.
- [ ] Helmet is enabled.
- [ ] Authentication rate limiting exists.
- [ ] Production CORS is restricted.
- [ ] Sensitive fields are not returned.
- [ ] Secrets are not committed.

## Frontend

- [ ] Core pages work.
- [ ] Forms validate correctly.
- [ ] Loading states exist.
- [ ] Error states exist.
- [ ] Empty states exist where appropriate.
- [ ] Duplicate submissions are prevented where appropriate.
- [ ] UI is responsive.
- [ ] Basic accessibility is respected.

## Quality

- [ ] Backend TypeScript build succeeds.
- [ ] Frontend production build succeeds.
- [ ] Critical tests pass.
- [ ] Prisma schema validates.
- [ ] No significant dead code remains.
- [ ] No obvious security issue remains.

## Deployment

- [ ] Frontend deploys successfully.
- [ ] Backend deploys successfully.
- [ ] Neon database is connected.
- [ ] Production CORS works.
- [ ] Production end-to-end workflow works.