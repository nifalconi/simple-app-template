# Changelog

All notable changes to this template are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] — 2026-04-20

Initial public template: a serverless, offline-first PWA scaffold that auto-deploys to GitHub Pages.

### Added
- Vite + React 18 + TypeScript (strict) PWA scaffold with `vite-plugin-pwa`.
- Home and Settings screens with theme (light/dark) and accent color selection.
- PWA install prompt hook (Chrome/Edge).
- Dormant capability libraries in `src/lib/`: haptics, notifications, audio (beep / chime / alarm).
- Full Dev panel (hidden, triple-tap `v1.0` in Settings): storage inspector, service worker controls, PWA diagnostics, viewport info, build metadata, reset.
- Dev panel opens as full-screen overlay.
- Daily reminder with day picker and hour dropdown (lives in Dev panel).
- Features support matrix in Dev panel.
- `src/app.config.ts` as the single rebrand point.
- `init(root, appConfig)` entry contract in `src/main.tsx`.
- README, CLOUD_RULES, pitch/philosophy, and GitHub Pages deploy guide.
- "Start your own app" section with code / vibe-code / design workflows.
- `CLAUDE.md` + `.claude/` rules and skills for agent-assisted forks.

### Fixed
- Dev panel Reminders layout; "Fire now" now actually shows the notification.
- Stale `<title>` in `index.html` (was `Breathe`, now `simple`).

### Changed
- Reminders moved from main app to Dev panel (template stays neutral).
- Dev panel restyled for consistent layout and polish.

### Documentation
- Clarified reminder reliability across foreground / background / closed app states.

[Unreleased]: https://github.com/OWNER/REPO/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/OWNER/REPO/releases/tag/v1.0.0
