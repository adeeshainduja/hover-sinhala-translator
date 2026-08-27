# Rollback Strategy

## Extension

Disable the affected release in the Chrome Web Store if necessary, then submit the last known-good packaged ZIP or instruct users to load that version unpacked during investigation. Keep version numbers monotonic for subsequent fixes.

## Backend

Redeploy the previous backend image or source revision with the previous environment configuration. Verify `GET /health`, then test `POST /api/v1/translate` before restoring traffic. The in-memory cache can be discarded safely during rollback.

## Coordination

Keep the extension API contract at `/api/v1/translate` backward compatible. Roll back the backend first when a server regression is causing extension failures; the extension's friendly error state keeps pages usable while recovery completes.
