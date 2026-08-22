from __future__ import annotations

import asyncio
from dataclasses import dataclass

from app.cache.translation_cache import TranslationCache
from app.core.config import Settings
from app.providers.base import TranslationProvider
from app.schemas.translation import TranslateResponse


@dataclass(frozen=True)
class TranslationCacheResult:
    word: str
    translation: str
    source_language: str
    target_language: str


class TranslationService:
    def __init__(self, provider: TranslationProvider, settings: Settings | None = None) -> None:
        self._provider = provider
        self._settings = settings or Settings()
        self._cache = TranslationCache(
            enabled=self._settings.translation_cache_enabled,
            ttl_seconds=self._settings.translation_cache_ttl,
            max_size=self._settings.translation_cache_max_size,
        )
        self._in_flight: dict[str, asyncio.Future[TranslateResponse | None]] = {}
        self._lock = asyncio.Lock()

    async def translate(self, word: str, source_language: str, target_language: str) -> TranslateResponse | None:
        normalized_word = word.strip().lower()
        cache_key = self._cache.make_key(source_language, target_language, normalized_word)

        cached_translation = self._cache.get(cache_key)
        if cached_translation is not None:
            return TranslateResponse(
                word=normalized_word,
                translation=cached_translation,
                source_language=source_language,
                target_language=target_language,
            )

        wait_future: asyncio.Future[TranslateResponse | None] | None = None
        async with self._lock:
            existing = self._in_flight.get(cache_key)
            if existing is not None:
                wait_future = existing
            else:
                loop = asyncio.get_running_loop()
                future = loop.create_future()
                self._in_flight[cache_key] = future

        if wait_future is not None:
            return await wait_future

        future = self._in_flight[cache_key]

        try:
            translation = await self._provider.translate(normalized_word, source_language, target_language)
            if translation is None:
                result = None
            else:
                self._cache.set(cache_key, translation)
                result = TranslateResponse(
                    word=normalized_word,
                    translation=translation,
                    source_language=source_language,
                    target_language=target_language,
                )
            future.set_result(result)
            return result
        except Exception as exc:
            if not future.done():
                future.set_exception(exc)
            raise
        finally:
            async with self._lock:
                self._in_flight.pop(cache_key, None)

    def cache_stats(self) -> dict[str, int]:
        return self._cache.stats()

    def clear_cache(self) -> None:
        self._cache.clear()
