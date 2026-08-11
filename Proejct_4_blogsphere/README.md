# BlogSphere

**Write. Share. Inspire.**

A full-stack, production-ready MERN blogging platform with a complete admin panel — built with React, Node.js, Express, and MongoDB.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Design System](#design-system)
- [Security](#security)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Known Simplifications](#known-simplifications)
- [Future Improvements](#future-improvements)

## Overview

BlogSphere is a Medium/Dev.to-style publishing platform: writers get a
clean rich-text editor and a real audience; readers get a distraction-free
reading experience with meaningful discovery (categories, tags, search,
trending); admins get full moderation and analytics tooling.

## Features

**Guests** — browse, search, and filter published blogs; read author profiles; view categories and tags.

**Registered users** — everything above, plus: email verification, forgot/reset password, comment and reply on posts, like and bookmark blogs, like comments, report inappropriate comments, edit profile (bio, socials, skills, avatar), manage their own blog drafts/published posts.

**Admins** — everything above, plus: dashboard analytics (users, blogs, comments, views, likes), user management (role changes, block/unblock, cascading delete), blog moderation (approve/reject pending posts, feature/unfeature, delete any post), comment moderation (hide/unhide, delete), category and tag CRUD.

**Content system** — auto-generated SEO-friendly slugs, estimated reading time, draft/pending/published/rejected workflow, cover image + gallery images via Cloudinary, allowlist-sanitized rich text (React Quill), related posts, trending/latest/most-viewed/most-liked sorting, nested comment threads.

## Tech Stack

**Frontend:** React 18, React Router v6, Tailwind CSS, Axios, React Hook Form, React Quill, React Hot Toast, Framer Motion, React Icons, date-fns

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT (access + rotating refresh tokens), Cloudinary, Nodemailer, express-validator, Helmet, express-rate-limit, express-mongo-sanitize, hpp

## Project Structure

```
blogsphere/
├── backend/
│   ├── config/        env, db, cloudinary, mailer
│   ├── api/           Vercel serverless entry point (api/index.js)
│   ├── controllers/   route handlers (auth, blog, comment, admin, ...)
│   ├── middleware/    auth, security, validation, upload, error handling
│   ├── models/        User, Blog, Comment, Category, Tag, Like, Bookmark, Notification
│   ├── routes/        express routers, one per resource
│   ├── services/      email + notification services
│   ├── utils/         ApiError, ApiFeatures, tokenUtils, sanitizeHtml, seed.js
│   ├── validators/    express-validator rule sets
│   ├── app.js          express app + middleware wiring
│   └── server.js       entry point
└── frontend/
    └── src/
        ├── components/  layout, blog, comment, ui, admin
        ├── pages/       public, user (dashboard), admin
        ├── layouts/     MainLayout, AuthLayout, DashboardLayout, AdminLayout
        ├── context/     AuthContext
        ├── services/    axios instance + per-resource API modules
        └── utils/       formatters
```

## Installation

### 1. Backend

```bash
cd backend
cp .env.example .env   # fill in MongoDB URI, JWT secrets, Cloudinary, SMTP
npm install
npm run seed             # optional: creates sample categories/tags + an admin account
npm run dev               # http://localhost:5000
```

Required accounts (all have free tiers): **MongoDB Atlas**, **Cloudinary**, and an SMTP provider (Gmail App Password works fine for dev).

### 2. Frontend

```bash
cd frontend
cp .env.example .env    # set VITE_API_URL to your backend URL
npm install
npm run dev               # http://localhost:5173
```

### 3. Admin access

Run `npm run seed` in the backend (creates an admin using `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` from your `.env`, defaulting to
`admin@blogsphere.com` / `ChangeMe123!` if unset — **change this password
immediately** if you run it anywhere but a local database). Alternatively,
register a normal account and promote it manually:

```js
// mongosh or MongoDB Compass:
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the full list
with inline comments. Summary:

| Backend | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets |
| `CLOUDINARY_*` | Image upload/hosting |
| `SMTP_*` | Transactional email |
| `CLIENT_URL` | Frontend origin, used for CORS + email links |
| `RATE_LIMIT_*` | API rate limiting thresholds |

| Frontend | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL |

## API Endpoints

All routes are prefixed with `/api`. Protected routes require a valid
access token (Bearer header or httpOnly cookie); admin routes additionally
require `role: admin`.

**Auth** — `/auth`
`POST /register` · `POST /login` · `POST /logout` · `POST /refresh` ·
`GET /verify-email/:token` · `POST /resend-verification` ·
`POST /forgot-password` · `POST /reset-password/:token` ·
`PATCH /change-password` · `GET /me`

**Blogs** — `/blogs`
`GET /` · `GET /my-blogs` · `GET /id/:id` · `GET /:slug` ·
`GET /:slug/related` · `POST /` · `PUT /:id` · `DELETE /:id` ·
`GET /:blogId/comments` · `POST /:blogId/comments` ·
`POST /:blogId/like` · `GET /:blogId/likes` · `POST /:blogId/bookmark`

**Comments** — `/comments`
`GET /:commentId/replies` · `POST /:id/like` · `PUT /:id` ·
`DELETE /:id` · `POST /:id/report`

**Categories** — `/categories`
`GET /` · `GET /:slug` · `POST /` (admin) · `PUT /:id` (admin) ·
`DELETE /:id` (admin)

**Tags** — `/tags`
`GET /` · `GET /:slug` · `POST /` (admin) · `PUT /:id` (admin) ·
`DELETE /:id` (admin)

**Bookmarks** — `/bookmarks`
`GET /`

**Notifications** — `/notifications`
`GET /` · `PATCH /read-all` · `PATCH /:id/read` · `DELETE /:id`

**Users** — `/users`
`PUT /profile` · `PUT /avatar` · `DELETE /me` · `GET /:id`

**Admin** — `/admin` (all admin-only)
`GET /dashboard` ·
`GET /users` · `PATCH /users/:id` · `PATCH /users/:id/block` ·
`PATCH /users/:id/unblock` · `DELETE /users/:id` ·
`GET /blogs` · `PATCH /blogs/:id/feature` · `PATCH /blogs/:id/approve` ·
`PATCH /blogs/:id/reject` · `DELETE /blogs/:id` ·
`GET /comments` · `PATCH /comments/:id/status` · `DELETE /comments/:id`

## Design System

BlogSphere uses an "Ink & Paper" editorial visual identity — see
`frontend/tailwind.config.js` for the full token set (colors, fonts,
shadows). Signature typefaces: Fraunces (display), Source Serif 4 (article
body), IBM Plex Mono (metadata/bylines). Featured posts carry a wax-seal
"stamp" badge as the app's signature visual element.

## Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT access tokens (15 min) + rotating refresh tokens (30 days), both
  httpOnly cookies; refresh tokens are hashed before storage so a database
  leak alone can't be used to forge sessions
- Rich-text blog content is sanitized with an HTML allowlist (safe
  formatting tags only — no scripts, event handlers, or `javascript:`
  URIs); all other user input is stripped of HTML entirely via a custom
  sanitizer
- Helmet, CORS (credentialed, origin-locked), express-mongo-sanitize, hpp
- Rate limiting is stricter on auth endpoints (login/register/password
  reset) than general API traffic
- `xss-clean` and `multer@1.x` were deliberately avoided/replaced during
  development — the former is unmaintained, the latter has known CVEs in
  the 1.x line

## Screenshots

_Add screenshots here once you have a running instance — e.g._

```
![Landing page](./docs/screenshots/landing.png)
![Blog editor](./docs/screenshots/editor.png)
![Admin dashboard](./docs/screenshots/admin.png)
```

## Deployment

- **Frontend** → Vercel or Netlify. Set `VITE_API_URL` to your deployed backend URL (include the `/api` suffix). `frontend/vercel.json` includes a catch-all rewrite to `index.html` — this is required for a React Router SPA on Vercel, otherwise direct navigation to any client-side route (e.g. a password-reset link from an email, or refreshing on `/blogs/some-slug`) 404s, since Vercel looks for an actual file at that path by default.
- **Database** → MongoDB Atlas.
- **Images** → Cloudinary.

### Deploying the backend to Vercel

The backend includes a `vercel.json` and `api/index.js` specifically for
this — Vercel runs Node apps as serverless functions rather than a
traditional always-on server, so there's a dedicated entry point
(`api/index.js`) that wraps the Express app with a MongoDB connection
that's cached across warm invocations instead of reconnecting on every
request. This is separate from `server.js` (still used for local dev,
Render, Railway, or any traditional host) — nothing about your existing
local setup changes.

1. Push the `backend/` folder to a Git repo (or deploy that folder directly via the Vercel CLI: `vercel --cwd backend`)
2. In the Vercel dashboard, import the project, and set the **root directory** to `backend`
3. Add every variable from `backend/.env.example` under Project Settings → Environment Variables, with two important production-specific values:
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend.vercel.app` (your actual deployed frontend URL — required for CORS and for links in emails to resolve correctly)
4. Deploy. Vercel will build `api/index.js` as the serverless function handling every route.
5. Once deployed, point your frontend's `VITE_API_URL` at `https://your-backend.vercel.app/api` and redeploy the frontend.

**Known limitations of the serverless deployment**, worth knowing before you rely on it in production:
- **Cold starts**: the first request after a period of inactivity will be slower (fresh MongoDB connection). Subsequent requests reuse the cached connection and are fast.
- **Execution time limits**: Vercel's Hobby plan caps function execution at 10 seconds — usually fine, but a slow Cloudinary upload combined with a cold start could occasionally brush against that. The Pro plan raises this to 60s.
- Nodemailer/SMTP and Cloudinary both work fine in this environment since neither depends on the local filesystem.

## Known Simplifications

- The contact page form is UI-only (no backend endpoint was in scope) —
  wire it to a real endpoint or a service like Formspree before relying on it.
- No image cropping/editing UI before upload; Cloudinary applies a
  face-aware crop transform server-side for avatars only. Cover/gallery
  images upload as-is.
- The seed script creates sample categories/tags and one admin account;
  it does not generate sample blog posts.
- If your database has any images from a previous local-storage setup
  (URLs pointing at `/uploads/...` instead of Cloudinary), run
  `npm run cleanup:uploads` once — it clears just those stale references
  so the frontend's fallback placeholder shows instead of a broken image.
  Safe to run any time; it's a no-op if there's nothing stale.

## Future Improvements

- Full-text search ranking (current search uses regex/text-index
  matching, not relevance scoring)
- Image cropping UI in the editor before upload
- Two-factor authentication for admin accounts
- Scheduled/timed publishing for drafts
- Webhooks or an activity feed for admin moderation events
- Automated test suite (unit + integration) — not included in this build
