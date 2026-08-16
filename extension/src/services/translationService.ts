type BackendTranslationResponse = {
  word: string;
  translation: string;
  source_language: string;
  target_language: string;
};

type TranslationServiceErrorKind = "network" | "timeout" | "http" | "invalid-json" | "unavailable";

type TranslationServiceErrorShape = Error & {
  kind: TranslationServiceErrorKind;
  status?: number;
};

function createTranslationError(kind: TranslationServiceErrorKind, message: string, status?: number): TranslationServiceErrorShape {
  const error = new Error(message) as TranslationServiceErrorShape;
  error.kind = kind;
  error.status = status;
  return error;
}

async function translateWord(word: string): Promise<BackendTranslationResponse | null> {
  const backendBaseUrl = (globalThis as typeof globalThis & {
    BACKEND_BASE_URL?: string;
  }).BACKEND_BASE_URL ?? "http://127.0.0.1:8000";
  const timeoutMs = (globalThis as typeof globalThis & {
    TRANSLATION_TIMEOUT_MS?: number;
  }).TRANSLATION_TIMEOUT_MS ?? 5000;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${backendBaseUrl}/api/v1/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        word,
        target_language: "si",
      }),
      signal: controller.signal,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw createTranslationError("http", `Unexpected response status: ${response.status}`, response.status);
    }

    let data: BackendTranslationResponse;
    try {
      data = (await response.json()) as BackendTranslationResponse;
    } catch {
      throw createTranslationError("invalid-json", "Invalid JSON received from backend.");
    }

    if (!data || typeof data.translation !== "string" || typeof data.word !== "string") {
      throw createTranslationError("invalid-json", "Malformed translation response.");
    }

    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw createTranslationError("timeout", "Translation request timed out.");
    }

    if ((error as TranslationServiceErrorShape).kind) {
      throw error;
    }

    throw createTranslationError("network", "Unable to reach translation backend.");
  } finally {
    window.clearTimeout(timeoutId);
  }
}

(globalThis as typeof globalThis & {
  translateWord: typeof translateWord;
}).translateWord = translateWord;
