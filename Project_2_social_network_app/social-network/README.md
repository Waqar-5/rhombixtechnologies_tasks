# Pulse — Real-Time Social Networking Platform

A full-fledged social networking platform built with the **MERN stack** (MongoDB, Express, React, Node.js) and **Socket.IO** for real-time updates.

> Built as **Task 2** for the Rhombix Technologies internship program.

---

## Features

### Core social features
- **User profiles** — avatar, cover photo, bio, location, website, friends list
- **Posts** — text + multi-image/video uploads, "feeling" tags, edit, delete
- **Comments** — threaded replies, likes on comments, live typing indicator
- **Likes** — on posts and comments, with live count updates across all connected clients
- **Friend requests** — send, accept, decline, cancel, unfriend — fully real-time
- **Save/bookmark posts** — personal saved-posts collection
- **Share** — share count tracking

### Real-time (Socket.IO)
- Live notifications (friend requests, accepts, likes, comments, replies)
- Live online/offline presence indicators
- Live post feed — new posts, edits, and deletes broadcast instantly
- Live comment threads — new comments/replies/likes appear without refreshing
- Live "user is typing…" indicator while commenting

### Privacy & settings
- Profile visibility: public / friends-only / private
- Friends-list visibility: public / friends-only / private
- Who can message you: everyone / friends / nobody
- Who can post on your timeline: everyone / friends / nobody
- Toggle online-status visibility
- Per-post visibility (public / friends / only me)

### Multimedia
- Upload multiple images/videos per post (up to 6 files, 5MB each)
- Profile picture and cover photo uploads
- Served from local disk storage — no third-party API keys required

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7 |
| Real-time client | Socket.IO Client |
| State/Context | React Context API (Auth + Socket) |
| Backend | Node.js, Express |
| Real-time server | Socket.IO |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly cookies) + bcrypt |
| File uploads | Multer (local disk storage) |
| Notifications | react-hot-toast |
| Icons | lucide-react |

Everything used is free and open-source — no paid APIs, no API keys required to run the project.

---

## Project Structure

```
social-network/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/      # Route logic (auth, users, posts, comments, friends, notifications)
│   ├── middleware/       # JWT auth, file upload, error handling
│   ├── models/           # Mongoose schemas (User, Post, Comment, FriendRequest, Notification)
│   ├── routes/           # Express route definitions
│   ├── sockets/          # Socket.IO connection + presence handler
│   ├── utils/            # Token helper, notification helper, DB seed script
│   ├── uploads/           # Uploaded media (avatars, covers, posts)
│   ├── server.js          # App entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI (Sidebar, PostCard, CommentSection, etc.)
    │   ├── context/       # AuthContext, SocketContext
    │   ├── pages/         # Route-level pages
    │   ├── services/      # Axios API layer + Socket.IO client
    │   └── utils/         # Helper functions
    ├── index.html
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (mongodb://127.0.0.1:27017) or a free MongoDB Atlas cluster

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env if needed (MONGO_URI, JWT_SECRET, etc.)
npm run seed     # optional: populates demo users + posts
npm run dev      # starts on http://localhost:5000
```

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev      # starts on http://localhost:5173
```

The frontend dev server proxies `/api` and `/socket.io` requests to `http://localhost:5000` automatically (see `vite.config.js`) — no extra configuration needed.

### 3. Open the app

Visit http://localhost:5173 in your browser.

If you ran `npm run seed`, you can log in with any of these demo accounts (all share the password `password123`):

| Username | Email |
|---|---|
| waqar | waqar@example.com |
| ayesha | ayesha@example.com |
| bilal | bilal@example.com |
| sara | sara@example.com |
| hamza | hamza@example.com |
| zainab | zainab@example.com |

Or just register a new account from the sign-up page.

---

## Trying the Real-Time Features

To see the WebSocket features in action, open the app in two different browsers (or one normal + one incognito window) and log in as two different users:

1. **Live notifications** — Like/comment on the other user's post and watch the notification bell update instantly without a refresh.
2. **Live presence** — Watch the green online dot appear/disappear on the other user's avatar as they log in/out.
3. **Live comments** — Open the same post in both windows and post a comment — it appears in both instantly.
4. **Live typing indicator** — Start typing a comment in one window and watch "is typing…" appear in the other.
5. **Live friend requests** — Send a friend request and watch it land in the recipient's notification feed in real time.

---

## Security Notes

- Passwords are hashed with bcrypt (never stored in plaintext)
- Auth uses httpOnly JWT cookies (not readable by client-side JS, mitigating XSS token theft)
- File uploads are restricted by type (images/videos only) and size (5MB max)
- All write routes are protected by JWT-verifying middleware
- Privacy settings are enforced server-side on every profile/post read, not just hidden in the UI

---

## Notes for Reviewers

- This is a from-scratch build — no boilerplate social-network templates were used.
- Design system: a custom dark UI ("Pulse") with a coral/sage dual-accent palette and Space Grotesk + Inter typography, chosen deliberately to avoid generic dashboard/template aesthetics.
- All real-time behavior is implemented with native Socket.IO rooms (`user:<id>` for direct notifications, `post:<id>` for per-post live updates) rather than a single global broadcast channel, which keeps the design closer to how a production app would scale.
