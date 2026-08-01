# About Nexus Jobs

**A premium, full-stack MERN job portal — built by [Waqar Ali](https://waqar-ali-ten.vercel.app/)
for the Rhombix Technologies internship.**

[GitHub](https://github.com/waqar-5) · [LinkedIn](https://www.linkedin.com/in/waqar-ali-997b962b5/) · [X](https://x.com/WaqarAli1353373)

---

## Table of contents

1. [What is Nexus Jobs](#1-what-is-nexus-jobs)
2. [Who it's for](#2-who-its-for)
3. [Feature overview](#3-feature-overview)
4. [Technology stack](#4-technology-stack)
5. [System architecture](#5-system-architecture)
6. [Project structure](#6-project-structure)
7. [Key product & engineering decisions](#7-key-product--engineering-decisions)
8. [Security measures](#8-security-measures)
9. [Design system](#9-design-system)
10. [Every screen in the app](#10-every-screen-in-the-app)
11. [How this was built & verified](#11-how-this-was-built--verified)
12. [Known limitations — stated honestly](#12-known-limitations--stated-honestly)
13. [Why this project was made](#13-why-this-project-was-made)
14. [The real problem this project solves](#14-the-real-problem-this-project-solves)

---

## 1. What is Nexus Jobs

Nexus Jobs is a two-sided job marketplace where **job seekers** find and apply to roles in one
click, and **recruiters** post jobs, review applicants, and move them through a real hiring
pipeline — all backed by a live MongoDB database, not mock data.

The whole point of the product, in one sentence: **remove the friction on both sides of hiring** —
seekers stop retyping the same information into every application, and recruiters stop juggling
spreadsheets to track who's in what stage.

---

## 2. Who it's for

| Persona | What they need | What Nexus Jobs gives them |
|---|---|---|
| **Job seeker** | Apply to many roles quickly, know where each application stands | One profile, one resume upload, one-click apply, a real status tracker (Applied → In Review → Shortlisted → Interview → Hired/Rejected) |
| **Recruiter / hiring team at a small-to-mid company** | Post a role and manage applicants without a heavyweight enterprise ATS | Instant company profile at signup, jobs live immediately (no approval wait), a full applicant pipeline, and real analytics dashboards |

---

## 3. Feature overview

### Job seekers can
- Register, log in, log out
- Verify their email (required before login — see decision #6 below)
- Reset a forgotten password
- Build a profile — headline, bio, location, phone, skills, avatar
- Upload a resume (PDF/DOC/DOCX) that powers one-click apply everywhere afterward
- Search jobs by keyword; filter by type, work mode, experience level, category; sort results
- Save and unsave jobs, with a dedicated saved-jobs page
- Apply to a job in one click, with an optional short cover note
- Track every application's live status
- Withdraw an application
- Receive in-app notifications when a recruiter updates their application status

### Recruiters can
- Register with an instant, auto-created company profile
- Fully edit their company — description, industry, size, founded year, website, perks, logo, cover image
- Create, edit, delete, close, and reopen job postings — live the moment they're published
- View every applicant for a specific job, or across all their jobs at once
- Move an applicant through the pipeline with one click
- View dashboard analytics: total/open/closed jobs, total applicants, pipeline breakdown by stage,
  and their top-performing jobs — all computed live from MongoDB aggregation queries

### Shared, cross-cutting features
- Full dark mode / light mode
- Fully responsive, from 320px phones to large desktop monitors
- Skeleton loading states shaped like their final content — never a blank screen while waiting
- Empty states with a clear next action on every list view (no dead ends)
- Toast feedback on every action — nothing fails or succeeds silently
- Custom confirmation dialogs for destructive actions (delete a job, withdraw an application) —
  no native browser `confirm()` popups anywhere
- Accessible: labeled icon buttons, proper ARIA attributes on interactive elements like the FAQ accordion

---

## 4. Technology stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | React 18 + Vite | Fast dev server, modern React patterns |
| Routing | React Router 6 | Standard, well-supported client-side routing |
| Styling | Tailwind CSS | Utility-first, fast to iterate, consistent design tokens |
| UI primitives | Radix UI (shadcn-style) | Accessible-by-default components (dialogs, selects, tabs) |
| Motion | Framer Motion | Purposeful entrance/hover animation, not decoration for its own sake |
| Forms | React Hook Form + Zod | Type-safe validation with minimal re-renders |
| HTTP client | Axios | Interceptors for auth headers and normalized error handling |
| Charts | Recharts | Recruiter analytics visualizations |
| Icons / toasts | lucide-react / react-hot-toast | Lightweight, consistent iconography and feedback |
| Backend runtime | Node.js + Express | Industry-standard, well-understood REST API layer |
| Database | MongoDB + Mongoose | Flexible schema for evolving job/application data, easy relational-ish references |
| Auth | JWT (httpOnly cookie + bearer token) + bcrypt | Stateless auth, defense-in-depth with both cookie and header support |
| File uploads | Multer → local disk | No third-party storage dependency, per project requirements |
| Email | Nodemailer, console-log fallback in dev | Real email in production, zero-friction local development |
| Security middleware | Helmet, CORS, express-rate-limit, express-mongo-sanitize, xss-clean | Defense against common web vulnerabilities |

---

## 5. System architecture

**Request flow:**
```
React (Vite) → Axios → Express routes → middleware (auth/role/upload) → controllers → Mongoose models → MongoDB
```

**Authentication flow:**
```
Login/Register → bcrypt hash/compare → JWT signed → httpOnly cookie + token in response body
        ↓
Every protected request → Authorization: Bearer <token> → protect middleware → req.user
        ↓
        → authorize('recruiter' | 'jobseeker') → role check
        ↓
        → controller-level ownership check on any mutation (edit/delete)
```

**Upload flow:**
```
Multer (disk storage, MIME + size validated) → randomly generated filename → /uploads/<type>/<file>
        ↓
File path saved on the relevant Mongo document
        ↓
Served back to the client through express.static (or getFileUrl() resolves it for split deployments)
```

**Email verification / password reset flow (same pattern, deliberately):**
```
Action requested → token generated (crypto.randomBytes, stored as SHA-256 hash, expires) → email sent
        ↓
Link points at the BACKEND directly, not the frontend
        ↓
Backend validates token → performs the action → redirects into the SPA with a status flag
        ↓
SPA always lands on the login page afterward — never auto-authenticates the user
```

---

## 6. Project structure

```
nexus-jobs/
├── server/                        Express API
│   ├── config/db.js                  MongoDB connection
│   ├── models/                       User, Company, Job, Application, SavedJob, Notification, Category
│   ├── middleware/                   auth (JWT), role (RBAC), upload (Multer), errorHandler, rateLimiter
│   ├── controllers/                  business logic, one file per resource
│   ├── routes/                       route definitions, one file per resource
│   ├── utils/                        token helpers, email, search/filter/sort/paginate helper, notification creator
│   ├── seed/seed.js                  realistic demo data — also runs automatically on first boot
│   └── server.js                     app entrypoint
└── client/                        Vite + React SPA
    └── src/
        ├── api/                       thin axios wrappers, one file per resource
        ├── components/
        │   ├── ui/                    accessible primitives — button, input, dialog, select, tabs...
        │   ├── layout/                 Navbar, Footer, PublicLayout, AuthLayout, DashboardLayout
        │   ├── jobs/                  JobCard ("boarding pass" design), JobFilters, skeletons
        │   ├── dashboard/              StatCard
        │   └── common/                 Hero, Pagination, EmptyState, ConfirmDialog, NotificationsList
        ├── context/                    AuthContext, ThemeContext
        ├── pages/
        │   ├── seeker/                 Overview, Applications, SavedJobs, Profile
        │   └── recruiter/              Overview, JobsList, JobForm, Applicants, Analytics, Company, Profile
        ├── lib/                        cn(), formatters, zod schemas, getFileUrl()
        └── routes/guards.jsx           ProtectedRoute, RoleRoute
```

---

## 7. Key product & engineering decisions

These were deliberate calls made and refined throughout development — not default behavior left
unexamined:

1. **One company per recruiter, auto-created at registration.** Multi-recruiter-per-company was
   out of scope; this keeps ownership simple and lets a recruiter post a job within seconds of
   signing up.
2. **Jobs publish instantly — no admin approval queue.** There's no admin role in this app by
   design; recruiters are trusted to manage their own postings.
3. **One-click apply, with a resume snapshot.** Applying uses the resume already on the seeker's
   profile plus an optional note. Each application stores a *snapshot* of the resume at the moment
   of applying, so a later resume update never silently rewrites what a recruiter already received.
4. **Password reset and email verification links point at the backend, not the frontend.** The
   backend validates the token first, then redirects into the SPA — so the link resolves correctly
   even if the frontend dev server happens to be down when clicked.
5. **Registration and password reset never auto-log the user in.** Both redirect to `/login`
   instead of straight into the dashboard. Account creation, password changes, and starting a
   session are treated as distinct, deliberate steps.
6. **Email verification is required before login**, not just a dashboard nudge. `POST /api/auth/login`
   rejects an unverified account with a structured `403 EMAIL_NOT_VERIFIED` error, and the login
   page detects that specific error to offer an inline resend option — through a public endpoint
   that doesn't require being logged in, since a blocked user can't reach an authenticated resend
   button.
7. **Local disk storage via Multer — no Cloudinary, no S3.** A deliberate architectural constraint
   from the original brief, with the tradeoffs (ephemeral storage on some hosts, unauthenticated
   file serving) documented honestly rather than hidden.

---

## 8. Security measures

- Helmet for secure response headers
- CORS locked to the configured client origin
- Rate limiting: a general API limiter plus a stricter one on auth routes
- `express-mongo-sanitize` and `xss-clean` against injection and XSS
- Passwords hashed with bcrypt (cost factor 12)
- JWTs delivered as both an httpOnly cookie and a bearer token, with the cookie's `sameSite`
  attribute automatically switching between `lax` (local dev) and `none` (production, required for
  cross-domain deployments) based on `NODE_ENV`
- Uploads restricted by MIME type and size, saved under server-generated random filenames — never
  the user's original filename — preventing path traversal and collisions
- Role-based access enforced **server-side** on every protected route; frontend route guards exist
  only for UX, never as the actual security boundary
- Ownership checks on every job/application/company mutation — a recruiter can never touch another
  recruiter's data, verified directly via ownership grep, not just assumed
- Verification and reset tokens generated with `crypto.randomBytes`, stored only as a SHA-256 hash,
  never in plaintext, with a defined expiry window

---

## 9. Design system

- **Typography**: Sora for display/headings, Inter for body text, JetBrains Mono for data (salary
  figures, stats) — a deliberate three-font system, not a single generic sans-serif
- **Palette**: an indigo/violet gradient as the primary color, with an amber accent reserved
  specifically for high-intent calls to action
- **Signature motif — the "boarding pass" job card**: a perforated divider between the company logo
  stub and the role details, echoing the "your next role is boarding" language used across the
  hero section and auth screens. This was a deliberate choice to avoid the generic, interchangeable
  card design most job boards default to
- **Full dark/light mode**, implemented via CSS custom properties and Tailwind's class strategy,
  with every component checked for contrast in both themes
- **Loading states** are shimmer skeletons shaped like their final content — never a generic
  spinner or blank screen
- **Company profile pages** use a centered, stacked profile-header layout: a gradient-ring logo
  frame straddling the cover banner, with name and details centered below it

---

## 10. Every screen in the app

**Public:** Landing page (hero, categories, featured jobs, companies, testimonials, "how it
works," FAQ, contact) · Job search & filters · Job detail · Company directory · Company profile

**Auth:** Register (role toggle) · Login (with inline unverified-email resend) · Forgot password ·
Reset password · Email verification result

**Job seeker dashboard:** Overview (real stats, profile-completion nudge, recent applications) ·
Applications (status tracker, withdraw with confirmation) · Saved jobs · Notifications · Profile
(avatar, resume, skills, bio)

**Recruiter dashboard:** Overview (real stats, top-performing jobs) · Jobs list (status tabs,
edit/delete with confirmation) · Job form (create/edit, full field set including benefits) ·
Applicants (per-job or all-jobs, one-click status updates, resume access) · Analytics (charts,
pipeline breakdown) · Company profile editor · Notifications · Profile

---

## 11. How this was built & verified

This wasn't built once and declared finished — it went through multiple real audit and fix passes:

- Every backend file syntax-checked and the full module graph load-tested
- The frontend built with `npm run build` and re-verified after **every single change**, not just
  at the end — dozens of clean production builds across the whole development process
- Ownership and role-authorization logic confirmed by direct code inspection (grep for the actual
  checks), not just asserted from memory
- A full grep pass for leftover `TODO`/`FIXME`/dummy content/placeholder text — zero hits
- Real UI bugs (layout overlaps, alignment issues, an over-corrected CSS margin) were caught
  through actual live screenshots and fixed with the underlying math worked through explicitly,
  not guessed at repeatedly
- The registration → email verification → login flow, and the forgot-password → reset → login
  flow, were both deliberately redesigned mid-project based on real testing feedback to require
  explicit login rather than auto-authenticating the user

---

## 12. Known limitations — stated honestly

Nothing here blocks the app from working correctly today; this is what a production hardening pass
would tackle next:

- **Resume file access isn't authenticated.** Files are served via `express.static`, so anyone
  with the (unpredictable, non-enumerable) URL can fetch it without a login check. Fixing this
  properly means streaming files through an authenticated route instead.
- **Local disk storage doesn't survive a redeploy** on most free hosting tiers (Render, etc. use an
  ephemeral filesystem). A direct consequence of the "no Cloudinary" requirement — the fix is a
  persistent disk or a move to object storage, a deliberate infrastructure decision, not a bug.
- **JWT also lives in localStorage** as a CORS-friendly fallback alongside the httpOnly cookie. A
  stricter deployment would drop this and rely on the cookie alone.
- **Single JS bundle** (~450KB gzipped) — route-based code-splitting would improve initial load on
  the public pages.
- **No admin role**, by design — a deliberate scope boundary, not an oversight.
- **Correct SMTP configuration is now load-bearing.** Since email verification blocks login with no
  bypass, a broken mail setup means a newly registered person can never get in. This tradeoff was
  chosen deliberately over the alternative (verification that doesn't actually gate anything).

---

## 13. Why this project was made

Nexus Jobs was built to satisfy the **Rhombix Technologies internship** requirement for a
full-stack Job Portal Application — but it was treated as more than a checkbox exercise. The goal
throughout was to build something that could stand on its own as a portfolio piece: real
authorization enforced on the backend (not hidden in the frontend), real database-backed analytics
(not hardcoded dashboard numbers), and a genuinely considered design system instead of a default
component-library look.

Beyond the internship requirement, it doubles as a demonstration of full-stack engineering
judgment: knowing *why* a JWT cookie needs `sameSite: none` in a cross-domain production
deployment, *why* uploaded files won't survive a redeploy on most free hosts, and *why* requiring
email verification before login is a real tradeoff (it makes SMTP configuration load-bearing) worth
making deliberately rather than defaulting into.

---

## 14. The real problem this project solves

Every job board — LinkedIn Jobs, Wellfound, Indeed, an internal company careers page — exists to
solve the same two-sided coordination problem, and Nexus Jobs targets the two specific pain points
inside it that are most commonly done badly:

**1. Application friction, for job seekers.**
Most job sites make a candidate re-upload their resume and retype the same information on every
single application. That friction is the single biggest reason qualified candidates give up
partway through applying. Nexus Jobs solves this directly: upload a resume once, and every
subsequent application is one click plus an optional note. The resume snapshot mechanism means this
speed doesn't come at the cost of data integrity — recruiters always see exactly what was
submitted at application time, unaffected by later profile edits.

**2. Opaque hiring status, for job seekers — and disorganized pipelines, for recruiters.**
Applicants usually apply into a black hole and never learn whether they're being considered.
Recruiters, meanwhile, often track candidates in spreadsheets or scattered email threads with no
single source of truth. Nexus Jobs solves both sides of this at once with a shared, visible
pipeline: a status change by the recruiter is instantly reflected as a real database update, is
visible to the job seeker immediately, and triggers a notification — replacing silence with a
system both sides can actually see and trust.

**Is this a "real," solved problem, or an invented one?** It's real, and the solution pattern is
proven — this is functionally how LinkedIn Jobs, Wellfound, and every modern Applicant Tracking
System already operate. What Nexus Jobs demonstrates isn't a novel idea; it's a genuine, working,
end-to-end implementation of a well-established pattern — every action (apply, save, post a job,
change a status) persists to a real database and reflects real state, not a mockup or a
hardcoded demo. That is precisely what an internship submission — and a portfolio piece — is meant
to prove: not that the idea is original, but that the person who built it can take a real,
recognized problem and build the entire, correct, secure, production-considered solution to it,
end to end.