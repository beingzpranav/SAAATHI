# SAATHI Translation Service

Internal FastAPI microservice that proxies to **LibreTranslate** (self-hosted Argos Translate engine).

## Architecture

```
Browser → Vite/React
         → Express API  /api/v1/translate  (authenticates, rate-limits, strips secrets)
         → FastAPI       :8000/translate   (internal network only, caches, batches)
         → LibreTranslate :5000/translate  (Argos Translate models)
```

## Supported Languages

| Code | Language  | Script      |
|------|-----------|-------------|
| en   | English   | Latin       |
| hi   | Hindi     | Devanagari  |
| bn   | Bengali   | Bengali     |
| ta   | Tamil     | Tamil       |
| te   | Telugu    | Telugu      |
| mr   | Marathi   | Devanagari  |
| gu   | Gujarati  | Gujarati    |
| kn   | Kannada   | Kannada     |
| ml   | Malayalam | Malayalam   |

> **Note**: Language pair availability depends on which Argos Translate models are installed in LibreTranslate.
> Cross-language pairs (e.g., hi→ta) are pivoted through English automatically.

## Quick Start

### 1. Start all services with Docker Compose (from repo root)

```bash
docker compose up -d
```

This starts:
- `postgres` — database
- `libretranslate` — translation engine on port 5000
- `translation-api` — FastAPI service on port 8000

### 2. Run locally (dev, no Docker)

```bash
# Install Python deps
cd services/translation
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Start LibreTranslate separately (Docker required for models):
docker run -p 5000:5000 libretranslate/libretranslate

# Start FastAPI
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `LIBRETRANSLATE_URL` | `http://localhost:5000` | LibreTranslate endpoint |
| `LIBRETRANSLATE_API_KEY` | _(empty)_ | Optional API key for LibreTranslate |
| `TRANSLATION_INTERNAL_SECRET` | _(empty)_ | Shared secret from Express to FastAPI |
| `LOG_LEVEL` | `INFO` | Logging level |

## API Endpoints

### `POST /translate`
Batch translation.

**Request:**
```json
{
  "texts": ["Hello", "Welcome"],
  "sourceLanguage": "en",
  "targetLanguage": "hi",
  "context": "app_ui"
}
```

**Response:**
```json
{
  "translations": ["नमस्ते", "स्वागत है"],
  "sourceLanguage": "en",
  "targetLanguage": "hi",
  "cached": false
}
```

### `GET /languages`
Returns all supported languages and pairs.

### `GET /health`
Readiness/liveness check.

## Caching Strategy

| Context | TTL |
|---|---|
| app_ui | 7 days |
| message | 1 hour |
| notification | 1 hour |
| generated | 30 minutes |

Cache is bounded at 10,000 entries (LRU eviction). Keys are `sha256(text + src + tgt + context)`.

## Tests

```bash
pytest tests/ -v
```

## Known Limitations

- In-memory cache is lost on service restart (use Redis in production).
- Cross-language pairs depend on LibreTranslate pivot support.
- Model quality for Indic scripts varies — Devanagari (hi, mr) tends to be best.
- LibreTranslate requires downloading Argos models on first run (network required).
