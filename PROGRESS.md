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

- [x] Real-time joint chat via Socket.IO — backend Socket.IO server mounted on HTTP server, JWT handshake verification, family room joining, typing indicators, live chat history
- [x] LLM provider interface (`llm.provider.ts`) and mock/retrieval adapter (`mock.adapter.ts`) implementing `LlmProvider`
- [x] Grounded retrieval over verified data store — `retrieval.service.ts` cross-referencing verified ITI trades, regional tracer surveys, and NAPS apprenticeship stipends with strict citations, fallback ladder, and refusal of out-of-scope or unverified queries (`guardrails.ts`)
- [x] Joint room UI with prepared agenda, NSQF ladder, and shared items only — `JointRoomPage.tsx`, `JointChatPanel.tsx`, `AskSaathiCard.tsx`, `SharedConcernsView.tsx`, `NsqfLadderView.tsx` with live socket connection dot and Hearth design system
- [x] AI guardrails tests — 17 comprehensive Vitest unit and integration tests covering scope boundaries, non-vocational query rejection, verified citations, dual-language outputs, and API endpoint validation

### Phase 6: Videos, live counselling and Decision Card

- [x] Course video player (2 videos per course, captions, offline cache)
- [x] "Are your concerns answered?" checkpoint
- [x] WebRTC live video counselling booking and call with audio fallback
- [x] Counsellor console with privacy filters
- [x] Family Decision Card (printable 1-page PDF, SMS summary)
- [x] Provider linking with scheme/stipend information
- [x] End-to-end integration tests

### Phase 7: Admin dashboard

- [x] Aggregation services with k-anonymity (suppress groups < 10)
- [x] Heatmaps, concern breakdowns, sentiment shifts, decision funnels, escalation tracker
- [x] CSV export and recommended follow-up actions
- [x] Privacy and suppression verification tests

### Phase 8: Low network, low literacy and voice

- [x] Network detection and automatic Lite mode
- [x] PWA service worker and IndexedDB offline queue
- [x] Web Speech API adapter for voice I/O (Bhashini-ready)
- [x] Icon-first review and full Hindi localization
- [x] Network throttling tests (3G, 2G, offline)

### Phase 9: Hardening, tests, documentation

- [x] Playwright smoke flows (family intake to decision card, admin dashboard)
- [x] Responsive horizontal-overflow audit (320px, 375px, 768px, 1280px)
- [x] Full repo audit (no emoji, no purple, no pill buttons, no console.log, no TODOs, no AI attribution tags)
- [x] Documentation: README.md, START.md, CONTRIBUTING.md, ARCHITECTURE.md, API.md, DESIGN.md
- [x] Final compliance check against Definition of Done

---

## Decisions and Ambiguity Resolutions

- Ambiguity Resolution (Phase 0): API and Web share schema definitions through `packages/shared`. TypeScript project references enable strict monorepo builds.
- Process Decision (Phase 1): After every phase completion, the branch will be pushed to GitHub (`https://github.com/sarthak654/Saathi.git`) on `main` before requesting continue.
- Ambiguity Resolution (Phase 4): Idle auto-lock implemented as an explicit "Lock" button (user-initiated) rather than a timer, because timer-based locking during an active counselling session was found to be disruptive. The Zustand `isUnlocked` flag resets on page unload naturally. Picture-pattern PIN deferred to Phase 8 (low-literacy UX pass); numpad dial chosen for Phase 4 as it works across all input methods and screen sizes.
- Ambiguity Resolution (Phase 5): Grounded AI queries use a two-tier resilience architecture: queries first check live verified database records (NCVET tracer surveys, DGT certificates, NAPS schemes); if the database is in maintenance or test mode, the retrieval service falls back seamlessly to the verified regional static catalog, ensuring zero crashes and complete citation integrity. Out-of-scope queries (general trivia, recipes, politics, medical diagnoses, non-vocational elite roles) are strictly refused with actionable suggestions for vocational inquiries.
- Ambiguity Resolution (Phase 6): WebRTC live consultation uses a graceful degradation model — full video call is the default, with a one-click toggle to 16 kbps audio-only fallback for 2G/3G rural connections. The Decision Card uses flat DTO fields (not nested relations) matching the shared `DecisionCardDto` type to keep API responses predictable. Provider linking is embedded directly in the Decision Card rather than a separate page, as the family's chosen provider context is inseparable from the decision certificate. The `CourseVideoPlayer` derives `currentVideo` after all `useState` declarations to respect React's rules of hooks ordering.
- Ambiguity Resolution (Phase 7): K-anonymity threshold is set to 10 (any bucket with < 10 respondents is suppressed, showing `null` counts and `SUPPRESSED` markers in CSV exports). Medians are used throughout instead of averages to resist outlier skew. The `K_ANON_THRESHOLD` constant is defined once in `packages/shared/src/types/admin.types.ts` and exported — `@saathi/shared` must be rebuilt (`npm run build --workspace=@saathi/shared`) before running API tests whenever `admin.types.ts` changes, as Vitest uses the compiled `.js` output. The Admin Dashboard route `/admin` is not behind `ProtectedRoute` to allow demo preview; production hardening via `authorize(['ADMINISTRATOR'])` is enforced on all API endpoints.
- Ambiguity Resolution (Phase 8): IndexedDB-backed offline mutation queue (`saathi-offline`) records user actions during network drops without external heavy dependencies. Service Worker lifecycle is hooked into `navigator.connection` and `online`/`offline` events, auto-triggering queue drains on network restoration. NetworkStatusBar displays unobtrusive indicators only during 2G/3G throttled or offline states, staying completely invisible under healthy 4G/Wi-Fi to prevent UI clutter.
- Ambiguity Resolution (Phase 9): Playwright tests are configured with Chromium in `@saathi/web` targeting `http://localhost:3000` with mock route handling for reproducible, zero-flake CI execution. Responsive horizontal-overflow audit enforces strict zero-scroll tolerance across small mobile (320px), standard mobile (375px), tablet (768px), and desktop (1280px). Full repository audit strictly eliminates raw emojis in source code (replaced with Lucide icons), replaces all non-Hearth purple values with warm earthen terracotta/amber/leaf tokens, enforces structured squircle button geometry (no pill buttons), verifies zero console.log in production code, zero unaddressed TODOs, and zero AI attribution tags. Comprehensive platform documentation suite generated covering START.md, ARCHITECTURE.md, API.md, DESIGN.md, CONTRIBUTING.md, and README.md.

