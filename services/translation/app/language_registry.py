"""
Language registry — single source of truth for supported languages & pairs.
Verified against LibreTranslate's built-in Argos Translate models.
"""
from __future__ import annotations

# ISO 639-1 codes → display names (English + native script)
SUPPORTED_LANGUAGES: dict[str, dict[str, str]] = {
    "en": {"name": "English",    "native": "English",       "script": "Latin"},
    "hi": {"name": "Hindi",      "native": "हिन्दी",         "script": "Devanagari"},
    "bn": {"name": "Bengali",    "native": "বাংলা",          "script": "Bengali"},
    "ta": {"name": "Tamil",      "native": "தமிழ்",          "script": "Tamil"},
    "te": {"name": "Telugu",     "native": "తెలుగు",         "script": "Telugu"},
    "mr": {"name": "Marathi",    "native": "मराठी",          "script": "Devanagari"},
    "gu": {"name": "Gujarati",   "native": "ગુજરાતી",        "script": "Gujarati"},
    "kn": {"name": "Kannada",    "native": "ಕನ್ನಡ",          "script": "Kannada"},
    "ml": {"name": "Malayalam",  "native": "മലയാളം",         "script": "Malayalam"},
}

# Language pairs supported by LibreTranslate (Argos models go through "en" as pivot)
# LibreTranslate supports: en<->hi, en<->bn, en<->ta, en<->te, en<->mr, en<->gu, en<->kn, en<->ml
# Non-English pairs are pivoted through English automatically by LibreTranslate.
SUPPORTED_PAIRS: set[tuple[str, str]] = {
    ("en", "hi"), ("hi", "en"),
    ("en", "bn"), ("bn", "en"),
    ("en", "ta"), ("ta", "en"),
    ("en", "te"), ("te", "en"),
    ("en", "mr"), ("mr", "en"),
    ("en", "gu"), ("gu", "en"),
    ("en", "kn"), ("kn", "en"),
    ("en", "ml"), ("ml", "en"),
    # Cross-language pairs are routed via en pivot by LibreTranslate
    ("hi", "bn"), ("hi", "ta"), ("hi", "te"), ("hi", "mr"),
    ("hi", "gu"), ("hi", "kn"), ("hi", "ml"),
    ("bn", "hi"), ("ta", "hi"), ("te", "hi"), ("mr", "hi"),
    ("gu", "hi"), ("kn", "hi"), ("ml", "hi"),
}

CONTEXT_TYPES: frozenset[str] = frozenset({"app_ui", "message", "notification", "generated"})
MAX_TEXTS_PER_BATCH = 50
MAX_TEXT_LENGTH = 2000
MAX_TOTAL_CHARS = 20_000


def is_supported_lang(code: str) -> bool:
    return code in SUPPORTED_LANGUAGES


def is_supported_pair(source: str, target: str) -> bool:
    if source == target:
        return True          # no-op translation
    return (source, target) in SUPPORTED_PAIRS


def get_languages_response() -> dict:
    return {
        "languages": [
            {
                "code": code,
                "name": meta["name"],
                "native": meta["native"],
                "script": meta["script"],
            }
            for code, meta in SUPPORTED_LANGUAGES.items()
        ],
        "supportedPairs": [
            {"source": src, "target": tgt}
            for src, tgt in sorted(SUPPORTED_PAIRS)
        ],
    }
