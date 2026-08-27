# Privacy Policy

## Data Processing

When the user hovers over a translatable English word, the extension sends that word and the selected target language (`si`) to the configured FastAPI backend. The backend forwards the word to its configured translation provider.

The extension does not send entire webpages, browser history, cookies, passwords, or form contents. User preferences are stored in Chrome sync storage. Provider credentials are stored only in backend environment configuration and are never placed in the extension or Chrome storage.

## Retention and Control

The extension itself does not maintain translation history or user accounts. The backend may temporarily retain successful translations in its in-memory cache according to its configured TTL; restarting the backend clears that cache.

## Contact

For privacy questions, use the contact or issue channel published with the project repository.
