# API Contract

## `GET /health`

Returns `{"status":"ok"}` without contacting the translation provider.

## `POST /api/v1/translate`

Request:

```json
{"word":"algorithm","target_language":"si"}
```

Successful response:

```json
{"word":"algorithm","translation":"...","source_language":"en","target_language":"si"}
```

The word is trimmed, normalized, and limited to 100 characters. The currently supported target language is `si`. Invalid requests return a controlled `INVALID_REQUEST` error; unavailable translation services return a friendly controlled error response.
