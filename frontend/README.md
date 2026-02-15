# PollVault – Live Polling App

A modern real-time polling application built with React, Tailwind CSS, Node/Express, and MongoDB.

## Technologies

- **Frontend**: Vite + React + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Real-time**: Browser fingerprinting for anti-abuse, localStorage for client state

## Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Frontend

```sh
# Install dependencies
npm i

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:8080` and automatically proxy API calls to the backend.

### Backend

```sh
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env and set MONGO_URI and optionally ADMIN_KEY

# Start the server
node server.js
# or use nodemon for auto-reload: npx nodemon server.js
```

The backend runs on `http://localhost:5000`.

## Features

- **Create & Share Polls**: Create polls with 2-10 options, share via link
- **Live Results**: Real-time vote counting with percentage displays
- **Anti-Abuse**: Browser fingerprinting prevents double-voting
- **Creator Deletion**: Only poll creators can delete their polls via the UI
- **Admin Deletion**: Admins can delete any poll using `ADMIN_KEY` environment variable
- **Home Page**: Browse all active polls with recent-first ordering

## Architecture

- `src/` – React components and pages (Home, CreatePoll, PollView)
- `src/api.js` – Helper functions for backend API calls
- `backend/server.js` – Express app entry point
- `backend/models/` – Mongoose schemas (Poll, PollOption, Vote)
- `backend/routes/` – API route handlers

## Environment Variables

### Backend (`.env`)

```
MONGO_URI=mongodb://localhost:27017/livepolls
PORT=5000
ADMIN_KEY=your-secret-admin-key  # optional
```

## Deployment

Both frontend and backend can be deployed independently:

- **Frontend**: Build with `npm run build`, serve the `dist/` folder
- **Backend**: Deploy `backend/` folder to a Node.js host (Heroku, Railway, etc.)

