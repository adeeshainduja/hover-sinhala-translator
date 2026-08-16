const BACKEND_BASE_URL = "http://127.0.0.1:8000";
const TRANSLATION_TIMEOUT_MS = 5000;

(globalThis as typeof globalThis & {
  BACKEND_BASE_URL: string;
  TRANSLATION_TIMEOUT_MS: number;
}).BACKEND_BASE_URL = BACKEND_BASE_URL;

(globalThis as typeof globalThis & {
  TRANSLATION_TIMEOUT_MS: number;
}).TRANSLATION_TIMEOUT_MS = TRANSLATION_TIMEOUT_MS;
