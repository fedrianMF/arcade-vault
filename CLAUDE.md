# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault: an online platform to play games and compete for the highest score. The README says the project follows Spec Driven Design (`/spec` and `/spec-impl`), using skills from https://github.com/Klerith/fernando-skills (`npx skills@latest add Klerith/fernando-skills`). The README is written in Spanish. No `spec/` directory or skills are installed in the repo yet.

## Commands

```bash
npm run dev      # next dev
npm run build    # next build
npm run start    # next start
npm run lint     # eslint (flat config, eslint.config.mjs)
```

No test runner is configured.

## Architecture

- Next.js (App Router, `app/` at the repo root), React 19, TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`, see `postcss.config.mjs`). The app is still the Create Next App scaffold (`app/layout.tsx`, `app/page.tsx`, `app/globals.css`).
- Path alias: `@/*` maps to the repo root (`tsconfig.json`).
- Next.js is a newer version than your training data (see AGENTS.md). Read the matching guide under `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`) before writing Next.js code.

## Repo layout gotcha

`arcade-vault/` is an untracked nested copy of the scaffold with its own `package.json`, `node_modules`, and different dependency versions (next 16.4.3, react 19.3.0, `@tailwindcss/turbopack`). The root project (next 16.3.5) is the one tracked in git and the one the root `npm` scripts run. Don't edit the nested copy unless asked, and check which one a task refers to.
