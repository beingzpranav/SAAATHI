# SAATHI REST API Specification

This document provides the complete API specification for the **SAATHI (साथी)** backend services (`apps/api`).

- **Base URL**: `http://localhost:4000/api/v1`
- **Protocols**: HTTP/1.1, WebSocket (Socket.io on port 4000)
- **Content Type**: `application/json`

---

## 1. Standard Response Envelope

All API endpoints return a standardized JSON envelope to guarantee predictable client-side consumption:

### Success Response (`200 OK`, `201 Created`):
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-16T03:00:00.000Z",
    "requestId": "1d4bec1a-46a3-4395-acab-a643ed4f5f3c"
  }
}
```

### Error Response (`400`, `401`, `403`, `404`, `409`, `422`, `500`):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "statusCode": 422,
    "details": [
      {
        "field": "parentConsentGiven",
        "message": "Parental consent is mandatory for learners under 18 years of age"
      }
    ],
    "requestId": "f233ffed-d6ce-4051-815b-ed6a026622c4"
  }
}
```

---

## 2. Authentication & Authorization

Authentication uses signed HTTP-only cookies containing JWT tokens or `Authorization: Bearer <token>` headers.

### User Roles:
- **`LEARNER`**: Access to Student Window, Trade Explorer, Joint Room, and Decision Card.
- **`PARENT`**: Access to Parent Window, Consent Ledger, Joint Room, and Decision Card.
- **`COUNSELLOR`**: Access to Counsellor Console, active video/audio consultation rooms, and queue management.
- **`ADMINISTRATOR`**: Access to state/district Admin Dashboard, k-anonymity reports, and CSV exports.

---

## 3. Endpoints by Domain

### A. Authentication (`/api/v1/auth`)

#### `POST /auth/register`
Creates a new household account and family user profile.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "learner@saathi.gov.in",
    "password": "Password123!",
    "name": "Aarav Sharma",
    "role": "LEARNER",
    "age": 17,
    "parentConsentGiven": true,
    "district": "Varanasi",
    "state": "Uttar Pradesh"
  }
  ```
- **Response**: `201 Created` with UserProfile and AuthToken.

#### `POST /auth/login`
Authenticates a user using email and password.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "learner@saathi.demo",
    "password": "Password123!"
  }
  ```
- **Response**: `200 OK` with UserProfile and sets auth session cookie.

#### `GET /auth/me`
Fetches the currently authenticated session user profile.
- **Access**: Authenticated (`LEARNER`, `PARENT`, `COUNSELLOR`, `ADMINISTRATOR`)
- **Response**: `200 OK` with `{ data: { user: UserProfile } }`.

#### `POST /auth/logout`
Terminates the session and clears cookies.
- **Access**: Authenticated
- **Response**: `200 OK`

---

### B. Household & Intake (`/api/v1/households`)

#### `POST /households/intake`
Submits baseline household vocational intake survey.
- **Access**: `LEARNER` or `PARENT`
- **Request Body**:
  ```json
  {
    "studentClassLevel": "CLASS_10",
    "academicStream": "GENERAL",
    "state": "Uttar Pradesh",
    "district": "Varanasi",
    "block": "Kashi Vidyapeeth",
    "incomeBand": "BELOW_1_LAKH",
    "socialCategory": "OBC",
    "parentOccupation": "FARMING",
    "priorVocationalExposure": false
  }
  ```
- **Response**: `201 Created` with `{ data: HouseholdIntakeDto }`.

#### `GET /households/my`
Retrieves the logged-in user's household profile and localized cost framing.
- **Access**: Authenticated family member
- **Response**: `200 OK` with `{ data: HouseholdSummary }`.

#### `GET /households/consent-ledger`
Retrieves transparent disclosure records showing what items have been shared to the Joint Room.
- **Access**: `LEARNER` or `PARENT`
- **Response**: `200 OK` with `{ data: ConsentLedgerDto }`.

---

### C. Trades & Verified Outcomes (`/api/v1/trades`)

#### `GET /trades`
Lists all available vocational trades filtered by sector, minimum education, or duration.
- **Access**: Public
- **Query Parameters**:
  - `sector` (optional string): e.g. `Electrical`, `Solar`, `Automotive`
  - `minEducation` (optional string): `CLASS_8`, `CLASS_10`, `CLASS_12`
- **Response**: `200 OK` with `{ data: TradeSummary[] }`.

#### `GET /trades/:code`
Fetches detailed syllabus, NSQF career progression ladder, and training providers for a specific trade.
- **Access**: Public
- **Response**: `200 OK` with `{ data: TradeDetailDto }`.

#### `GET /trades/:code/outcomes`
Retrieves regional tracer survey metrics with confidence grading (High, Medium, Low, Fallback).
- **Access**: Public
- **Query Parameters**: `state`, `district`, `block`
- **Response**: `200 OK` with `{ data: VerifiedOutcomeResponse }`.

---

### D. Joint Room & Bhavishya Engine (`/api/v1/joint-room`)

#### `GET /joint-room/agenda`
Synthesizes the collaborative family agenda comparing student hopes and parental worries.
- **Access**: `LEARNER` or `PARENT`
- **Response**: `200 OK` with `{ data: BhavishyaAgendaDto }`.

#### `POST /joint-room/checkpoint`
Evaluates the family's dynamic readiness score based on interactive slider adjustments.
- **Access**: `LEARNER` or `PARENT`
- **Request Body**:
  ```json
  {
    "evaluations": [
      { "concernId": "c1", "resolved": true, "mitigationScore": 4 },
      { "concernId": "c2", "resolved": false, "mitigationScore": 2 }
    ]
  }
  ```
- **Response**: `200 OK` with `{ data: CheckpointEvaluationResponse }` including `readinessScore` and `readyForDecisionCard: boolean`.

---

### E. Grounded AI Guardrail Engine (`/api/v1/ai`)

#### `POST /ai/query`
Processes vocational inquiries with strict anti-hallucination citations. Non-vocational inquiries are rejected.
- **Access**: Authenticated family member
- **Request Body**:
  ```json
  {
    "query": "What are the job prospects and salary for Electrician trade in Varanasi?",
    "language": "hi",
    "householdContext": { "district": "Varanasi", "incomeBand": "BELOW_1_LAKH" }
  }
  ```
- **Response**: `200 OK` with `{ data: GroundedAiResponse }` containing dual-language verified answers and NCVET survey citations.

---

### F. Human Counsellor & Decision Card (`/api/v1/counselling`, `/api/v1/decision-card`)

#### `POST /counselling/bookings`
Schedules a 1-on-1 live consultation with a certified government counsellor.
- **Access**: Authenticated family member
- **Request Body**:
  ```json
  {
    "preferredDate": "2026-10-20T10:00:00.000Z",
    "mode": "VIDEO",
    "primaryConcern": "FINANCIAL_WORRY"
  }
  ```
- **Response**: `201 Created` with Booking confirmation.

#### `GET /decision-card/my`
Retrieves or generates the tamper-evident Family Decision Card.
- **Access**: `LEARNER` or `PARENT` (Unlocks when Readiness Score $\ge 70\%$)
- **Response**: `200 OK` with `{ data: DecisionCardDto }` containing `sessionIntegrityHash` (SHA-256).

#### `GET /decision-card/sms-summary`
Generates a lightweight bilingual SMS summary formatted for rural feature phones.
- **Access**: Authenticated family member
- **Response**: `200 OK` with `{ data: { enText: string, hiText: string } }`.

---

### G. Admin Policy & Intelligence (`/api/v1/admin`)

#### `GET /admin/dashboard`
Fetches district-level aggregated metrics, concern shifts, and decision funnels with privacy suppression ($k \ge 10$).
- **Access**: `ADMINISTRATOR`
- **Response**: `200 OK` with `{ data: AdminDashboardDto }`.

#### `GET /admin/export`
Exports aggregated vocational policy metrics as CSV format with `SUPPRESSED` indicators on small cohorts.
- **Access**: `ADMINISTRATOR`
- **Response**: `200 OK` with `text/csv` attachment.
