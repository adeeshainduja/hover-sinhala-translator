from __future__ import annotations

import html

import httpx

from app.core.config import Settings
from app.core.exceptions import TranslationProviderError
from app.providers.base import TranslationProvider


class GoogleCloudTranslationProvider(TranslationProvider):
    def __init__(self, settings: Settings, client: httpx.AsyncClient | None = None) -> None:
        self._settings = settings
        self._client = client

    async def translate(self, word: str, source_language: str, target_language: str) -> str | None:
        if not self._settings.translation_api_key:
            raise TranslationProviderError("Translation API key is missing.", "config")

        params = {
            "key": self._settings.translation_api_key,
            "q": word,
            "source": source_language,
            "target": target_language,
            "format": "text",
        }

        timeout = httpx.Timeout(self._settings.translation_timeout)
        close_client = self._client is None
        client = self._client or httpx.AsyncClient(timeout=timeout)
        try:
            response = await client.post(self._settings.translation_api_url, params=params)
        except httpx.TimeoutException as exc:
            raise TranslationProviderError("Translation service unavailable.", "timeout") from exc
        except httpx.RequestError as exc:
            raise TranslationProviderError("Translation service unavailable.", "network") from exc
        finally:
            if close_client:
                await client.aclose()

        if response.status_code in {401, 403}:
            raise TranslationProviderError("Invalid translation credentials.", "config", response.status_code)
        if response.status_code == 429:
            raise TranslationProviderError("Translation rate limit exceeded.", "rate_limit", response.status_code)
        if response.status_code >= 500:
            raise TranslationProviderError("Translation provider error.", "upstream", response.status_code)
        if response.status_code == 404:
            return None
        if response.status_code >= 400:
            raise TranslationProviderError("Translation request was rejected.", "request", response.status_code)

        try:
            payload = response.json()
        except ValueError as exc:
            raise TranslationProviderError("Malformed translation provider response.", "parse") from exc

        translations = payload.get("data", {}).get("translations", [])
        if not translations:
            return None

        translated_text = translations[0].get("translatedText")
        if not isinstance(translated_text, str):
            raise TranslationProviderError("Malformed translation provider response.", "parse")

        return html.unescape(translated_text)
