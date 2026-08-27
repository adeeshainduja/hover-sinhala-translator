from typing import Literal, Optional

from pydantic import BaseModel, field_validator, Field


class TranslateRequest(BaseModel):
    word: str = Field(min_length=1, max_length=100)
    target_language: Literal["si"]

    @field_validator("word")
    @classmethod
    def normalize_word(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("word must not be empty")
        if len(normalized) > 100:
            raise ValueError("word is too long")
        return normalized.lower()


class TranslateResponse(BaseModel):
    word: str
    translation: Optional[str]
    source_language: str
    target_language: str
