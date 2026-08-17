from app.providers.base import TranslationProvider
from app.schemas.translation import TranslateResponse


class TranslationService:
    def __init__(self, provider: TranslationProvider) -> None:
        self._provider = provider

    async def translate(self, word: str, source_language: str, target_language: str) -> TranslateResponse | None:
        translation = await self._provider.translate(word, source_language, target_language)
        if translation is None:
            return None

        return TranslateResponse(
            word=word.lower(),
            translation=translation,
            source_language=source_language,
            target_language=target_language,
        )
