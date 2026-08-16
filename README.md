# PRISM

**P**ersonal **R**eactive **I**nteractive **S**ound **M**atrix — a Stark Industries–style music player with a real-time audio visualizer, built with React, Web Audio API, Tailwind CSS, and the [Jamendo API](https://developer.jamendo.com/v3.0).

## Features

- Load royalty-free tracks from Jamendo by title, artist, or mood
- Upload local audio files
- One playback session for Search and Playlist: next/previous, shuffle, and repeat follow the current track
- Real-time oscillogram on Canvas from time-domain PCM (Web Audio `AnalyserNode`)
- Playlist management with `localStorage` persistence
- Playback controls: play/pause, seek, volume, mute, next/previous, shuffle, repeat (off / all / one)
- Restore the current track after refresh
- Keyboard shortcuts: Space, arrows, Shift+arrows, M

## Stack

- **React 19** + **TypeScript**
- **Vite** — bundler
- **Tailwind CSS v4**
- **Web Audio API** — analyser + canvas oscillogram
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
VITE_JAMENDO_CLIENT_ID=your_jamendo_client_id
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
| `pnpm test:watch` | Jest in watch mode |
| `pnpm storybook` | Start Storybook on port 6006 |
| `pnpm build-storybook` | Build static Storybook |
| `pnpm lint` | ESLint |

## Docker

Development:

```bash
docker compose up --build
```

App will be available at [http://localhost:5173](http://localhost:5173)

Production (nginx):

```bash
docker compose --profile prod up app-prod --build
```

App will be available at [http://localhost:8080](http://localhost:8080)

## GitFlow workflow

One task → one branch from `develop` → merge back into `develop` with `--no-ff`.
Delete the feature branch after it lands. `main` is updated only when a release is ready.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/my-task

# ... work, commit ...

git checkout develop
git merge --no-ff feature/my-task
git push origin develop
git branch -d feature/my-task
git push origin --delete feature/my-task

# When ready for release:
git checkout main
git merge --no-ff develop
git push origin main
```

## Storybook

Documented components:

- `Shared/Button`
- `Shared/Slider`
- `Shared/Toast`
- `Entities/TrackItem`
- `Features/PlayPauseButton`
- `Features/SeekBar`
- `Widgets/AudioVisualizer`
- `Widgets/PlayerBar`
- `Widgets/PlaylistPanel`
- `Widgets/TrackSearchPanel`

```bash
pnpm storybook
```

## Tests

```bash
pnpm test
```

Tests cover time formatting, keyboard shortcuts, track mappers, playlist hook (including shuffle/repeat), Jamendo search and cache, `SeekBar`, `TrackItem`, playback storage, `AudioEngine`, `useAudioEngine`, and restoring the current track after refresh.
