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
- Lucide Icons

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
```

**Frontend:**
Uses `http://localhost:5000` as API proxy during development (configured in vite.config.js)

