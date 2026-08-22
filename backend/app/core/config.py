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
        self.translation_cache_enabled = os.getenv("TRANSLATION_CACHE_ENABLED", "true").lower() == "true"
        self.translation_cache_ttl = int(os.getenv("TRANSLATION_CACHE_TTL", "86400"))
        self.translation_cache_max_size = int(os.getenv("TRANSLATION_CACHE_MAX_SIZE", "1000"))


@lru_cache
def get_settings() -> Settings:
    return Settings()
