# simple-app-template

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

There are so many apps today that do so little. With modern vibe-coding capabilities, you don't need a startup, a backend, or a store listing to ship something useful. You need a simple template, a GitHub account, and a weekend.

This is that template. Vite + React + TypeScript + `vite-plugin-pwa`, hosted free on GitHub Pages, installable on a phone like any native app. Zero backend, zero tracking, zero cost.

## Philosophy

- **Small.** No more than 2–3 screens. If it needs more, it's a different app.
- **One thing.** Each app fulfills exactly one purpose. No dashboards, no settings that branch into settings, no feature creep.
- **Nice and simple.** Calm design, clear hierarchy, no dark patterns. Make something you'd want to open.
- **Share it. Be nice.** Ship it publicly, link friends, don't sell them anything.

## Features

Support matrix for everything the template ships with. Verified — not aspirational.

| Feature | Description | Available | iOS Safari | Android Chrome |
| --- | --- | :-: | :-: | :-: |
| PWA Install | Add to home screen, run in own window | ✅ | ⚠️ manual (Share → Add) | ✅ native prompt |
| Offline cache | App works without network after first visit | ✅ | ✅ | ✅ |
| Light / Dark / Auto theme | Follows system or forced by user | ✅ | ✅ | ✅ |
| Accent colors | 4 palettes (sage, blue, lavender, beige) | ✅ | ✅ | ✅ |
| `localStorage` persistence | User prefs survive reloads | ✅ | ✅ | ✅ |
| Haptics (Vibration API) | Tactile feedback on interactions | ✅ | ❌ ignored | ✅ |
| Audio (Web Audio oscillators) | Beeps, chimes, alarms — no audio files | ✅ | ✅ (after first tap) | ✅ |
| Notifications | OS-level notification popups | ✅ | ⚠️ installed PWA only | ✅ |
| Daily reminder | Schedule chime + notification on selected days/hour | ✅ | ✅ open tab | ✅ open tab |
| Reminder while app closed | Fire even when tab is closed | ❌ | ❌ needs push server | ❌ needs push server |
| Dev panel | Hidden diagnostics overlay (triple-tap `v1.0`) | ✅ | ✅ | ✅ |
| Auto-deploy to GitHub Pages | Push to `main` → live in ~60s | ✅ | n/a | n/a |

Legend: ✅ works · ⚠️ works with caveat · ❌ not supported on this platform.

## What the template gives you

- **Splash + theme + accent** — light / dark / auto + four accent colors, persisted to `localStorage`.
- **Install button** — captures `beforeinstallprompt`, lets users add the app to their home screen from inside Settings. iOS Safari fallback included.
- **Offline-first** — service worker precaches the bundle on first visit. Works without network after that.
- **Hidden Dev panel** — inside Settings, triple-tap the `v1.0` footer. Reveals test buttons for [src/lib/haptics.ts](src/lib/haptics.ts) (Vibration API), [src/lib/audio.ts](src/lib/audio.ts) (Web Audio beeps/chimes/alarms), and [src/lib/notifications.ts](src/lib/notifications.ts) (Notification API). Capabilities are dormant by default — wire them into your fork's logic when you need them.
- **Auto-deploy to GitHub Pages** — push to `main`, the Action builds and publishes. Subpath + theme color auto-injected.

## Start your own app

Two paths. Both work.

**Path A — Just clone it and code.** Click **Use this template** on GitHub (or fork), name your repo, and go. No AI required — this is a plain Vite + React + TypeScript project.

**Path B — Vibe-code it with Claude skills and agents.** The common lane now. You describe what you want in plain language; an agent writes the code against this template's scaffolding.

1. Create your repo from this template (**Use this template** on GitHub).
2. Clone it locally and open it in [Claude Code](https://docs.claude.com/en/docs/claude-code) (or Cursor, Windsurf — any agent that understands the repo).
3. Tell the agent what your app does. Example: *"turn this template into a water-intake tracker. One screen: a big number with + / − buttons. Persist the count to localStorage. Reset at midnight."*
4. The agent rewrites [src/Home.tsx](src/Home.tsx) and the parts of [src/App.tsx](src/App.tsx) it needs. The splash, theme, settings, install button, and deploy workflow stay untouched.
5. Run `npm run dev`, iterate with the agent, push to `main`, ship.

Use Claude's [skills](https://docs.claude.com/en/docs/claude-code/plugins) (`/skills`) to accelerate repeat tasks — commits, PR reviews, test generation — without retyping the same prompts.

**Path C — Design first with Claude Design, then implement.** This template was built this way.

1. Mock your app's screens in [Claude Design](https://claude.ai/design). Chat your way to a clickable prototype.
2. From the design, export the handoff bundle (HTML/CSS/JS) or copy the share URL.
3. Create a new repo from this template (**Use this template** button on GitHub).
4. Hand the design bundle URL to a coding agent and say: *"based on this design, implement it in this template."* The agent ports the design into `src/App.tsx` + screen components, keeping the splash, theme, install, and deploy plumbing untouched.
5. Push to `main`, enable Pages, ship.

Claude Design is **not** required — the template is self-sufficient. It's an optional polish layer when you want to iterate on UI visually before writing code.

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
5. **Enable Pages** (see full guide below). Push to `main`. Action deploys to `https://<user>.github.io/<repo>/`.

## Deploy to GitHub Pages (full guide)

The repo ships with a GitHub Action at [.github/workflows/deploy.yml](.github/workflows/deploy.yml) that builds and publishes on every push to `main`. First-time setup is four clicks.

**1. Create the repo on GitHub.** Either "Use this template" at the top of the GitHub page, or fork it, or push a clone to a new repo of your own.

**2. Enable GitHub Pages with Actions as the source.**

- Go to your repo → **Settings** → **Pages** (left sidebar).
- Under **Build and deployment** → **Source**, pick **GitHub Actions**.
- That's it. No branch to configure, no `gh-pages` branch needed.

**3. Trigger the deploy.** Any of:

- Push any commit to `main`, or
- Go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**, or
- Run `gh workflow run deploy.yml` from your terminal.

**4. Wait ~60 seconds** and open `https://<your-username>.github.io/<repo-name>/`. The URL also shows up in the Action's deploy step output.

### How the Action knows the subpath

GitHub Pages serves this repo at `/<repo>/`, not `/`. The Action injects `VITE_BASE=/${{ github.event.repository.name }}/` at build time, and [vite.config.ts](vite.config.ts) reads that env var into Vite's `base` config. No manual config needed — renaming the repo just works.

### Custom domain (optional)

1. Add a `CNAME` file to `public/` containing your domain (one line, no protocol: `example.com`).
2. In your DNS, point the domain at `<user>.github.io` (A/AAAA records per [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)).
3. Repo → Settings → Pages → **Custom domain** → enter it.
4. Tick **Enforce HTTPS** once the cert provisions (~15 min).

### Debugging a failed deploy

- Check the **Actions** tab for red X's. The first failed step explains itself.
- Common issues: Pages source still set to "Deploy from a branch" (switch it to "GitHub Actions"), or the repo's Pages feature was never enabled (Settings → Pages → enable).
- After fixing, re-run: `gh workflow run deploy.yml`.

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
