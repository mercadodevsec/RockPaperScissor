# Rock Paper Scissor

A simple rock-paper-scissors game with a React frontend and an Express/TypeScript backend. The backend stores game history in SQLite so players can view past results and scores.

## Features

- Play rock, paper, or scissor against the bot
- Track round outcomes and final game winner
- Save and load game history from the backend
- Explore the API using Swagger documentation

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: Express, TypeScript, Sequelize, SQLite, Swagger

## Project Structure

- backend/ - API server, routes, models, and database sync logic
- frontend/ - React application UI
- docker-compose.yml - Docker Compose configuration file

## Prerequisites

Make sure you have the following installed:

- Node.js 18 or later
- npm

## Getting Started

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Initialize the database

```bash
npm run sync
```

### 3. Start the backend server

```bash
npm run dev
```

The backend will run on:

- http://localhost:3000
- Swagger docs: http://localhost:3000/api-docs

### 4. Start the frontend

Open a new terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

- http://localhost:5173

## API Overview

The backend exposes game-related routes under:

- POST /api/game/reset
- POST /api/game/save
- GET /api/game/load
- GET /api/game/results

## Build the Frontend

```bash
cd frontend
npm run build
```

## Notes

- The frontend expects the backend to be running at http://localhost:3000.
- The backend uses environment variables from a local .env file when available.
