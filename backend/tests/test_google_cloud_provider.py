import httpx
import pytest

from app.core.config import Settings
from app.core.exceptions import TranslationProviderError
from app.providers.google_cloud import GoogleCloudTranslationProvider


class FakeResponse:
    def __init__(self, status_code: int, payload=None, json_error: bool = False) -> None:
        self.status_code = status_code
        self._payload = payload or {}
        self._json_error = json_error

    def json(self):
        if self._json_error:
            raise ValueError("bad json")
        return self._payload


class FakeClient:
    def __init__(self, response=None, error=None) -> None:
        self.response = response
        self.error = error
        self.closed = False

    async def post(self, *args, **kwargs):
        if self.error:
            raise self.error
        return self.response

    async def aclose(self):
        self.closed = True


@pytest.mark.anyio
async def test_google_provider_success() -> None:
    client = FakeClient(
        FakeResponse(
            200,
            {"data": {"translations": [{"translatedText": "ඇල්ගොරිතම"}]}},
        )
    )
    provider = GoogleCloudTranslationProvider(Settings(), client=client)  # type: ignore[arg-type]
    provider._settings.translation_api_key = "test-key"

    result = await provider.translate("algorithm", "en", "si")
    assert result == "ඇල්ගොරිතම"


@pytest.mark.anyio
async def test_google_provider_timeout() -> None:
    client = FakeClient(error=httpx.TimeoutException("timeout"))
    provider = GoogleCloudTranslationProvider(Settings(), client=client)  # type: ignore[arg-type]
    provider._settings.translation_api_key = "test-key"

    with pytest.raises(TranslationProviderError) as exc:
        await provider.translate("algorithm", "en", "si")
    assert exc.value.kind == "timeout"


@pytest.mark.anyio
async def test_google_provider_401() -> None:
    client = FakeClient(FakeResponse(401, {"error": "bad credentials"}))
    provider = GoogleCloudTranslationProvider(Settings(), client=client)  # type: ignore[arg-type]
    provider._settings.translation_api_key = "test-key"

    with pytest.raises(TranslationProviderError) as exc:
        await provider.translate("algorithm", "en", "si")
    assert exc.value.kind == "config"


@pytest.mark.anyio
async def test_google_provider_429() -> None:
    client = FakeClient(FakeResponse(429, {"error": "rate limit"}))
    provider = GoogleCloudTranslationProvider(Settings(), client=client)  # type: ignore[arg-type]
    provider._settings.translation_api_key = "test-key"

    with pytest.raises(TranslationProviderError) as exc:
        await provider.translate("algorithm", "en", "si")
    assert exc.value.kind == "rate_limit"


@pytest.mark.anyio
async def test_google_provider_500() -> None:
    client = FakeClient(FakeResponse(500, {"error": "server error"}))
    provider = GoogleCloudTranslationProvider(Settings(), client=client)  # type: ignore[arg-type]
    provider._settings.translation_api_key = "test-key"

    with pytest.raises(TranslationProviderError) as exc:
        await provider.translate("algorithm", "en", "si")
    assert exc.value.kind == "upstream"


@pytest.mark.anyio
async def test_google_provider_invalid_response() -> None:
    client = FakeClient(FakeResponse(200, json_error=True))
    provider = GoogleCloudTranslationProvider(Settings(), client=client)  # type: ignore[arg-type]
    provider._settings.translation_api_key = "test-key"

    with pytest.raises(TranslationProviderError) as exc:
        await provider.translate("algorithm", "en", "si")
    assert exc.value.kind == "parse"


@pytest.mark.anyio
async def test_google_provider_missing_api_key() -> None:
    client = FakeClient(FakeResponse(200, {"data": {"translations": [{"translatedText": "x"}]}}))
    provider = GoogleCloudTranslationProvider(Settings(), client=client)  # type: ignore[arg-type]
    provider._settings.translation_api_key = ""

    with pytest.raises(TranslationProviderError) as exc:
        await provider.translate("algorithm", "en", "si")
    assert exc.value.kind == "config"
