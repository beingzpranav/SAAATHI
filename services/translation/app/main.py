"""FastAPI application — SAATHI internal translation service."""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

from .engine import LibreTranslateProvider
from .schemas import TranslateRequest, TranslateResponse, HealthResponse
from .language_registry import SUPPORTED_LANGUAGES, get_languages_response
from .cache import cache_stats
from .errors import TranslationError

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

LIBRETRANSLATE_URL = os.getenv("LIBRETRANSLATE_URL", "http://localhost:5000")
LIBRETRANSLATE_API_KEY = os.getenv("LIBRETRANSLATE_API_KEY")  # optional
INTERNAL_SECRET = os.getenv("TRANSLATION_INTERNAL_SECRET", "")

provider = LibreTranslateProvider(
    base_url=LIBRETRANSLATE_URL,
    api_key=LIBRETRANSLATE_API_KEY,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Translation service starting. Engine: %s", LIBRETRANSLATE_URL)
    healthy = await provider.health_check()
    if not healthy:
        logger.warning("LibreTranslate engine not reachable at startup — will retry per request")
    else:
        logger.info("LibreTranslate engine reachable OK")
    yield
    await provider.close()
    logger.info("Translation service shut down")


app = FastAPI(
    title="SAATHI Translation Service",
    description="Internal self-hosted translation microservice powered by LibreTranslate",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url=None,
)


def _check_internal_secret(request: Request) -> None:
    """Simple shared-secret auth for internal network calls from Express."""
    if not INTERNAL_SECRET:
        return  # No secret configured — open in dev
    secret = request.headers.get("X-Internal-Secret", "")
    if secret != INTERNAL_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.exception_handler(TranslationError)
async def translation_error_handler(_: Request, exc: TranslationError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": str(exc), "code": type(exc).__name__},
    )


@app.post("/translate", response_model=TranslateResponse)
async def translate(body: TranslateRequest, request: Request) -> TranslateResponse:
    _check_internal_secret(request)
    translations = await provider.translate_batch(
        texts=body.texts,
        source_lang=body.sourceLanguage,
        target_lang=body.targetLanguage,
        context=body.context,
    )
    return TranslateResponse(
        translations=translations,
        sourceLanguage=body.sourceLanguage,
        targetLanguage=body.targetLanguage,
    )


@app.get("/languages")
async def languages() -> dict:
    return get_languages_response()


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    healthy = await provider.health_check()
    stats = cache_stats()
    return HealthResponse(
        status="healthy" if healthy else "degraded",
        engine="LibreTranslate/Argos",
        engineUrl=LIBRETRANSLATE_URL if os.getenv("NODE_ENV") != "production" else None,
        supportedLanguages=len(SUPPORTED_LANGUAGES),
    )


@app.get("/cache/stats")
async def cache_status(request: Request) -> dict:
    _check_internal_secret(request)
    return cache_stats()
