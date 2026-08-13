# Harmony Hub

React + TypeScript + Vite project scaffold for Music Visualizer.

## Requirements

- Node.js 22+
- pnpm
- Docker and Docker Compose, optional

## Local Development

Install dependencies:

```bash
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set `VITE_JAMENDO_CLIENT_ID` in `.env`.

Start the dev server:

```bash
pnpm dev
```

## Docker Development

Create `.env` from `.env.example`, then run:

```bash
docker-compose up
```

The app will be available at `http://localhost:5173`.
