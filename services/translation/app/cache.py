"""
Translation cache — bounded TTL-aware in-memory cache.
Uses stable hash key: sha256(source_text + "|" + src_lang + "|" + tgt_lang + "|" + context).
"""
from __future__ import annotations
import hashlib
import time
import threading
from collections import OrderedDict

# TTLs per context type (seconds)
_TTL: dict[str, int] = {
    "app_ui": 86400 * 7,      # 7 days — UI strings rarely change
    "message": 3600,           # 1 hour — conversation messages
    "notification": 3600,
    "generated": 1800,         # 30 min — AI-generated content
}
_DEFAULT_TTL = 3600
_MAX_ENTRIES = 10_000          # bounded eviction via LRU


class _Entry:
    __slots__ = ("value", "expires_at")
    def __init__(self, value: str, ttl: int):
        self.value = value
        self.expires_at = time.monotonic() + ttl


class TranslationCache:
    def __init__(self, max_entries: int = _MAX_ENTRIES):
        self._store: OrderedDict[str, _Entry] = OrderedDict()
        self._max = max_entries
        self._lock = threading.Lock()

    @staticmethod
    def make_key(text: str, src: str, tgt: str, ctx: str) -> str:
        raw = f"{text}\x00{src}\x00{tgt}\x00{ctx}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def get(self, key: str) -> str | None:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            if time.monotonic() > entry.expires_at:
                del self._store[key]
                return None
            # Move to end (LRU)
            self._store.move_to_end(key)
            return entry.value

    def set(self, key: str, value: str, context: str = "app_ui") -> None:
        ttl = _TTL.get(context, _DEFAULT_TTL)
        with self._lock:
            if key in self._store:
                self._store.move_to_end(key)
            else:
                if len(self._store) >= self._max:
                    self._store.popitem(last=False)  # evict oldest
            self._store[key] = _Entry(value, ttl)

    def stats(self) -> dict:
        with self._lock:
            return {"entries": len(self._store), "max": self._max}


# Module-level singleton
_cache = TranslationCache()


def cache_get(text: str, src: str, tgt: str, ctx: str) -> str | None:
    key = TranslationCache.make_key(text, src, tgt, ctx)
    return _cache.get(key)


def cache_set(text: str, src: str, tgt: str, ctx: str, translation: str) -> None:
    key = TranslationCache.make_key(text, src, tgt, ctx)
    _cache.set(key, translation, context=ctx)


def cache_stats() -> dict:
    return _cache.stats()
