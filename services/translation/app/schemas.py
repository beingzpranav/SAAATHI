"""Pydantic schemas for request/response validation."""
from __future__ import annotations
from pydantic import BaseModel, Field, field_validator, model_validator
from .language_registry import (
    CONTEXT_TYPES, MAX_TEXTS_PER_BATCH, MAX_TEXT_LENGTH, MAX_TOTAL_CHARS,
    is_supported_lang, is_supported_pair,
)


class TranslateRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1, max_length=MAX_TEXTS_PER_BATCH)
    sourceLanguage: str = Field(..., pattern=r"^[a-z]{2,3}$")
    targetLanguage: str = Field(..., pattern=r"^[a-z]{2,3}$")
    context: str = Field("app_ui")

    @field_validator("texts")
    @classmethod
    def validate_texts(cls, v: list[str]) -> list[str]:
        for i, text in enumerate(v):
            if len(text) > MAX_TEXT_LENGTH:
                raise ValueError(f"Text at index {i} exceeds {MAX_TEXT_LENGTH} chars")
        total = sum(len(t) for t in v)
        if total > MAX_TOTAL_CHARS:
            raise ValueError(f"Total chars {total} exceeds limit {MAX_TOTAL_CHARS}")
        return v

    @field_validator("context")
    @classmethod
    def validate_context(cls, v: str) -> str:
        if v not in CONTEXT_TYPES:
            raise ValueError(f"context must be one of {sorted(CONTEXT_TYPES)}")
        return v

    @model_validator(mode="after")
    def validate_language_pair(self) -> "TranslateRequest":
        if not is_supported_lang(self.sourceLanguage):
            raise ValueError(f"Unsupported source language: {self.sourceLanguage}")
        if not is_supported_lang(self.targetLanguage):
            raise ValueError(f"Unsupported target language: {self.targetLanguage}")
        if not is_supported_pair(self.sourceLanguage, self.targetLanguage):
            raise ValueError(
                f"Unsupported language pair: {self.sourceLanguage} -> {self.targetLanguage}"
            )
        return self


class TranslateResponse(BaseModel):
    translations: list[str]
    sourceLanguage: str
    targetLanguage: str
    cached: bool = False


class HealthResponse(BaseModel):
    status: str
    engine: str
    engineUrl: str | None = None
    supportedLanguages: int
