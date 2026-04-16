# Foam Dial

Foam Dial is a mobile-first spray foam field app for tracking jobs, logging rig settings, checking diagnostics, and dialing in site conditions.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Cloudflare Pages deployment

Use these settings in Cloudflare Pages:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `foam-dial` (if deploying from the workspace repo root)

## Current stack

- React
- Vite
- Static hosting ready
