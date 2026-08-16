from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_translate_algorithm() -> None:
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
    response = client.post(
        "/api/v1/translate",
        json={"word": "database", "target_language": "si"},
    )
    assert response.status_code == 200
    assert response.json()["translation"] == "දත්ත සමුදාය"


def test_unknown_word_returns_404() -> None:
    response = client.post(
        "/api/v1/translate",
        json={"word": "unknownword", "target_language": "si"},
    )
    assert response.status_code == 404


def test_empty_word_rejected() -> None:
    response = client.post(
        "/api/v1/translate",
        json={"word": "", "target_language": "si"},
    )
    assert response.status_code == 422


def test_invalid_target_language_rejected() -> None:
    response = client.post(
        "/api/v1/translate",
        json={"word": "algorithm", "target_language": "en"},
    )
    assert response.status_code == 422


def test_whitespace_is_normalized() -> None:
    response = client.post(
        "/api/v1/translate",
        json={"word": " algorithm ", "target_language": "si"},
    )
    assert response.status_code == 200
    assert response.json()["word"] == "algorithm"
