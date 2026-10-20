"""Custom error types."""
from __future__ import annotations


class TranslationError(Exception):
    """Raised when a translation request fails."""
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


class EngineUnavailableError(TranslationError):
    """Raised when the upstream engine is unreachable."""
    def __init__(self, engine_url: str):
        super().__init__(f"Translation engine unavailable at {engine_url}", status_code=503)


class UnsupportedLanguagePairError(TranslationError):
    """Raised for unsupported language pairs."""
    def __init__(self, source: str, target: str):
        super().__init__(f"Language pair not supported: {source} -> {target}", status_code=422)
