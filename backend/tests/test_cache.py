from __future__ import annotations

import pytest

from app.core.config import Settings
from app.providers.base import TranslationProvider
from app.services.translation_service import TranslationService


class CountingProvider(TranslationProvider):
    def __init__(self, response: str | None = "ඇල්ගොරිතම", fail: bool = False) -> None:
        self.response = response
        self.fail = fail
        self.calls = 0

    async def translate(self, word: str, source_language: str, target_language: str) -> str | None:
        self.calls += 1
        if self.fail:
            raise RuntimeError("provider failed")
        return self.response


def make_service(provider: TranslationProvider, *, enabled: bool = True, ttl: int = 86400, max_size: int = 1000) -> TranslationService:
    settings = Settings()
    settings.translation_cache_enabled = enabled
    settings.translation_cache_ttl = ttl
    settings.translation_cache_max_size = max_size
    return TranslationService(provider, settings)


@pytest.mark.anyio
async def test_cache_miss_then_hit() -> None:
    provider = CountingProvider()
    service = make_service(provider)

    first = await service.translate("algorithm", "en", "si")
    second = await service.translate("algorithm", "en", "si")

    assert first is not None and first.translation == "ඇල්ගොරිතම"
    assert second is not None and second.translation == "ඇල්ගොරිතම"
    assert provider.calls == 1
    assert service.cache_stats()["hits"] == 1


@pytest.mark.anyio
async def test_different_words_hit_provider_twice() -> None:
    provider = CountingProvider()
    service = make_service(provider)

    await service.translate("algorithm", "en", "si")
    provider.response = "දත්ත සමුදාය"
    await service.translate("database", "en", "si")

    assert provider.calls == 2


@pytest.mark.anyio
async def test_different_languages_use_different_keys() -> None:
    provider = CountingProvider()
    service = make_service(provider)

    await service.translate("algorithm", "en", "si")
    await service.translate("algorithm", "si", "en")

    assert provider.calls == 2


@pytest.mark.anyio
async def test_whitespace_normalizes_cache_key() -> None:
    provider = CountingProvider()
    service = make_service(provider)

    await service.translate(" algorithm ", "en", "si")
    await service.translate("algorithm", "en", "si")

    assert provider.calls == 1


@pytest.mark.anyio
async def test_cache_disabled_calls_provider_each_time() -> None:
    provider = CountingProvider()
    service = make_service(provider, enabled=False)

    await service.translate("algorithm", "en", "si")
    await service.translate("algorithm", "en", "si")

    assert provider.calls == 2


@pytest.mark.anyio
async def test_cache_max_size() -> None:
    provider = CountingProvider()
    service = make_service(provider, max_size=1)

    await service.translate("algorithm", "en", "si")
    provider.response = "දත්ත සමුදාය"
    await service.translate("database", "en", "si")

    stats = service.cache_stats()
    assert stats["size"] == 1


@pytest.mark.anyio
async def test_provider_failure_not_cached() -> None:
    provider = CountingProvider(fail=True)
    service = make_service(provider)

    with pytest.raises(RuntimeError):
        await service.translate("algorithm", "en", "si")

    provider.fail = False
    await service.translate("algorithm", "en", "si")
    assert provider.calls == 2
