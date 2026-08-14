# Harmony Hub

Music player with a real-time audio visualizer built with React, Web Audio API, Tailwind CSS, and the [Jamendo API](https://developer.jamendo.com/v3.0).

## Features

- Load royalty-free tracks from Jamendo by tag/search
- Upload local audio files
- Real-time frequency visualizer on Canvas (Web Audio API)
- Playlist management with `localStorage` persistence
- Custom playback controls: play/pause, seek, volume, next/previous

## Stack

- **React 19** + **TypeScript**
- **Vite** — bundler
- **Tailwind CSS v4**
- **Web Audio API** — analyser + canvas visualizer
- **Jamendo API** — free music catalog
- **Storybook** — component docs
- **Jest + React Testing Library** — unit tests
- **Docker** — dev & production containers
- **pnpm** — package manager (npm is not used)
- **FSD** — Feature-Sliced Design architecture
- **GitFlow** — `develop` → feature branches → merge back → release to `main`

## Project structure (FSD)

```
src/
  app/        — providers, global styles, App shell
  pages/      — route-level pages
  widgets/    — composite UI blocks (player bar, visualizer, panels)
  features/   — user actions (search, upload, seek, playlist)
  entities/   — domain models (track, audio engine)
  shared/     — UI kit, utils, config
```

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure Jamendo

1. Register at [Jamendo Developer Portal](https://devportal.jamendo.com/)
2. Copy `.env.example` → `.env`
3. Set your client ID:

```env
VITE_JAMENDO_CLIENT_ID=your_client_id
```

### 3. Run dev server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run Jest unit tests |
| `pnpm storybook` | Start Storybook on port 6006 |
| `pnpm lint` | ESLint |

## Docker

Development:

```bash
docker compose up --build
```

Production (nginx):

```bash
docker compose --profile prod up app-prod --build
```

App will be available at [http://localhost:8080](http://localhost:8080)

## GitFlow workflow

```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-task

# ... work, commit ...

git checkout develop
git merge feature/my-task
git push origin develop

# When ready for release:
git checkout main
git merge develop
git push origin main
```

Current feature branch: `feature/music-player`

## Storybook

Documented components:

- `Shared/Button`
- `Shared/Slider`
- `Widgets/AudioVisualizer`

```bash
pnpm storybook
```

## Tests

```bash
pnpm test
```

Tests cover time formatting, track mappers, and `TrackItem` interactions.
