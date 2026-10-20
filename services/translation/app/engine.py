"""
LibreTranslate engine provider.

LibreTranslate is a self-hosted machine translation API powered by Argos Translate.
It runs locally in Docker (see docker-compose.yml) and exposes a REST API.

Language pair support is verified at startup against the /languages endpoint.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Protocol

import httpx
from tenacity import (
    retry, stop_after_attempt, wait_exponential, retry_if_exception_type
)

from .errors import TranslationError, EngineUnavailableError
from .cache import cache_get, cache_set

logger = logging.getLogger(__name__)

# Maximum concurrent requests to the engine
_SEMAPHORE_LIMIT = 10


class TranslationProvider(Protocol):
    """Interface all translation providers must implement."""
    async def translate_batch(
        self,
        texts: list[str],
        source_lang: str,
        target_lang: str,
        context: str,
    ) -> list[str]: ...

    async def health_check(self) -> bool: ...


class LibreTranslateProvider:
    """
    Adapter for the LibreTranslate REST API.
    Translates batches by sending individual requests with bounded concurrency.
    Results are cached per-text before returning.
    """

    def __init__(self, base_url: str, api_key: str | None = None, timeout: float = 15.0):
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._timeout = timeout
        self._semaphore = asyncio.Semaphore(_SEMAPHORE_LIMIT)
        self._client: httpx.AsyncClient | None = None

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=self._timeout)
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    @retry(
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
        reraise=True,
    )
    async def _translate_one(self, text: str, src: str, tgt: str) -> str:
        """Translate a single string via LibreTranslate /translate endpoint."""
        if not text.strip():
            return text

        payload: dict = {"q": text, "source": src, "target": tgt, "format": "text"}
        if self._api_key:
            payload["api_key"] = self._api_key

        async with self._semaphore:
            try:
                resp = await self._get_client().post(
                    f"{self._base_url}/translate",
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("translatedText", text)
            except httpx.TimeoutException:
                logger.warning("LibreTranslate timeout for %s->%s", src, tgt)
                raise
            except httpx.HTTPStatusError as exc:
                logger.error("LibreTranslate HTTP %s: %s", exc.response.status_code, exc.response.text[:200])
                raise TranslationError(
                    f"Engine returned {exc.response.status_code}", exc.response.status_code
                )
            except httpx.NetworkError:
                raise EngineUnavailableError(self._base_url)

    async def translate_batch(
        self,
        texts: list[str],
        source_lang: str,
        target_lang: str,
        context: str,
    ) -> list[str]:
        """
        Translate a batch, using cache for hits and concurrent requests for misses.
        Falls back to original text on per-item failure.
        """
        if source_lang == target_lang:
            return texts[:]

        results: list[str] = [""] * len(texts)
        miss_indices: list[int] = []

        # Cache check
        for i, text in enumerate(texts):
            cached = cache_get(text, source_lang, target_lang, context)
            if cached is not None:
                results[i] = cached
            else:
                miss_indices.append(i)

        if not miss_indices:
            return results

        # Translate misses concurrently
        async def _safe_translate(idx: int, text: str) -> tuple[int, str]:
            try:
                translated = await self._translate_one(text, source_lang, target_lang)
                cache_set(text, source_lang, target_lang, context, translated)
                return idx, translated
            except Exception:
                logger.warning("Translation failed for index %d; using original", idx)
                return idx, text  # graceful fallback

        tasks = [
            _safe_translate(i, texts[i])
            for i in miss_indices
        ]
        for idx, translation in await asyncio.gather(*tasks):
            results[idx] = translation

        return results

    async def health_check(self) -> bool:
        try:
            resp = await self._get_client().get(
                f"{self._base_url}/languages", timeout=5.0
            )
            return resp.status_code == 200
        except Exception:
            return False
