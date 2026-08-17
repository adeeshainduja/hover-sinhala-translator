from abc import ABC, abstractmethod


class TranslationProvider(ABC):
    @abstractmethod
    async def translate(self, word: str, source_language: str, target_language: str) -> str | None:
        raise NotImplementedError
