# Breathe

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

A calm, single-purpose breathing PWA. Pick a pattern, follow the orb.

Built from `simple-app-template`: Vite + React + TypeScript + `vite-plugin-pwa`, auto-deploys to GitHub Pages. Zero backend.

## What this app does

Guides slow, deliberate breathing with three patterns: **Calm** (4·7·8), **Box** (4·4·4·4), **Soft** (5·5). Light/Dark/Auto themes, four accent colors, optional haptic pulses.

## Who it's for

Anyone who wants a 60-second reset without fuss — no account, no analytics, no network needed after first load.

## How it works

- **Storage:** user preferences (theme mode, accent) persist in `localStorage` via [src/storage.ts](src/storage.ts).
- **Offline:** service worker precaches the built bundle; full session works without network after first visit.
- **External calls:** Geist font from Google Fonts on first load only — fallback to system-ui if offline.

## Local development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # outputs dist/
npm run preview   # serves the production build
```

## Node version (auto-selected)

Required Node version lives in `.nvmrc` (mirrored in `.node-version`). Every common version manager picks it up:

```bash
nvm use           # reads .nvmrc
fnm use           # reads .nvmrc
asdf install      # reads .node-version
# Volta auto-switches on cd
```

CI reads the same file — [.github/workflows/deploy.yml](.github/workflows/deploy.yml) uses `node-version-file: .nvmrc`. Bump in one place; local + CI stay in sync.

`package.json` declares `engines.node` and `.npmrc` sets `engine-strict=true`, so `npm install` fails loudly on Node mismatch.

## Environment variables

Vite loads `.env*` files automatically. Copy the template:

```bash
cp .env.example .env.local    # .env.local is gitignored
```

Rules:

- **Only `VITE_*` prefixed vars reach the client bundle.** Everything else stays build-time only.
- **Never put secrets in any `.env*` file.** The bundle is public.
- Read vars via `import.meta.env.VITE_MY_VAR`.
- `VITE_BASE` is wired into [vite.config.js](vite.config.js); the GitHub Action overrides it to `/<repo>/` at deploy time.

Precedence: `.env.local` > `.env.<mode>` > `.env`.

## Local PWA testing (install prompt + offline)

`npm run dev` uses a stub service worker — the Install button won't behave like production. To test the real thing:

**Step 1 — build + serve the production bundle:**

```bash
npm run build
npm run preview        # serves dist/ on http://localhost:4173
```

**Step 2 — expose over HTTPS with ngrok:**

```bash
# Install ngrok once: https://ngrok.com/download  (or: brew install ngrok)
ngrok http 4173
```

ngrok prints an HTTPS URL like `https://abc123.ngrok-free.app`. Open that URL in any browser or on your phone.

`*.ngrok-free.app`, `*.ngrok.io`, and `*.trycloudflare.com` are pre-allowed in [vite.config.ts](vite.config.ts) `preview.allowedHosts` — no "Blocked request" errors. Add other tunnel domains there if needed.

**What you can now test:**

- `beforeinstallprompt` fires → Settings → Install → native install dialog appears
- Service worker precaches assets → go offline → app still loads
- iOS Safari: no install prompt, but Share → Add to Home Screen works because the manifest is served over HTTPS

**Same-WiFi shortcut (no ngrok):**
`npm run preview` already binds to `0.0.0.0` (`--host` flag). Find your machine's local IP (`ifconfig` / `ipconfig`) and open `http://192.168.x.x:4173` on your phone. No HTTPS, so iOS Add to Home Screen won't work — but Android Chrome install prompt will.

## Fork → rebrand → deploy (5 steps)

1. **Fork or "Use this template"** on GitHub. Name the new repo after your app.
2. **Edit [src/app.config.ts](src/app.config.ts):** `name`, `shortName`, `description`, `themeColor`, `accentColor`, `purpose`, `audience`.
3. **Swap core logic:** rewrite [src/App.tsx](src/App.tsx) (and the screen components it imports). [src/main.tsx](src/main.tsx) keeps the `init(root, appConfig)` entry contract intact.
4. **(Optional) swap icons:** replace [public/icon.svg](public/icon.svg) + [public/favicon.svg](public/favicon.svg). Flat-color tiles only — [CLOUD_RULES.md](CLOUD_RULES.md) invariant #10 forbids logos.
5. **Enable Pages:** repo → Settings → Pages → *Source: GitHub Actions*. Push to `main`. Action deploys to `https://<user>.github.io/<repo>/`.

## Project structure

```text
src/
  main.tsx          # entry — exports init(root, appConfig)
  App.tsx           # shell: splash, screen nav, theme resolver
  Home.tsx          # home screen (wordmark + orb + Begin)
  Settings.tsx      # settings screen (Appearance + Install + hidden Dev panel)
  constants.ts      # ACCENTS, Prefs, DEFAULTS + shared types
  storage.ts        # localStorage boundary (load/save/remove)
  usePwaInstall.ts  # beforeinstallprompt hook
  style.css         # globals + keyframes
  app.config.ts     # brand (name, colors, description)
  lib/
    haptics.ts       # Vibration API wrapper (dormant by default)
    notifications.ts # Notification API wrapper (dormant by default)
public/
  icon.svg          # PWA icon (flat tile, no logo)
  favicon.svg
```

## Constraints (serverless invariant)

- No backend. No API keys. No build-time secrets.
- Persistence = `localStorage` / `IndexedDB` only.
- Network calls optional (enhancement only). App must work offline.
- Assets live in [public/](public/); code lives in [src/](src/).

## Related

- [CLOUD_RULES.md](CLOUD_RULES.md) — invariants for code-driven app generation.
