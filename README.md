# SAATHI (साथी)

AI-guided vocational counselling for learners and families in India.

SAATHI helps a learner and their family explore vocational careers, record private concerns, compare expectations in a shared family room, chat in real time, and reach a documented decision. The project includes a React/Vite web application, an Express/Socket.IO API, a PostgreSQL database managed with Prisma, and an optional translation service.

## What is included

- Learner, parent, counsellor, and administrator roles
- Private learner and parent windows
- PIN-protected parent window
- Joint family room with Socket.IO chat, presence, typing indicators, and WebRTC signalling
- Multilingual interface with English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, and Malayalam
- Career/trade exploration and seeded demonstration data
- Counsellor escalation and administrator dashboard
- Prisma PostgreSQL schema and idempotent seed script
- Optional LibreTranslate/FastAPI service for translating dynamic text

## Repository layout

```text
.
├── apps/
│   ├── api/                 Express API, Socket.IO, Prisma schema and seed
│   └── web/                 React/Vite frontend
├── packages/
│   └── shared/              Shared TypeScript types, schemas and contracts
├── services/
│   └── translation/         Optional FastAPI translation service
├── docker-compose.yml       Local PostgreSQL/API/web containers
├── render.yaml              Render deployment blueprint
└── package.json             npm workspace scripts
```

## Requirements

Install the following before starting:

- Git
- Node.js 20 or 22 LTS
- npm 10 or newer
- PostgreSQL 16 or newer, or Docker Desktop
- Python 3.11 or newer only if you want to run the optional translation service

Node.js 24 may work, but Node.js 20 or 22 LTS is recommended because it matches the project's tested development setup.

### Install prerequisites on macOS

The easiest macOS setup uses [Homebrew](https://brew.sh):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install git node@22
brew install --cask docker
```

Restart your terminal after installing Node. If the `node` command is not found, follow Homebrew's PATH instructions or open a new terminal window.

Verify the tools:

```bash
git --version
node --version
npm --version
docker --version
docker compose version
```

Start Docker Desktop before using Docker Compose.

### Install prerequisites on Windows

Install Git, Node.js LTS, and Docker Desktop using their official installers. Then open PowerShell and verify:

```powershell
git --version
node --version
npm --version
docker --version
docker compose version
```

### Install prerequisites on Linux

Install Git, Node.js LTS, npm, and Docker using your distribution's recommended packages. Docker Compose must be available as `docker compose`.

## Clone and install

Use a terminal:

```bash
git clone https://github.com/beingzpranav/SAAATHI.git
cd SAAATHI
npm install
```

If you are working from the original repository instead, clone:

```bash
git clone https://github.com/sarthak654/Saathi.git
```

All commands in this README are run from the repository root unless a command explicitly changes directory.

## Choose a database

You can use either a local PostgreSQL database or a hosted PostgreSQL database such as Neon.

### Option A: PostgreSQL with Docker (recommended for beginners)

From the repository root:

```bash
docker compose up -d postgres
```

This creates:

```text
Host:     localhost
Port:     5432
Database: saathi_db
User:     saathi_user
Password: saathi_password
```

Check that PostgreSQL is ready:

```bash
docker compose ps
docker compose logs postgres
```

Stop only the database when finished:

```bash
docker compose stop postgres
```

To remove the container and its stored data, use this only when you no longer need the local database:

```bash
docker compose down -v
```

### Option B: PostgreSQL installed directly

Install PostgreSQL 16 or newer, create a database and user, and use the resulting connection string in `apps/api/.env`.

Example connection string:

```text
postgresql://saathi_user:saathi_password@localhost:5432/saathi_db?schema=public
```

On macOS with Homebrew, PostgreSQL can be installed with:

```bash
brew install postgresql@16
brew services start postgresql@16
```

### Option C: Neon or another hosted PostgreSQL provider

Create a PostgreSQL database and copy its connection string. It normally looks similar to:

```text
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

Do not commit this value, paste it into a public issue, or add it to Git. Use it only in your local `apps/api/.env` file or your hosting provider's secret configuration.

## Configure environment variables

Create the local environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

On Windows PowerShell, use:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Open `apps/api/.env` and verify or update these values:

```dotenv
NODE_ENV=development
PORT=4000
API_BASE_URL=http://localhost:4000
DATABASE_URL=postgresql://saathi_user:saathi_password@localhost:5432/saathi_db?schema=public
CORS_ORIGIN=http://localhost:3000
JWT_ACCESS_SECRET=dev_access_secret_change_me_to_at_least_32_characters
JWT_REFRESH_SECRET=dev_refresh_secret_change_me_to_at_least_32_characters
LOG_LEVEL=info
```

Both JWT secrets must contain at least 32 characters. Use different random values for real deployments.

Open `apps/web/.env` and verify:

```dotenv
VITE_API_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000
```

The frontend variables must use valid full URLs. If you change the API port, update `PORT`, `API_BASE_URL`, `CORS_ORIGIN`, `VITE_API_URL`, and `VITE_SOCKET_URL` consistently.

Never commit `.env` files. The repository's `.env.example` files are safe templates; secrets belong only in untracked local files or hosting-provider secrets.

## Prepare the database

Generate the Prisma client:

```bash
npm run prisma:generate --workspace=@saathi/api
```

Synchronize the local database schema:

```bash
npx prisma db push --schema apps/api/prisma/schema.prisma
```

Seed demo users and sample data:

```bash
npm run prisma:seed --workspace=@saathi/api
```

The seed script uses upserts and can be run again without intentionally duplicating the demo records. Run it again whenever you create a new empty database.

## Start SAATHI locally

Open two terminal windows from the repository root.

### Terminal 1: API

```bash
npm run dev:api
```

The API runs at `http://localhost:4000`.

### Terminal 2: web application

```bash
npm run dev:web
```

The web application runs at `http://localhost:3000`.

Open [http://localhost:3000](http://localhost:3000) in your browser.

The Vite development server proxies API requests to the local API. Socket.IO and WebRTC signalling connect directly to the URL in `VITE_SOCKET_URL`.

### Useful local URLs

| URL | Purpose |
| --- | --- |
| [http://localhost:3000](http://localhost:3000) | Web application |
| [http://localhost:3000/login](http://localhost:3000/login) | Login |
| [http://localhost:4000/health](http://localhost:4000/health) | API health check |
| [http://localhost:4000/api/docs](http://localhost:4000/api/docs) | Interactive API documentation |
| [http://localhost:3000/design](http://localhost:3000/design) | Design-system showcase |

The health endpoint should return a successful JSON response containing a healthy status.

## Demo accounts

After seeding, use any of these accounts:

| Role | Email | Password | PIN |
| --- | --- | --- | --- |
| Learner | `learner@saathi.demo` | `Password123!` | `1234` |
| Parent | `parent@saathi.demo` | `Password123!` | `5678` |
| Counsellor | `counsellor@saathi.demo` | `Password123!` | Not required |
| Administrator | `admin@saathi.demo` | `Password123!` | Not required |

These are demonstration credentials only. Change or remove them before using a public database for real users.

To test family-room features, sign in as the learner and parent in separate browser profiles or private windows. Use the seeded household/room data and confirm both clients can see presence and messages.

## Optional translation service

The main application works without the translation microservice. Static interface translations are bundled in the web app. Dynamic translation requests can use the optional FastAPI service in `services/translation`.

The translation service expects LibreTranslate. A typical local setup is:

```bash
cd services/translation
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

On Windows PowerShell, activate the virtual environment with:

```powershell
.\.venv\Scripts\Activate.ps1
```

LibreTranslate itself is usually run separately with Docker:

```bash
docker run --rm -p 5000:5000 libretranslate/libretranslate
```

If the API should use the translation service, add these values to `apps/api/.env`:

```dotenv
TRANSLATION_SERVICE_URL=http://localhost:8000
TRANSLATION_INTERNAL_SECRET=
```

If you configure a shared secret, configure the same value in the translation service. Do not expose internal translation secrets in frontend variables. See [services/translation/README.md](services/translation/README.md) for supported languages and endpoint details.

## Run with Docker Compose

Docker Compose can run PostgreSQL, the API, and the web app together:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000). The Compose API container runs Prisma schema synchronization during startup. If you need demo data in the Compose database, seed it from the host after the containers are healthy:

```bash
npm run prisma:seed --workspace=@saathi/api
```

For day-to-day development, running only PostgreSQL in Docker and the API/web with npm is usually faster and provides hot reload:

```bash
docker compose up -d postgres
npm run dev:api
# In another terminal:
npm run dev:web
```

## Build and test

Run the shared package build before API or full repository builds:

```bash
npm run build --workspace=@saathi/shared
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm run test
npm run format:check
npm run build
```

The web end-to-end suite uses Playwright:

```bash
npm run test:e2e
```

If Playwright browsers are not installed on a new machine:

```bash
npx playwright install
```

## Common problems

### `ECONNREFUSED 127.0.0.1:5432`

PostgreSQL is not running or the connection string is wrong.

```bash
docker compose up -d postgres
```

Then check `DATABASE_URL` in `apps/api/.env`.

### `P1001: Can't reach database server`

Confirm the database host, port, username, password, database name, and SSL option. Local PostgreSQL normally uses `localhost` without `sslmode=require`; hosted providers commonly require `sslmode=require`.

### Prisma client errors

Regenerate the client:

```bash
npm run prisma:generate --workspace=@saathi/api
```

### Login fails after a fresh setup

The database is probably empty. Run:

```bash
npx prisma db push --schema apps/api/prisma/schema.prisma
npm run prisma:seed --workspace=@saathi/api
```

Then use one of the demo accounts above.

### CORS errors in the browser

For local development, `CORS_ORIGIN` must exactly match the browser origin:

```dotenv
CORS_ORIGIN=http://localhost:3000
```

Do not use `*` while requests include credentials. Restart the API after changing `.env`.

### Port 3000 or 4000 is already in use

Find and stop the process using the port, or change the API `PORT` and all dependent URLs. Restart both services after changing ports.

### The frontend shows stale configuration

Vite reads `VITE_*` variables when the dev server starts. Stop and restart `npm run dev:web` after changing `apps/web/.env`. A hard refresh may also be needed.

### WebRTC does not connect

Allow camera and microphone access in the browser, use `localhost` or HTTPS, and test with two browser sessions. WebRTC signalling requires the API/Socket.IO server to be running; audio/video connectivity can also depend on firewall or NAT conditions.

## Deployment notes

The repository contains [render.yaml](./render.yaml) for Render deployment and is configured to use an externally managed Neon PostgreSQL database. For deployment:

1. Create a Neon PostgreSQL database.
2. Set `DATABASE_URL` as a Render secret, including `sslmode=require`.
3. Set `CORS_ORIGIN` to the exact deployed frontend URL.
4. Set strong, unique `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` values.
5. Configure one dynamic translation provider:
   - Set `GOOGLE_TRANSLATE_API_KEY` to a Google Cloud Translation API key, or
   - Deploy the FastAPI translation service and set `TRANSLATION_SERVICE_URL` to its public/internal URL, or
   - Set `LIBRETRANSLATE_URL` to a reachable LibreTranslate server.
6. Set `TRANSLATION_INTERNAL_SECRET` only if the translation service is deployed and protected.
7. Redeploy after changing frontend `VITE_API_URL` or `VITE_SOCKET_URL`.

The API does not include a translation engine by itself. If none of the provider variables is configured, dynamic translation intentionally returns the original English text as a graceful fallback. The Render blueprint leaves provider variables as secrets so a deployment does not accidentally point at `localhost`, which is inside the API container and is not a translation service.

The Render API startup synchronizes the Prisma schema and runs the idempotent demo seed. Do not use the public demo seed unchanged for a production deployment containing real users; remove demo credentials or replace the startup seed with a controlled one-time migration/job.

## Security and privacy

- Never commit `.env`, database URLs, JWT secrets, API keys, or private keys.
- Never use the demo password for real users.
- Use HTTPS in production.
- Keep `CORS_ORIGIN` restricted to trusted frontend origins.
- Use separate database credentials for development, staging, and production.
- Review and rotate secrets if they are ever pasted into chat, an issue, a log, or a public repository.
- Do not load real family or counselling data into the demo database.

## More documentation

- [START.md](./START.md) — shorter local quick-start guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) — application architecture and data model
- [API.md](./API.md) — REST API documentation
- [DESIGN.md](./DESIGN.md) — Hearth design system and i18n
- [CONTRIBUTING.md](./CONTRIBUTING.md) — development and pull-request workflow
- [services/translation/README.md](./services/translation/README.md) — optional translation service

## License

This project is intended to be released under the MIT License. Add the repository's license file before distributing a formal release.
