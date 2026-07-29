# Nexus Jobs

**A premium, full-stack MERN job portal — built for the Rhombix Technologies internship.**

Nexus Jobs connects job seekers with recruiters through one-click applications, instant job
publishing, and a real applicant pipeline — no admin approval layer, no bloated forms, no fake
dashboard numbers.

**Built by [Waqar Ali](https://waqar-ali-ten.vercel.app/)** — [GitHub](https://github.com/waqar-5) ·
[LinkedIn](https://www.linkedin.com/in/waqar-ali-997b962b5/) · [X](https://x.com/WaqarAli1353373)

---

## Table of contents

1. [What this project is](#what-this-project-is)
2. [Key product decisions](#key-product-decisions)
3. [Features](#features)
4. [User roles](#user-roles)
5. [Tech stack](#tech-stack)
6. [Architecture](#architecture)
7. [Project structure](#project-structure)
8. [Getting started](#getting-started)
9. [Environment variables](#environment-variables)
10. [Demo accounts](#demo-accounts)
11. [API reference](#api-reference)
12. [Security](#security)
13. [Email verification](#email-verification)
14. [File uploads](#file-uploads)
15. [Design system](#design-system)
16. [Troubleshooting](#troubleshooting)
17. [Known tradeoffs & next steps](#known-tradeoffs--next-steps)
18. [Internship context](#internship-context)

---

## What this project is

A job board where:

- **Job seekers** create one profile, upload one resume, and apply to any role in a single click —
  no re-entering the same information fifty times.
- **Recruiters** get a company profile the moment they register, publish jobs instantly (no
  approval queue), and manage every applicant through a real status pipeline.

Every number on every dashboard — job counts, applicant counts, pipeline breakdowns — comes from a
live MongoDB aggregation. Nothing is hardcoded.

---

## Key product decisions

These were deliberate scoping calls, not oversights:

| Decision | Reasoning |
|---|---|
| **One company per recruiter**, auto-created at registration | Multi-recruiter-per-company was out of scope; this keeps ownership simple and lets a recruiter post a job within seconds of signing up |
| **Jobs publish instantly** — no admin approval queue | There is no admin role in this app by design; recruiters are trusted to manage their own postings |
| **One-click apply** using the resume already on file, plus an optional cover note | Removes the single biggest source of job-board friction. Each application stores a **snapshot** of the resume at the time of applying, so a later resume update never silently rewrites what a recruiter already received |
| **Password reset & email verification links point at the backend**, not the frontend | The backend validates the token first, then redirects into the SPA. This means the link resolves correctly even if the frontend dev server happens to be down when it's clicked |
| **Email verification is informational, not blocking** | An unverified account can still fully use the app; a dismissible dashboard banner prompts verification. A misconfigured SMTP setup in development should never lock anyone out |

---

## Features

### Job seekers
- Register / log in / log out / forgot & reset password / email verification
- Editable profile — headline, bio, location, phone, skills, avatar
- Resume upload (PDF/DOC/DOCX) that powers one-click apply everywhere
- Search jobs by keyword, filter by type/work mode/experience/category, sort results
- Save/unsave jobs, paginated saved-jobs list
- Apply in one click with an optional cover note; duplicate applications are blocked
- Track every application's status: Applied → In review → Shortlisted → Interview → Rejected/Hired
- In-app notifications when a recruiter updates an application's status

### Recruiters
- Register / log in with an instant, auto-created company profile
- Full company editor — description, industry, size, founded year, website, perks, logo, cover image
- Create / edit / delete / close / reopen job postings — live the moment they're published, with
  full detail (responsibilities, requirements, nice-to-have, benefits, skills, salary range)
- Applicant pipeline, per job or across all jobs, with one-click status updates
- Dashboard analytics: total/open/closed jobs, total applicants, pipeline breakdown, top-performing
  jobs — all from real Mongo aggregation queries, charted with Recharts

### Shared
- Full dark/light mode
- Responsive from 320px to desktop, with dedicated mobile navigation and dashboard sidebar
- Skeleton loading states shaped like their final content (not generic spinners)
- Empty states with clear next actions on every list view
- Toast-based success/error feedback throughout (no silent failures)

---

## User roles

Two roles: `jobseeker` and `recruiter`. Enforcement happens **on the backend** — frontend route
guards (`client/src/routes/guards.jsx`) exist purely for UX (redirecting before a wasted request),
never as the actual security boundary.

| Role | Can | Cannot |
|---|---|---|
| `jobseeker` | Apply, save jobs, manage own profile/resume, view own applications | Create/edit/delete jobs, view other applicants, touch recruiter-only endpoints |
| `recruiter` | Create/edit/delete/close own jobs, manage own company, review own applicants | Touch another recruiter's jobs or company, access job-seeker-only endpoints |

Every mutating endpoint checks resource ownership server-side
(`job.recruiter.toString() === req.user._id.toString()`, or the company/user is scoped directly by
`req.user._id` in the query) before allowing any change.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 (Vite), React Router 6, Tailwind CSS, Radix UI primitives (shadcn-style), Framer Motion |
| Forms & validation | React Hook Form + Zod |
| HTTP client | Axios, with interceptors for auth headers and normalized error messages |
| Charts | Recharts (recruiter analytics) |
| Icons / toasts | lucide-react / react-hot-toast |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookie + bearer token) + bcrypt, role-based access control |
| File uploads | Multer → local disk (`/uploads`), served via `express.static` |
| Email | Nodemailer, with a console-log fallback when no SMTP is configured |
| Security middleware | Helmet, CORS, express-rate-limit, express-mongo-sanitize, xss-clean |

---

## Architecture

```
Frontend (React/Vite)
   │  axios (baseURL: /api, credentials: true)
   ▼
Express routes  →  middleware (auth/role/upload)  →  controllers  →  Mongoose models  →  MongoDB
```

Auth flow:
```
Login/Register → bcrypt compare/hash → JWT signed → httpOnly cookie + token in response body
                                                            │
Every subsequent request → Authorization: Bearer <token> → protect middleware → req.user
                                                            │
                                          authorize('recruiter'|'jobseeker') → role check
                                                            │
                                      controller-level ownership check on mutations
```

Upload flow:
```
Multer (disk storage, MIME + size validated) → random hex filename → /uploads/<type>/<file>
                                                       │
                                          path saved on the Mongo document
                                                       │
                                    served back to the client via express.static
```

---

## Project structure

```
nexus-jobs/
├── server/                        # Express API
│   ├── config/db.js                  # Mongoose connection
│   ├── models/                       # User, Company, Job, Application, SavedJob, Notification, Category
│   ├── middleware/                   # auth (JWT), role (RBAC), upload (Multer), errorHandler, rateLimiter
│   ├── controllers/                  # one file per resource
│   ├── routes/                       # one file per resource
│   ├── utils/                        # generateToken, sendEmail, apiFeatures (search/filter/sort/paginate), createNotification
│   ├── seed/seed.js                  # realistic demo data; also runs automatically on first boot
│   ├── uploads/                      # resumes/ avatars/ logos/ (gitkept, contents gitignored)
│   └── server.js                     # app entrypoint
└── client/                        # Vite + React SPA
    └── src/
        ├── api/                      # thin axios wrappers, one file per resource
        ├── components/
        │   ├── ui/                   # shadcn-style primitives — button, input, dialog, select, tabs, etc.
        │   ├── layout/                # Navbar, Footer, PublicLayout, AuthLayout, DashboardLayout
        │   ├── jobs/                 # JobCard ("boarding pass" design), JobFilters, skeletons
        │   ├── dashboard/             # StatCard
        │   └── common/                # Hero, Pagination, EmptyState, PageHeader, ConfirmDialog, NotificationsList, VerifyEmailBanner
        ├── context/                   # AuthContext, ThemeContext (dark/light)
        ├── pages/
        │   ├── seeker/                # Overview, Applications, SavedJobs, Profile
        │   └── recruiter/             # Overview, JobsList, JobForm, Applicants, Analytics, Company, Profile
        ├── lib/                       # cn(), formatters, zod schemas
        └── routes/guards.jsx          # ProtectedRoute, RoleRoute
```

---

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB instance — local (`mongod`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Backend

```bash
cd server
cp .env.example .env
# edit .env — at minimum set JWT_SECRET to a long random string,
# and MONGO_URI if you're not using the local default

npm install
npm run dev        # http://localhost:5000
```

**The database seeds itself automatically** the first time the server connects to an empty
database — watch for `Database is empty — running first-time seed automatically...` in the
console. No manual seed step needed on a fresh setup.

To reset and reseed manually at any time:
```bash
npm run seed:destroy   # wipes all collections
npm run seed            # repopulates them
```

### 2. Frontend

```bash
cd client
npm install
npm run dev         # http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000` — no `VITE_API_URL`
needed locally. For a split production deployment, update the proxy target in `vite.config.js`
and/or the `baseURL` in `client/src/api/axios.js`.

### 3. Production build

```bash
cd client && npm run build     # outputs to client/dist
```

### 4. Email (optional)

Both password reset and email verification fall back to **console logging** when no SMTP
credentials are set — the full link prints to the server terminal, so both flows work end-to-end
in local dev with zero mail provider setup. To send real email, set `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in `server/.env`.

---

## Environment variables

`server/.env` (see `server/.env.example` for a ready-to-copy template):

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin — used for CORS and for reset/verification-link redirects |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string — **required**, never commit a real value |
| `JWT_EXPIRE` | Token lifetime, e.g. `7d` |
| `JWT_COOKIE_EXPIRE` | httpOnly cookie lifetime, in days |
| `RESET_TOKEN_EXPIRE_MINUTES` | Password reset token validity window |
| `RATE_LIMIT_WINDOW_MINUTES` / `RATE_LIMIT_MAX` | General API rate limiting |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Optional — enables real email delivery |

`client/.env.example` documents the equivalent (optional) frontend variables for a split deployment.

**Never commit a real `.env` file.** Both `server/` and `client/` have `.gitignore` entries for it;
only `.env.example` (with placeholder values) is committed.

---

## Demo accounts

Created automatically by the seed (password for all: `Password123!`):

| Role | Email |
|---|---|
| Recruiter | `recruiter1@orbitalsystems.demo` |
| Job seeker | `amara.chen@demo.dev` |

The full list of seeded recruiters (5 companies) and job seekers (10 profiles) is printed to the
server console after seeding completes.

---

## API reference

All routes are prefixed with `/api`. Full request/response contracts are in the controllers, but
here's the map:

| Resource | Base path | Notes |
|---|---|---|
| Auth | `/auth` | register, login, logout, me, forgot/reset password, change password, verify-email, resend-verification |
| Users | `/users` | profile update, resume upload/delete, avatar upload |
| Jobs | `/jobs` | public search/filter/sort/paginate, CRUD (recruiter, ownership-checked), `/recruiter/mine`, `/recruiter/analytics` |
| Applications | `/applications` | apply, withdraw, `/mine`, `/job/:jobId`, `/recruiter/all`, status updates |
| Companies | `/companies` | public list/detail, `/me` CRUD (recruiter), logo/cover upload |
| Categories | `/categories` | list, create |
| Saved jobs | `/saved-jobs` | save / unsave / list (job seeker) |
| Notifications | `/notifications` | list, mark one/all read, delete |

Uploaded files are served statically from `/uploads/<resumes|avatars|logos>/<filename>`.

---

## Security

- Helmet for secure response headers
- CORS locked to `CLIENT_URL`
- `express-rate-limit`: a general API limiter plus a stricter one on auth routes (register/login/
  forgot-password/resend-verification)
- `express-mongo-sanitize` + `xss-clean` against injection and XSS
- Passwords hashed with bcrypt (cost factor 12)
- JWTs delivered as **both** an httpOnly cookie and a bearer token in the response body — the
  frontend stores the bearer token in `localStorage` as a CORS-friendly fallback. This is a
  deliberate tradeoff for an easy-to-run demo app; a production hardening pass would drop the
  localStorage token and rely on the httpOnly cookie exclusively.
- Uploads restricted by MIME type and size (resumes: PDF/DOC/DOCX ≤5MB; images ≤2–3MB), saved
  under server-generated random filenames — never the user's original filename — preventing path
  traversal and collisions
- Role-based guards on the API (the real boundary) and the SPA (UX only)
- Ownership checks enforced server-side on every job/application/company mutation
- Verification and reset tokens are generated with `crypto.randomBytes` and stored only as a
  SHA-256 hash, never in plaintext, with a defined expiry window

---

## Email verification

Registration generates a verification token using the same hash-and-expire pattern as password
reset, and emails a link pointing directly at the backend
(`GET /api/auth/verify-email/:token`). The backend validates the token, marks the account
verified, then redirects into the SPA at `/verify-email?status=success` or `?status=invalid`. Like
the reset-password flow, this means the link resolves correctly even if the frontend dev server
happens to be down when clicked.

Verification is informational, not a login gate — see [Key product decisions](#key-product-decisions)
for the reasoning.

---

## File uploads

Multer + local disk storage only — no Cloudinary, no S3, no external provider.

```
server/uploads/
├── resumes/   # PDF, DOC, DOCX — max 5MB
├── avatars/   # JPEG, PNG, WEBP — max 2MB
└── logos/     # JPEG, PNG, WEBP — max 3MB (company logo + cover image)
```

Every uploaded file is renamed to `<timestamp>-<random-hex><ext>` on disk — the original filename
is preserved only as metadata on the Mongo document, never used as the actual path. Replacing a
resume/avatar/logo deletes the previous file from disk.

**Known tradeoff:** files are served via `express.static`, meaning anyone with the (unpredictable,
non-enumerable) URL can fetch it without an auth check — see
[Known tradeoffs & next steps](#known-tradeoffs--next-steps).

---

## Design system

- **Type**: Sora (display/headings) + Inter (body) + JetBrains Mono (salary figures, data)
- **Palette**: indigo/violet gradient primary, amber accent reserved for high-intent CTAs
- **Signature motif**: job cards are styled as a **boarding pass** — a perforated divider between
  the company logo stub and the role details — echoed in the "your next role is boarding" copy
  used across the hero and auth screens
- Full dark/light mode via CSS custom properties + Tailwind's `class` strategy — every component
  audited for contrast in both themes
- Loading states are shimmer skeletons shaped like their final content, not generic spinners
- Confirmation dialogs (delete a job, withdraw an application) use an in-house `ConfirmDialog`
  component — no browser `confirm()`/`alert()` anywhere in the UI

---

## Troubleshooting

**Frontend shows `ECONNREFUSED` / proxy errors in the Vite terminal**
The backend isn't running (or crashed on boot). Start it first (`cd server && npm run dev`) and
confirm it logs `MongoDB connected` and `Nexus Jobs API listening on port 5000` before loading the
frontend.

**`/api/categories` (or jobs/companies) returns an empty array**
The database auto-seeds on first connection to an empty DB, so this shouldn't happen on a fresh
setup. If it does: check the console for the auto-seed log line; if absent, the server may be
pointed at a database it already considers non-empty. Force a reseed with
`npm run seed:destroy && npm run seed`, and confirm `MONGO_URI` points where you expect.

**Server won't start / `MongoDB connection error`**
`MONGO_URI` isn't reachable — install MongoDB locally, or create a free Atlas cluster and paste its
connection string into `MONGO_URI`.

---

## Known tradeoffs & next steps

Honest list of what a production hardening pass would tackle next — nothing here blocks the app
from working correctly today:

- **Resume file access isn't authenticated** (see [File uploads](#file-uploads)). Fixing this
  properly means streaming files through an authenticated Express route instead of
  `express.static`, which is a reasonable next step but was left out to avoid unnecessary
  complexity at this scope.
- **JWT in localStorage** as a CORS-friendly fallback alongside the httpOnly cookie — a stricter
  deployment would drop this and rely on the cookie alone.
- **Single JS bundle** (~450KB gzipped) — code-splitting by route (`React.lazy` + dynamic
  `import()`) would improve initial load time on the public pages.
- **No admin role** — by design, per the product decisions above; would be a deliberate scope
  addition, not a bug fix.

---

## Internship context

Built to satisfy the **Rhombix Technologies internship** Job Portal Application requirement: a
full MERN implementation covering both required user roles end-to-end — registration through job
posting through application review — with real, database-backed state throughout. No mocked
dashboard numbers, no admin-panel scope creep, no payment/subscription system bolted on for the
sake of it.
