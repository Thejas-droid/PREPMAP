# Quant Path

A calm, local-first study application for the 16-week Quant Developer → Optiver preparation plan.

## Product design

The app deliberately makes **Today** the default view. Daily use is intentionally simple:

1. Open the app.
2. See today's study blocks in time order.
3. Read the purpose and exact steps.
4. Open the supplied resource.
5. Study / code / practise outside the tracker.
6. Tick the block complete.

There are no required journals, evidence fields, timers, XP forms, or task-management chores. Older unfinished work appears in a collapsed Carry-over section and never replaces today's core schedule.

The 16-week program begins **7 October 2026**.

## Architecture

- **Frontend:** React + TypeScript + Vite PWA
- **Immediate/offline persistence:** IndexedDB (Dexie)
- **Frontend hosting:** GitHub Pages
- **API:** Node.js + Express on Render Free
- **Persistent cloud database:** Neon Postgres Free
- **Authentication:** single-owner email/password account, JWT bearer token
- **Sync model:** local-first, debounced cloud sync; cloud is never required to open or tick a task

This split is intentional. Render Free web services spin down when idle and have ephemeral local files, so the UI must never wait on the API. Neon holds the durable cloud copy.

## Local development

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Without `VITE_API_BASE_URL`, the app works fully in local-only mode.

### API

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

The API automatically creates its two small tables on startup.

## Free cloud deployment

### 1. Create a Neon database

Create a free Neon project and copy its Postgres connection string.

You do not need to manually create tables; the API creates them on first start.

### 2. Deploy the API on Render

Connect this GitHub repository to Render. You can use `render.yaml` as a Blueprint or create a **Free Web Service** with `server` as the root directory.

Set these environment variables:

- `DATABASE_URL` — your Neon connection string
- `JWT_SECRET` — a long random value (Render can generate this from the Blueprint)
- `OWNER_SETUP_CODE` — a one-time secret you choose, e.g. a 24+ character random string
- `CORS_ORIGINS` — your frontend origin, e.g. `https://YOUR_USERNAME.github.io` (add `http://localhost:5173` separated by a comma for development)

After deployment, verify:

```text
https://YOUR_RENDER_SERVICE.onrender.com/api/health
```

### 3. Connect GitHub Pages to the API

In your GitHub repository:

1. Open **Settings → Secrets and variables → Actions → Variables**.
2. Create repository variable `VITE_API_BASE_URL`.
3. Set it to your Render URL, for example `https://quant-path-api.onrender.com`.
4. Open **Settings → Pages** and select **GitHub Actions** as the source.
5. Push to `main` (or run the included workflow manually).

The workflow in `.github/workflows/deploy-pages.yml` builds `frontend/` and publishes it to GitHub Pages.

### 4. First cloud-sync setup

Open the deployed app → **Settings → Cloud sync → First-time setup**.

Enter:

- your email
- a password of at least 10 characters
- the `OWNER_SETUP_CODE` you placed in Render

Only the first owner account can be created. After that, the setup endpoint refuses new users; use normal Sign in on other devices.

## Persistence behaviour

### Always available

Each tick is written to IndexedDB immediately. Closing the tab, browser, or losing network connectivity does not lose normal progress.

### Cross-device

When signed in, the app syncs the full small progress state to Neon through the Render API. If Render is asleep, the app continues locally and syncs after the service wakes.

### Portable backup

Settings also contains JSON export/import so you are not dependent on either browser storage or the cloud service.

## Render Free caveat

A free Render web service sleeps after inactivity and can take noticeable time to wake. This app is designed so that cold start only delays **cloud sync**, not studying or task completion.

Do **not** use SQLite or files on the free Render instance for progress storage. Free Render service files are ephemeral.

## Repository layout

```text
frontend/             React PWA
  public/plan.json    complete enriched 16-week study plan
server/               Express API
render.yaml           Render deployment blueprint
.github/workflows/    GitHub Pages deployment
```
