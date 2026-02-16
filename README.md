# Live Polls Now

A real-time polling application built with React and Express.

## Project Structure

```
live-polls-now-main/
├── frontend/          # React + Vite frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
└── backend/           # Express + MongoDB backend API
    ├── models/        # Mongoose schemas
    ├── routes/        # API routes
    ├── server.js
    ├── package.json
    └── .env
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# ADMIN_KEY=optional_admin_key
# PORT=5000
# CLIENT_URL=http://localhost:8080

node server.js
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:8080`

## Features

- Create polls with multiple options
- Real-time vote counting
- Fingerprint-based voter tracking (prevents double voting)
- Creator-only poll deletion
- Admin deletion with secret key
- Beautiful, responsive UI

## Tech Stack

**Frontend:**
- React 18
- Vite
- React Router
- Tailwind CSS

**Backend:**
- Node.js
- Express
- MongoDB with Mongoose
- Fingerprinting library

## API Endpoints

- `GET /api/polls` - List all polls
- `POST /api/polls` - Create new poll
- `GET /api/polls/:id` - Get poll details
- `POST /api/votes/:pollId` - Submit vote
- `DELETE /api/polls/:id` - Delete poll (creator or admin only)

## Environment Variables

**Backend (.env):**
```
MONGO_URI=mongodb://...
ADMIN_KEY=your_secret_admin_key
PORT=5000
CLIENT_URL=https://your-frontend-url
```

**Frontend:**
Uses `http://localhost:5000` as API proxy during development (configured in vite.config.js)

# Assignment Notes
Fairness / Anti-Abuse Mechanisms:
1. Fairness / Anti-Abuse Mechanisms
  - Each user is assigned a browser fingerprint.
  - The backend ensures only one vote per poll per fingerprint.
  - Duplicate vote attempts are rejected with a 409 Conflict error.

2. Restricted Poll Deletion
  - Restricted Poll Deletion: 
    - The request comes from the poll creator (verified via fingerprint), or
    - A valid ADMIN_KEY is provided.
  - Prevents unauthorized manipulation of polls.

# Edge Cases Handled
- Invalid or Non-Existent Poll IDs
    - Returns 404 Not Found with a user-friendly message.

- Invalid Poll Creation

- Polls must include:
    - A non-empty question
    - At least two options

- Invalid payloads return 400 Bad Request.

- Duplicate Voting Attempts
    - Already-voted users cannot vote again.
    - Results are shown instead of allowing another vote.

- Direct Link Access
    - Shared poll links (/poll/:id) work when opened directly or shared with others.

- Graceful UI States
    - Loading indicators
    - Clear messages for missing or deleted polls

# Known Limitations & Future Improvements
- Fingerprint Limitations
    - Fingerprints can be bypassed using incognito mode or different devices.
    - Future improvement: account-based voting or OTP verification.

- No WebSocket-Based Real-Time Updates:
    - Votes update via API re-fetch.
    - Future improvement: Socket.IO for true live updates.

- No Rate Limiting
    - API currently allows unlimited requests.
    - Future improvement: rate limiting middleware.

- Basic Admin Authentication
    - Admin access relies on a static secret key.
    - Future improvement: secure admin dashboard with authentication.

- Accessibility Enhancements
    - UI can be improved with better keyboard and ARIA support.