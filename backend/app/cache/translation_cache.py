from __future__ import annotations

from collections import OrderedDict
from dataclasses import dataclass
from threading import Lock
from time import time


@dataclass
class CacheEntry:
    translation: str | None
    expires_at: float


class TranslationCache:
    def __init__(self, enabled: bool, ttl_seconds: int, max_size: int) -> None:
        self.enabled = enabled
        self.ttl_seconds = ttl_seconds
        self.max_size = max_size
        self._store: OrderedDict[str, CacheEntry] = OrderedDict()
        self._lock = Lock()
        self._hits = 0
        self._misses = 0

    def get(self, key: str) -> str | None:
        if not self.enabled:
            self._misses += 1
            return None

        with self._lock:
            self._purge_expired_locked()
            entry = self._store.get(key)
            if entry is None:
                self._misses += 1
                return None
            self._store.move_to_end(key)
            self._hits += 1
            return entry.translation

    def set(self, key: str, value: str | None, ttl: int | None = None) -> None:
        if not self.enabled or value is None:
            return

        with self._lock:
            expires_at = time() + float(ttl or self.ttl_seconds)
            self._store[key] = CacheEntry(translation=value, expires_at=expires_at)
            self._store.move_to_end(key)
            self._evict_locked()

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()
            self._hits = 0
            self._misses = 0

    def stats(self) -> dict[str, int]:
        with self._lock:
            self._purge_expired_locked()
            return {"hits": self._hits, "misses": self._misses, "size": len(self._store)}

    def make_key(self, source_language: str, target_language: str, word: str) -> str:
        return f"{source_language.lower()}:{target_language.lower()}:{word.strip().lower()}"

    def _evict_locked(self) -> None:
        self._purge_expired_locked()
        while len(self._store) > self.max_size:
            self._store.popitem(last=False)

    def _purge_expired_locked(self) -> None:
        now = time()
        expired = [key for key, entry in self._store.items() if entry.expires_at <= now]
        for key in expired:
            self._store.pop(key, None)
