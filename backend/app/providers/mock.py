from app.providers.base import TranslationProvider


class MockTranslationProvider(TranslationProvider):
    _translations = {
        "algorithm": "ඇල්ගොරිතම",
        "computer": "පරිගණකය",
        "database": "දත්ත සමුදාය",
        "technology": "තාක්ෂණය",
        "performance": "කාර්යක්ෂමතාව",
        "system": "පද්ධතිය",
        "learning": "ඉගෙනීම",
    }

    async def translate(self, word: str, source_language: str, target_language: str) -> str | None:
        if source_language != "en" or target_language != "si":
            return None
        return self._translations.get(word.lower())
