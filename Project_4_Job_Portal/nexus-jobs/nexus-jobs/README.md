# Nexus Jobs — Premium MERN Job Portal

**Built by [Waqar Ali](https://waqar-ali-ten.vercel.app/)** — [GitHub](https://github.com/waqar-5) ·
[LinkedIn](https://www.linkedin.com/in/waqar-ali-997b962b5/) · [X](https://x.com/WaqarAli1353373)

A production-ready job board built for the **Rhombix Technologies internship**. Job seekers get
one-click apply with a resume on file; recruiters get an instant company profile, job posting,
an applicant pipeline, and analytics — no admin approval layer in between.

Built with the MERN stack (MongoDB, Express, React, Node.js), Tailwind CSS, Framer Motion, and a
custom "boarding pass" visual language for job cards.

---

## Features

**Job seekers**
- Register, log in, log out, forgot/reset password, email verification
- Editable profile: headline, bio, location, phone, skills, avatar
- Resume upload (PDF/DOC/DOCX) that powers one-click apply everywhere
- Search, filter (type/mode/experience/category), and sort job listings
- Save/unsave jobs, track every application's status through the pipeline
- In-app notifications when a recruiter updates an application

**Recruiters**
- Register, log in, instant auto-created company profile
- Full company profile editor with logo/cover upload
- Create, edit, delete, close, and reopen job postings — published instantly, no approval step
- Applicant pipeline per job or across all jobs, with status updates (Applied → In review →
  Shortlisted → Interview → Rejected/Hired)
- Dashboard analytics backed by real MongoDB aggregation (job counts, applicant counts, pipeline
  breakdown, top-performing jobs) — nothing hardcoded

---

## User roles

The app has two roles, enforced on the backend via `middleware/role.js` (frontend route guards in
`routes/guards.jsx` are UX-only, not the security boundary):

| Role | Can | Cannot |
|---|---|---|
| `jobseeker` | Apply, save jobs, manage own profile/resume | Create/edit/delete jobs, view other applicants |
| `recruiter` | Create/edit/delete/close own jobs, manage own company, review applicants | Touch another recruiter's jobs/company, access job-seeker-only endpoints |

Every mutating job/application/company endpoint checks `resource.owner === req.user._id` (or
`resource.recruiter === req.user._id`) server-side before allowing the change — see
`jobController.js`, `applicationController.js`, and `companyController.js`.

---

## Screenshots

_Add screenshots here before submitting — e.g._
- Landing page (hero + featured jobs)
- Job search with filters
- Job detail page
- Recruiter dashboard / analytics
- Job seeker application tracker
- Dark mode

---

## Key product decisions

These were resolved during scoping and are baked into the schema/UX:

1. **Company ↔ Recruiter**: each recruiter owns exactly **one** company, auto-created at
   registration. Multi-recruiter-per-company was out of scope.
2. **Job publishing**: jobs go **live instantly** on creation. There is no admin role or approval
   queue.
3. **Applying to a job**: **one-click apply** using the resume already on the job seeker's
   profile, plus an optional short cover note. Each `Application` document stores a *snapshot* of
   the resume at the time of applying, so later resume updates don't retroactively change what a
   recruiter already received.
4. **Password reset links point at the backend**, not the frontend, and redirect into the SPA only
   after validating the token. This means the link never 404s just because the Vite dev server
   happened to be down when the user clicked it.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 (Vite), React Router 6, Tailwind CSS, shadcn/ui-style primitives (Radix), Framer Motion |
| Forms | React Hook Form + Zod |
| HTTP | Axios (with interceptors for auth + error normalization) |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookie *and* bearer token support) + bcrypt |
| File uploads | Multer → local disk (`/uploads`), served via `express.static` |
| Icons | lucide-react |
| Notifications (UI) | react-hot-toast |
| Charts | Recharts (recruiter analytics) |

---

## Project structure

```
nexus-jobs/
├── server/                  # Express API
│   ├── config/db.js
│   ├── models/              # User, Company, Job, Application, SavedJob, Notification, Category
│   ├── middleware/          # auth, role, upload (multer), errorHandler, rateLimiter
│   ├── controllers/
│   ├── routes/
│   ├── utils/                # token, email, apiFeatures (search/filter/sort/paginate), notifications
│   ├── seed/seed.js
│   ├── uploads/              # resumes/ avatars/ logos/  (gitkept, content gitignored)
│   └── server.js
└── client/                  # Vite + React SPA
    └── src/
        ├── api/               # one file per resource, thin axios wrappers
        ├── components/
        │   ├── ui/            # shadcn-style primitives (button, input, dialog, select, tabs...)
        │   ├── layout/        # Navbar, Footer, PublicLayout, AuthLayout, DashboardLayout
        │   ├── jobs/          # JobCard (boarding-pass design), JobFilters, skeletons
        │   ├── dashboard/     # StatCard
        │   └── common/        # Hero, Pagination, EmptyState, PageHeader, NotificationsList
        ├── context/           # AuthContext, ThemeContext (dark/light)
        ├── pages/
        │   ├── seeker/        # Overview, Applications, SavedJobs, Profile
        │   └── recruiter/     # Overview, JobsList, JobForm, Applicants, Analytics, Company, Profile
        ├── lib/                # cn(), formatters, zod schemas
        └── routes/guards.jsx  # ProtectedRoute, RoleRoute
```

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or an Atlas connection string)

### 1. Backend

```bash
cd server
cp .env.example .env
# edit .env — at minimum set JWT_SECRET to a long random string,
# and MONGO_URI if you're not using the local default

npm install
npm run dev        # starts on http://localhost:5000
```

**The database seeds itself automatically** the first time the server connects to an empty
database — you'll see `Database is empty — running first-time seed automatically...` in the
server console. No manual seed step required for a fresh setup.

If you ever want to reset and reseed manually:
```bash
npm run seed:destroy   # wipes all collections
npm run seed            # repopulates them
```

Demo accounts created by the seed (password for all: `Password123!`):
- Recruiter: `recruiter1@orbitalsystems.demo`
- Job seeker: `amara.chen@demo.dev` (see server console for the full list after seeding)

### 2. Frontend

```bash
cd client
npm install
npm run dev         # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`, so no `VITE_API_URL`
is needed locally. For a split production deployment, update `vite.config.js`'s proxy target and/or
point `client/src/api/axios.js`'s `baseURL` at your deployed API.

### 3. Email (optional)

Password reset emails fall back to **console logging** if no SMTP credentials are set — the full
reset link is printed to the server terminal, so the flow works end-to-end in local dev without any
mail provider. To send real emails, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and
`SMTP_FROM` in `server/.env`.

---

## Environment variables (server/.env)

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `CLIENT_URL` | Frontend origin, used for CORS and reset-link redirects |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string — **required** |
| `JWT_EXPIRE` | Token lifetime, e.g. `7d` |
| `JWT_COOKIE_EXPIRE` | Cookie lifetime in days |
| `RESET_TOKEN_EXPIRE_MINUTES` | Password reset token validity window |
| `RATE_LIMIT_WINDOW_MINUTES` / `RATE_LIMIT_MAX` | General API rate limiting |
| `SMTP_*` | Optional — enables real email delivery |

---

## API overview

All routes are prefixed with `/api`.

| Resource | Base path | Notes |
|---|---|---|
| Auth | `/auth` | register, login, logout, me, forgot/reset password, change password, verify-email, resend-verification |
| Users | `/users` | profile, resume upload/delete, avatar upload |
| Jobs | `/jobs` | public search/filter/sort/paginate, CRUD (recruiter), `/recruiter/mine`, `/recruiter/analytics` |
| Applications | `/applications` | apply, withdraw, `/mine`, `/job/:jobId`, `/recruiter/all`, status updates |
| Companies | `/companies` | public list/detail, `/me` CRUD (recruiter), logo/cover upload |
| Categories | `/categories` | list, create |
| Saved jobs | `/saved-jobs` | save/unsave/list (job seeker) |
| Notifications | `/notifications` | list, mark read, mark all read, delete |

Static uploaded files are served from `/uploads/<resumes|avatars|logos>/<filename>`.

---

## Security

- `helmet` for secure headers
- `cors` locked to `CLIENT_URL`
- `express-rate-limit`: general API limiter + a stricter one on auth routes
- `express-mongo-sanitize` + `xss-clean` against injection/XSS
- Passwords hashed with `bcryptjs` (cost factor 12)
- JWTs delivered as **both** an httpOnly cookie and a bearer token in the response body — the
  frontend stores the bearer token in `localStorage` as a CORS-friendly fallback. This is a
  deliberate tradeoff for a same-origin-in-dev, easy-to-deploy demo app; a production hardening
  pass would drop the localStorage token and rely on the httpOnly cookie exclusively.
- File uploads restricted by MIME type and size (resumes: PDF/DOC/DOCX ≤5MB; images ≤2–3MB), with
  server-generated unpredictable filenames (`timestamp-randomhex.ext`) — never the user's original
  filename — to prevent path traversal and filename collisions
- Role-based route guards on both the API (`middleware/role.js`) and the SPA (`routes/guards.jsx`);
  the API is the actual security boundary, the SPA guard is UX only
- Ownership checks on every job/application/company mutation (see table above)
- Email verification: token is generated with `crypto.randomBytes`, stored only as a SHA-256 hash
  (never in plaintext), and expires after 24 hours — same pattern as the password reset flow

**Known tradeoff — resume file exposure**: uploaded resumes are served via `express.static` from
`/uploads/resumes/`, which means a resume URL is fetchable by anyone who has it, without an auth
check. Filenames are unpredictable (random hex, not the original filename or a sequential ID), so
this isn't enumerable, but it isn't authenticated either. For this project's scope (local disk
storage, no Cloudinary/S3), adding authenticated file serving would mean streaming files through an
authenticated Express route instead of `express.static`, which is a reasonable next step but was
left out here to avoid added complexity — see `middleware/upload.js` and `server.js`'s
`/uploads` static mount if you want to harden this further.

---

## Email verification

Registration generates a verification token (same hash-and-expire pattern as password reset) and
emails a link that points at the backend directly (`/api/auth/verify-email/:token`), which
validates the token, marks the account verified, then redirects into the SPA at
`/verify-email?status=success|invalid`. Like the reset-password flow, this means the link resolves
correctly even if the frontend dev server is down when clicked.

Verification is **informational, not blocking** — an unverified account can still log in and use
the app fully; a dismissible banner in the dashboard prompts verification and offers a resend
button. This was a deliberate choice so a missing/misconfigured SMTP setup in development never
locks anyone out of the app they just built.

---

## Troubleshooting

**Frontend shows `ECONNREFUSED` / proxy errors in the Vite terminal**
The backend isn't running (or crashed on boot). The client's dev server proxies `/api` to
`http://localhost:5000` — start the backend first (`cd server && npm run dev`) and confirm it logs
`MongoDB connected` and `Nexus Jobs API listening on port 5000` before loading the frontend.

**`/api/categories` (or jobs/companies) returns an empty array**
As of this version, the database auto-seeds itself the first time the server connects to an empty
database — this shouldn't happen on a fresh setup anymore. If you still see it empty:
- Check the server console for `Database is empty — running first-time seed automatically...`. If
  you don't see that line, the server may be pointed at a database it already considers non-empty
  (e.g. you seeded once, then changed `MONGO_URI` to a different database).
- Force a reseed: `npm run seed:destroy && npm run seed`.
- Confirm `MONGO_URI` in `server/.env` is the database you think it is.

**Server won't start / `MongoDB connection error`**
`MONGO_URI` isn't reachable. If you don't have MongoDB installed locally, either install MongoDB
Community Server, or create a free cluster on MongoDB Atlas and paste its connection string into
`MONGO_URI`.

---

## Design system

- **Type**: Sora (display/headings) + Inter (body) + JetBrains Mono (salary figures, data)
- **Palette**: indigo/violet gradient primary, amber accent for high-intent CTAs
- **Signature motif**: job cards are styled as a **boarding pass** — a perforated divider between
  the company logo stub and the role details — reinforcing the "your next role is boarding" theme
  used throughout copy and the auth screens
- Full dark/light mode via CSS custom properties + Tailwind's `class` strategy
- Loading states use shimmer skeletons shaped like their final content, not generic spinners

---

## Internship context

This project was built to satisfy the **Rhombix Technologies internship** Job Portal Application
requirement. It's a full MERN implementation (no boilerplate starter, no admin panel scope-creep,
no payment/subscription system) covering both required user roles end-to-end: registration through
job posting through application review, with real database-backed state throughout — no mocked or
hardcoded dashboard numbers.
