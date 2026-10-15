# SAATHI Quick Start Guide (Under 10 Minutes)

Welcome to **SAATHI** — the AI counselling platform for vocational training in India (Smart India Hackathon 2026, Problem Statement 262241).

---

## 1. Prerequisites

- **Node.js**: v20.x or v22.x LTS
- **npm**: v10.x or v11.x
- **Docker & Docker Compose**: Optional for local PostgreSQL, or an existing PostgreSQL 16 database.
- **Git**

---

## 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/sarthak654/Saathi.git
cd Saathi

# Install all workspace dependencies
npm install
```

---

## 3. Configure Environment Files

Copy the provided environment templates:

```bash
# Root environment template
cp .env.example .env

# Backend API environment
cp apps/api/.env.example apps/api/.env

# Frontend Web environment
cp apps/web/.env.example apps/web/.env
```

---

## 4. Database Setup (PostgreSQL)

You can run PostgreSQL via Docker Compose:

```bash
# Start PostgreSQL container
docker compose up -d postgres
```

Generate the Prisma Client and run migrations:

```bash
# Generate Prisma Client
npm run prisma:generate --workspace=@saathi/api

# Run Seed Script (generates DEMO accounts and sample trades)
npm run prisma:seed --workspace=@saathi/api
```

---

## 5. Demo Accounts

All seed accounts use the default password: **`Password123!`**

| Role              | Email                    | Password       | PIN    | Description                                 |
| :---------------- | :----------------------- | :------------- | :----- | :------------------------------------------ |
| **Learner**       | `learner@saathi.demo`    | `Password123!` | `1234` | Minor student seeking vocational ITI trades |
| **Parent**        | `parent@saathi.demo`     | `Password123!` | `5678` | Parent guiding trade decisions              |
| **Counsellor**    | `counsellor@saathi.demo` | `Password123!` | N/A    | Vocational counsellor for live escalation   |
| **Administrator** | `admin@saathi.demo`      | `Password123!` | N/A    | State & district dashboard admin            |

_Note: In the login UI, convenient quick-fill buttons are provided for instant 1-click testing with these DEMO accounts._

---

## 6. Running the Applications

Start both services concurrently in development mode:

```bash
# Run API Server (port 4000)
npm run dev:api

# Run Web Client (port 3000)
npm run dev:web
```

Or run everything inside Docker Compose:

```bash
docker compose up --build
```

### Accessing Endpoints:

- **Web App**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:4000/health](http://localhost:4000/health)
- **Interactive OpenAPI Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Design System Showcase**: [http://localhost:3000/design](http://localhost:3000/design)

---

## 7. Running Verification & Quality Checks

Run the automated test and validation commands:

```bash
# Code style and formatting check
npm run format:check

# ESLint analysis (zero warnings allowed)
npm run lint

# Strict TypeScript typechecking across all packages
npm run typecheck

# Full Vitest unit & integration test suites (179 tests)
npm run test

# Full Playwright E2E smoke and responsive audit suites (25 tests)
npm run test:e2e

# Dead code and unused dependency audit (Knip)
npm run knip

# Production build compilation
npm run build
```

---

## 8. Common Errors & Fixes

1. **Prisma Client not found (`@prisma/client`)**:
   - Fix: Run `npm run prisma:generate --workspace=@saathi/api`.
2. **Database connection failed (`ECONNREFUSED 5432`)**:
   - Fix: Ensure PostgreSQL is running (`docker compose up -d postgres`) and matches `DATABASE_URL` in `apps/api/.env`.
3. **Port 4000 or 3000 already in use**:
   - Fix: Update `PORT` in `apps/api/.env` and `VITE_API_URL` in `apps/web/.env`.
