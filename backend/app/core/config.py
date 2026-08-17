from functools import lru_cache
import os


class Settings:
    def __init__(self) -> None:
        self.translation_api_key = os.getenv("TRANSLATION_API_KEY", "").strip()
        self.translation_api_url = os.getenv(
            "TRANSLATION_API_URL",
            "https://translation.googleapis.com/language/translate/v2",
        ).strip()
        self.translation_timeout = float(os.getenv("TRANSLATION_TIMEOUT", "5"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
