from app.schemas.translation import TranslateResponse


class TranslationService:
    _translations = {
        "algorithm": "ඇල්ගොරිතම",
        "computer": "පරිගණකය",
        "database": "දත්ත සමුදාය",
        "technology": "තාක්ෂණය",
        "performance": "කාර්යක්ෂමතාව",
        "system": "පද්ධතිය",
        "learning": "ඉගෙනීම",
    }

    def translate(self, word: str, target_language: str) -> TranslateResponse | None:
        translation = self._translations.get(word.lower())
        if translation is None:
            return None

        return TranslateResponse(
            word=word.lower(),
            translation=translation,
            source_language="en",
            target_language=target_language,
        )
