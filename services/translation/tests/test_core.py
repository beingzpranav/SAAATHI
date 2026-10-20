"""Tests for translation cache, language registry, and schemas."""
from __future__ import annotations
import pytest
from app.cache import cache_get, cache_set, TranslationCache
from app.language_registry import is_supported_lang, is_supported_pair, is_supported_lang
from app.schemas import TranslateRequest


# ─── Cache Tests ─────────────────────────────────────────────────────────────

def test_cache_miss_returns_none():
    assert cache_get("hello world", "en", "hi", "app_ui") is None


def test_cache_set_and_get():
    cache_set("hello", "en", "hi", "app_ui", "नमस्ते")
    assert cache_get("hello", "en", "hi", "app_ui") == "नमस्ते"


def test_cache_key_is_specific():
    cache_set("test", "en", "hi", "app_ui", "A")
    cache_set("test", "en", "bn", "app_ui", "B")
    assert cache_get("test", "en", "hi", "app_ui") == "A"
    assert cache_get("test", "en", "bn", "app_ui") == "B"


def test_cache_context_differentiates_keys():
    cache_set("hello", "en", "ta", "app_ui", "UI-val")
    cache_set("hello", "en", "ta", "message", "MSG-val")
    assert cache_get("hello", "en", "ta", "app_ui") == "UI-val"
    assert cache_get("hello", "en", "ta", "message") == "MSG-val"


def test_cache_lru_eviction():
    small = TranslationCache(max_entries=3)
    small.set(small.make_key("a", "en", "hi", "app_ui"), "A", "app_ui")
    small.set(small.make_key("b", "en", "hi", "app_ui"), "B", "app_ui")
    small.set(small.make_key("c", "en", "hi", "app_ui"), "C", "app_ui")
    small.set(small.make_key("d", "en", "hi", "app_ui"), "D", "app_ui")  # evicts a
    assert small.get(small.make_key("a", "en", "hi", "app_ui")) is None
    assert small.get(small.make_key("d", "en", "hi", "app_ui")) == "D"


# ─── Language Registry Tests ──────────────────────────────────────────────────

@pytest.mark.parametrize("code", ["en", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml"])
def test_all_supported_languages_exist(code: str):
    assert is_supported_lang(code)


def test_unsupported_language():
    assert not is_supported_lang("xx")
    assert not is_supported_lang("zz")


@pytest.mark.parametrize("src,tgt", [
    ("en", "hi"), ("hi", "en"),
    ("en", "bn"), ("en", "ta"),
    ("en", "te"), ("en", "mr"),
])
def test_supported_pairs(src: str, tgt: str):
    assert is_supported_pair(src, tgt)


def test_same_language_is_always_supported():
    assert is_supported_pair("en", "en")
    assert is_supported_pair("hi", "hi")


def test_unsupported_pair():
    assert not is_supported_pair("xx", "hi")


# ─── Schema Validation Tests ──────────────────────────────────────────────────

def test_valid_translate_request():
    req = TranslateRequest(
        texts=["Hello", "World"],
        sourceLanguage="en",
        targetLanguage="hi",
        context="app_ui",
    )
    assert len(req.texts) == 2


def test_invalid_context_rejected():
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        TranslateRequest(
            texts=["Hello"],
            sourceLanguage="en",
            targetLanguage="hi",
            context="invalid_context",
        )


def test_unsupported_language_rejected():
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        TranslateRequest(
            texts=["Hello"],
            sourceLanguage="xx",
            targetLanguage="hi",
            context="app_ui",
        )


def test_empty_texts_rejected():
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        TranslateRequest(
            texts=[],
            sourceLanguage="en",
            targetLanguage="hi",
            context="app_ui",
        )


def test_text_too_long_rejected():
    import pydantic
    with pytest.raises(pydantic.ValidationError):
        TranslateRequest(
            texts=["x" * 2001],
            sourceLanguage="en",
            targetLanguage="hi",
            context="app_ui",
        )
