from fastapi.testclient import TestClient

from app.api.routes.translation import get_translation_service
from app.main import app
from app.providers.base import TranslationProvider
from app.services.translation_service import TranslationService
from app.core.exceptions import TranslationProviderError


class FakeProvider(TranslationProvider):
    async def translate(self, word: str, source_language: str, target_language: str) -> str | None:
        if source_language != "en" or target_language != "si":
            return None
        translations = {
            "algorithm": "ඇල්ගොරිතම",
            "database": "දත්ත සමුදාය",
        }
        return translations.get(word.lower())


class TimeoutProvider(TranslationProvider):
    async def translate(self, word: str, source_language: str, target_language: str) -> str | None:
        raise TranslationProviderError("timeout", "timeout")


def test_translate_algorithm() -> None:
    app.dependency_overrides.clear()
    app.dependency_overrides[get_translation_service] = lambda: TranslationService(FakeProvider())
    client = TestClient(app)

    response = client.post(
        "/api/v1/translate",
        json={"word": "algorithm", "target_language": "si"},
    )
    assert response.status_code == 200
    assert response.json() == {
        "word": "algorithm",
        "translation": "ඇල්ගොරිතම",
        "source_language": "en",
        "target_language": "si",
    }


def test_translate_database() -> None:
    app.dependency_overrides.clear()
    app.dependency_overrides[get_translation_service] = lambda: TranslationService(FakeProvider())
    client = TestClient(app)

    response = client.post(
        "/api/v1/translate",
        json={"word": "database", "target_language": "si"},
    )
    assert response.status_code == 200
    assert response.json()["translation"] == "දත්ත සමුදාය"


def test_unknown_word_returns_404() -> None:
    app.dependency_overrides.clear()
    app.dependency_overrides[get_translation_service] = lambda: TranslationService(FakeProvider())
    client = TestClient(app)

    response = client.post(
        "/api/v1/translate",
        json={"word": "unknownword", "target_language": "si"},
    )
    assert response.status_code == 404


def test_empty_word_rejected() -> None:
    app.dependency_overrides.clear()
    app.dependency_overrides[get_translation_service] = lambda: TranslationService(FakeProvider())
    client = TestClient(app)

    response = client.post(
        "/api/v1/translate",
        json={"word": "", "target_language": "si"},
    )
    assert response.status_code == 422


def test_invalid_target_language_rejected() -> None:
    app.dependency_overrides.clear()
    app.dependency_overrides[get_translation_service] = lambda: TranslationService(FakeProvider())
    client = TestClient(app)

    response = client.post(
        "/api/v1/translate",
        json={"word": "algorithm", "target_language": "en"},
    )
    assert response.status_code == 422


def test_whitespace_is_normalized() -> None:
    app.dependency_overrides.clear()
    app.dependency_overrides[get_translation_service] = lambda: TranslationService(FakeProvider())
    client = TestClient(app)

    response = client.post(
        "/api/v1/translate",
        json={"word": " algorithm ", "target_language": "si"},
    )
    assert response.status_code == 200
    assert response.json()["word"] == "algorithm"
