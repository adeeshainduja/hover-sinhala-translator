from typing import Literal, Optional

from pydantic import BaseModel, field_validator


class TranslateRequest(BaseModel):
    word: str
    target_language: Literal["si"]

    @field_validator("word")
    @classmethod
    def normalize_word(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("word must not be empty")
        return normalized.lower()


class TranslateResponse(BaseModel):
    word: str
    translation: Optional[str]
    source_language: str
    target_language: str
