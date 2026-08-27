# Hover Sinhala Translator v1.0.0

## Added

- Hover English words to request Sinhala translations.
- Configurable hover delay, popup position, display fields, and enable/disable setting.
- Backend translation caching and request deduplication.

## Security

- Provider credentials remain on the FastAPI server.
- Popup content is rendered as text.
- Extension permissions are limited to storage.

## Known Limitations

- The backend must be deployed separately and configured with HTTPS for public use.
- Manual Chrome Web Store submission and website QA remain release-owner steps.
