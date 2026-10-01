# Pulse

A responsive social feed demo built with React, TypeScript, and Vite. Browse posts, share text and media, and join threaded conversations.

## Features

- Infinite-scrolling feed with seeded demo posts
- Create posts with up to 280 characters
- Attach up to three images and/or videos per post (20 MB maximum per file)
- Swipe through post media or use carousel controls
- Open images in a lightbox with zoom, fit, and keyboard navigation
- Like posts and add comments with replies capped at two levels
- Edit and delete your own posts
- Light and dark themes
- Responsive layout for desktop and mobile

## Getting Started

### Requirements

- Node.js 20.19+ or 22.12+
- npm

### Install and run

```bash
git clone https://github.com/modhavishal/mini-social-feed.git
cd mini-social-feed
npm install
npm run dev
```

Vite prints the local development URL in the terminal after it starts.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint |

## Tech Stack

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4
- TanStack Query for feed and mutation state
- React Hook Form and Zod for post validation
- Zustand for theme state
- Oxlint

## Project Structure

```text
src/
  app/                 App entry and providers
  features/feed/       Feed API, hooks, components, and page
  shared/              Layout, UI components, store, and utilities
```

## Demo Data and Media

The feed API is an in-memory mock in `src/features/feed/api.ts`; it does not connect to a server or database. Posts, comments, likes, and edits reset when the page reloads. Selected media uses browser object URLs and is not uploaded or persisted. Add a backend and media-storage service to make posts persistent.
