# SAATHI Project Progress Tracker

## Project Overview

SAATHI is an AI counselling platform for vocational training in India (Smart India Hackathon 2026, Problem Statement 262241). It counsels the family unit: private learner window, private parent window, joint room, grounded AI backed by verified local career data, and optional live counsellor escalation.

---

## Phase Checklist

### Phase 0: Foundation

- [x] npm workspaces monorepo structure (`apps/web`, `apps/api`, `packages/shared`)
- [x] Strict TypeScript configuration with `tsconfig.base.json`
- [x] ESLint, Prettier, EditorConfig, `.gitignore`
- [x] Zod-validated environment config for API and Web with documented `.env.example` files
- [x] Docker Compose for PostgreSQL, API, and Web
- [x] GitHub Actions CI workflow (lint, typecheck, test, build, knip)
- [x] API `/health` and `/ready` endpoints returning standard envelope
- [x] Web shell connected to shared types, responsive starter UI
- [x] Unit tests for API and Web
- [x] Verification: lint, typecheck, test, build pass with zero warnings

### Phase 1: Design system and app shell

- [x] Design tokens (Hearth palette: terracotta, marigold, leaf green, warm white, warm charcoal)
- [x] Source Serif 4 and Public Sans fonts
- [x] Core UI components with all interaction states
- [x] App shell (Header, Nav, Language Switch, Theme Toggle, Footer, Mobile Drawer)
- [x] Router with lazy routes, progress bar, error boundary, 404 page
- [x] i18n scaffold (English, Hindi)
- [x] Hidden `/design` showcase route
- [x] Tests and accessibility checks

### Phase 2: API core, database and auth

- [x] Express layered architecture and `/api/v1` routes
- [x] Prisma schema, migrations, seed skeleton
- [x] Auth system: learner & parent registration, minor consent, JWT cookies, role authorization
- [x] OpenAPI documentation at `/api/docs`
- [x] Web auth integration, session store, protected routes
- [x] Integration tests

### Phase 3: Household intake and verified data layer

- [ ] Household intake flow (location, income, class level)
- [ ] Verified outcome data model and retrieval service
- [ ] Confidence labels (High, Medium, Low, None) and fallback ladder (block -> district -> state -> national)
- [ ] Median and range calculations (no averages)
- [ ] Seed script with DEMO data for 1 district and 4 trades
- [ ] NSQF ladder SVG builder and Trade Explorer
- [ ] Unit tests for confidence rules, fallback, and NSQF ladder

### Phase 4: Private windows, PIN rooms and consent ledger

- [ ] Student and Parent private windows with voluntary mapping questions
- [ ] PIN security (hashed, 3-attempt lockout, 2-minute idle auto-lock, picture-pattern option, leave quickly)
- [ ] Hash-chained digital consent ledger with verify endpoint and visual integrity indicator
- [ ] Bhavishya Engine (concern mapping and joint agenda preparation)
- [ ] Pre/post concern score event tracking
- [ ] Privacy and share isolation tests

### Phase 5: Joint room and grounded AI

- [ ] Real-time joint chat via Socket.IO
- [ ] LLM provider interface (`llm.provider.ts`) and mock/retrieval adapter
- [ ] Grounded retrieval over verified data store (strict citation, refusal of unverified/out-of-scope queries)
- [ ] Joint room UI with prepared agenda, NSQF ladder, and shared items only
- [ ] AI guardrails tests

### Phase 6: Videos, live counselling and Decision Card

- [ ] Course video player (2 videos per course, captions, offline cache)
- [ ] "Are your concerns answered?" checkpoint
- [ ] WebRTC live video counselling booking and call with audio fallback
- [ ] Counsellor console with privacy filters
- [ ] Family Decision Card (printable 1-page PDF, SMS summary)
- [ ] Provider linking with scheme/stipend information
- [ ] End-to-end integration tests

### Phase 7: Admin dashboard

- [ ] Aggregation services with k-anonymity (suppress groups < 10)
- [ ] Heatmaps, concern breakdowns, sentiment shifts, decision funnels, escalation tracker
- [ ] CSV export and recommended follow-up actions
- [ ] Privacy and suppression verification tests

### Phase 8: Low network, low literacy and voice

- [ ] Network detection and automatic Lite mode
- [ ] PWA service worker and IndexedDB offline queue
- [ ] Web Speech API adapter for voice I/O (Bhashini-ready)
- [ ] Icon-first review and full Hindi localization
- [ ] Network throttling tests (3G, 2G, offline)

### Phase 9: Hardening, tests, documentation

- [ ] Playwright smoke flows (family intake to decision card, admin dashboard)
- [ ] Responsive horizontal-overflow audit (320px, 375px, 768px, 1280px)
- [ ] Full repo audit (no emoji, no purple, no pill buttons, no console.log, no TODOs, no AI attribution tags)
- [ ] Documentation: README.md, START.md, CONTRIBUTING.md, ARCHITECTURE.md, API.md, DESIGN.md
- [ ] Final compliance check against Definition of Done

---

## Decisions and Ambiguity Resolutions

- Ambiguity Resolution (Phase 0): API and Web share schema definitions through `packages/shared`. TypeScript project references enable strict monorepo builds.
- Process Decision (Phase 1): After every phase completion, the branch will be pushed to GitHub (`https://github.com/sarthak654/Saathi.git`) on `main` before requesting continue.
