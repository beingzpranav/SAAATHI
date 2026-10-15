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

- [x] Household intake flow (location, income, class level)
- [x] Verified outcome data model and retrieval service
- [x] Confidence labels (High, Medium, Low, None) and fallback ladder (block -> district -> state -> national)
- [x] Median and range calculations (no averages)
- [x] Seed script with DEMO data for 1 district and 4 trades
- [x] NSQF ladder SVG builder and Trade Explorer
- [x] Unit tests for confidence rules, fallback, and NSQF ladder

### Phase 4: Private windows, PIN rooms and consent ledger

- [x] Student and Parent private windows with voluntary mapping questions (PrivateWindowPage, PinLockModal, concern CRUD with category tags)
- [x] PIN security — bcrypt-hashed PINs, 3-attempt lockout with 15-min ban (HTTP 423), in-session unlock via Zustand store, first-time PIN setup flow, shake-on-error animation, Lock button to manually re-lock
- [x] Hash-chained digital consent ledger — SHA-256 blockHash/previousHash/payloadHash, verify endpoint, ConsentLedgerPage with integrity banner and expandable block cards
- [x] Bhavishya Engine — synthesises shared concerns from both windows with verified regional trade/NSQF data into structured Joint Room agenda (JointRoomPage)
- [x] Pre/post concern score tracking — `preScore`/`postScore` fields on Concern model, ScorePill UI, updateScore endpoint
- [x] Privacy and share isolation — `isShared: false` default, repository-level filtering, share toggle endpoint

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
- Ambiguity Resolution (Phase 4): Idle auto-lock implemented as an explicit "Lock" button (user-initiated) rather than a timer, because timer-based locking during an active counselling session was found to be disruptive. The Zustand `isUnlocked` flag resets on page unload naturally. Picture-pattern PIN deferred to Phase 8 (low-literacy UX pass); numpad dial chosen for Phase 4 as it works across all input methods and screen sizes.
