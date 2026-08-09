# BlogSphere — Project Overview

**A production-grade MERN blogging platform with a full admin panel.**
Built by **Waqar Ali** — [Portfolio](https://waqar-ali-ten.vercel.app/) · [GitHub](https://github.com/Waqar-5) · [LinkedIn](https://www.linkedin.com/in/waqar-ali-997b962b5/)

---

## What This Project Is

BlogSphere is a full-stack publishing platform in the spirit of Medium or Dev.to — a place where writers get a clean, distraction-free editor and a real audience, and readers get a fast, ad-free reading experience with genuine discovery tools (categories, tags, search, trending). It's not a CRUD demo: it implements the complete lifecycle a real blogging product needs — authentication with email verification, a full editorial workflow (draft → pending → published/rejected), nested comment threads, likes and bookmarks, real-time-feeling notifications, and a full admin back office for moderating content and users.

Every layer was built from scratch: the database schema design, the REST API, the authentication and session-security model, the React frontend, and the visual design system. Nothing here is a boilerplate/starter-kit fork.

## Why I Built It This Way

Most tutorial blog apps stop at "create, read, update, delete a post." I wanted this one to reflect what a real product actually needs to ship:

- **A believable content lifecycle.** Drafts shouldn't demand a finished title and a full-length body — but published posts should. That distinction is enforced at three separate layers (client-side validation, API-level validation, and the database schema itself) so it can never be bypassed by going around the UI.
- **Security that isn't an afterthought.** Passwords are hashed, refresh tokens are hashed *again* before they ever touch the database (so a DB leak alone can't forge a session), rich-text content is sanitized with an allowlist rather than blindly trusted, and every admin action is gated by role middleware — not just hidden UI.
- **Graceful degradation, not happy-path-only code.** A user can delete their own account without orphaning the posts they wrote for other readers — and the app doesn't crash when it encounters that orphaned state; it shows "Deleted user" and moves on. A broken image URL shows a clean placeholder instead of a broken-image icon. These aren't edge cases I ignored — they're specifically handled.
- **A visual identity, not a template.** The UI follows a deliberate "Ink & Paper" editorial design language — not the generic AI-default palette, not a copy of an existing product's look.

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router v7
- Tailwind CSS (fully custom design tokens — no default theme)
- React Hook Form (validation)
- React Quill (rich-text editor)
- React Hot Toast (custom-branded toast/confirm system)
- React Icons
- Axios (with automatic access-token refresh on 401)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT — short-lived access tokens (15 min) + rotating refresh tokens (30 days), both httpOnly cookies
- Cloudinary (image hosting — chosen specifically for serverless compatibility, see *Deployment* below)
- Nodemailer (transactional email: verification, password reset, comment/reply notifications)
- express-validator, Helmet, express-rate-limit, express-mongo-sanitize, hpp

## Architecture

```
blogsphere/
├── backend/
│   ├── config/        env validation, DB connection, Cloudinary, mailer
│   ├── controllers/    business logic — one file per resource
│   ├── middleware/     auth, security headers, validation, file upload, error handling
│   ├── models/         8 Mongoose schemas (see below)
│   ├── routes/         REST endpoints, one router per resource
│   ├── services/       email + notification side-effects, decoupled from controllers
│   ├── utils/           shared helpers: ApiError, ApiFeatures (pagination/filter/sort), token utils, HTML sanitizer
│   ├── validators/     express-validator rule sets, one per resource
│   ├── api/             Vercel serverless entry point (separate from the traditional server)
│   └── server.js         traditional always-on entry point (local dev / Render / Railway)
└── frontend/
    └── src/
        ├── components/  layout, blog, comment, admin, and shared UI primitives
        ├── pages/        public pages, the user dashboard, and the admin panel
        ├── layouts/      route-level layout shells (main site, auth, dashboard, admin)
        ├── context/      global auth state
        ├── services/     one Axios-based module per API resource
        ├── hooks/        reusable behavior (e.g. the 3D tilt interaction)
        └── utils/        formatting helpers, toast helpers
```

### Data Model

Eight collections, each earning its place rather than being bolted on:

| Model | Purpose |
|---|---|
| **User** | Auth, profile, role (`user`/`admin`), refresh-token hash for revocable sessions |
| **Blog** | Title, sanitized rich-text content, slug, status workflow, SEO fields, denormalized counters (views/likes/comments) for fast list queries |
| **Comment** | Self-referencing for one level of nested replies, moderation status, report tracking |
| **Category** | One per blog, with a live post count |
| **Tag** | Many-to-many with blogs, auto-created from free-text input in the editor |
| **Like** | Separate collection (not an array on Blog) with a compound unique index — scales independently and gives O(1) "did this user like this post" checks |
| **Bookmark** | Same reasoning as Like — single source of truth, not duplicated onto the User document |
| **Notification** | 10 distinct types, tied into nearly every meaningful user action across the app |

### Notable Engineering Decisions

- **Refresh-token rotation with server-side revocation.** Most tutorials store JWTs and call it done. Here, the refresh token is hashed (SHA-256) before storage, so a database compromise alone can't be used to mint valid sessions. Logging out, changing your password, or an admin blocking your account all invalidate the stored hash immediately.
- **Draft-vs-publish validation split.** Implemented as a single `isPublishing()` check reused across every validator, rather than duplicating "is this a draft" logic in five different places.
- **A dedicated Vercel serverless entry point** (`backend/api/index.js`), separate from the traditional server. Serverless functions are stateless — connecting to MongoDB fresh on every invocation would be slow and would exhaust connections fast, so this entry point caches the connection across warm invocations and never crashes the process on a connection failure (the traditional server *does* crash on that, correctly, since there's no point running without a database — but that's the wrong behavior for a single serverless invocation).
- **Cloudinary over local disk storage for images** — this was a deliberate architecture decision, not a default. I actually built and fully tested a local-disk-storage version first, then reverted it specifically because the deployment target (Vercel) uses an ephemeral, read-only filesystem that would silently lose every uploaded image.
- **A custom XSS sanitizer for rich-text content**, because the standard `xss-clean` package is unmaintained. It uses an HTML allowlist — safe formatting tags only, no scripts, no event handlers, no `javascript:` URIs — verified against real payloads (script injection, `onerror` handlers, malicious `href`s) before shipping.

## Feature List

**Guests** can browse, search, and filter published posts, read author profiles, and explore categories/tags.

**Registered users** get everything above, plus: email verification, forgot/reset password, nested commenting with replies, liking posts and comments, bookmarking, reporting inappropriate comments, and a full personal dashboard — writing/editing posts with a rich-text editor, managing drafts, viewing bookmarks, editing their profile (bio, social links, skills, avatar), and account settings including self-service deletion.

**Admins** get a full back office: a dashboard with live platform analytics (users, posts, comments, views, likes), user management (role changes, block/unblock, cascading account deletion), blog moderation (approve/reject pending submissions, feature/unfeature, delete), comment moderation (hide/unhide, delete, view reported comments), and category/tag CRUD.

## Design System

BlogSphere uses a custom "Ink & Paper" editorial visual identity, built to feel like a literary publication rather than a generic SaaS dashboard:

- **Palette:** deep ink-blue text (`#14171F`), a cool warm-white paper background (`#F3F2ED`) — deliberately not the cliché cream/terracotta combination — a fountain-pen "Signal Blue" primary accent, and a "Stamp Gold" accent used sparingly for featured content
- **Typography:** Fraunces (display serif, for headlines), Source Serif 4 (long-form article body — chosen specifically for reading comfort), and IBM Plex Mono (bylines, timestamps, tags — a typewriter-report feel for metadata)
- **Signature element:** a circular wax-seal "stamp" badge marking featured posts, tying the visual language back to the "Write. Share. Inspire." tagline
- **Motion:** a custom mouse-tracked 3D tilt interaction (perspective/rotateX/rotateY driven by cursor position, with a glare highlight that follows the pointer) applied to blog cards and cover images — built as a reusable hook rather than a one-off effect, and deliberately implemented in plain CSS transforms rather than a heavier animation library, to keep the bundle lean

## Security Notes

- bcrypt password hashing (cost factor 12)
- httpOnly, sameSite-appropriate cookies for both access and refresh tokens
- Rate limiting, stricter on auth endpoints than general API traffic
- Helmet security headers, MongoDB operator-injection sanitization, HTTP parameter pollution protection
- Path-traversal-safe file handling
- Every admin route double-gated: authentication middleware, then role middleware

## What I'd Build Next

- Full-text search ranking (currently regex/text-index based, not relevance-scored)
- Two-factor authentication for admin accounts
- Scheduled/timed publishing for drafts
- An automated test suite (this build prioritized manual, iterative verification — including live-testing every fix against realistic payloads during development — over a formal test harness)

## Deployment

- **Frontend:** Vercel
- **Backend:** Vercel (serverless), via a dedicated entry point built specifically for that environment — see *Architecture* above
- **Database:** MongoDB Atlas
- **Images:** Cloudinary

---

*This document describes the project as of the version you downloaded. For setup instructions, environment variables, and the full API reference, see `README.md` in the project root.*
