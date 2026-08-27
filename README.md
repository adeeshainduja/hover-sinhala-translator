# Hover Sinhala Translator

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

### Extension

```bash
cd extension
npm install
npm run build
```

Load the unpacked extension in `chrome://extensions`.

## User Settings

Open the extension details in `chrome://extensions`, then choose **Extension options**.
Preferences are stored in Chrome sync storage and use these defaults:

- Extension enabled: on
- Hover delay: 700ms (allowed values: 300ms, 500ms, 700ms, 1000ms, 1500ms, 2000ms)
- Translation language: Sinhala (`si`)
- Popup position: Auto
- Show definition: on
- Show part of speech: on

Changes apply to active pages without a reload when Chrome delivers the storage update.

The detector preserves the word's displayed casing, strips surrounding punctuation,
and supports practical forms such as `object-oriented`, `don't`, `user_name`, and
`Python3`. It ignores inputs, textareas, contenteditable areas, code/preformatted
blocks, and script/style content so normal editing and code browsing are not interrupted.

## Notes

- The backend uses Google Cloud Translation Basic through a server-side provider.
- Put your local API key in `backend/.env`.
- Do not commit real credentials.

## Architecture

The extension detects a word, waits for the configured delay, and calls the versioned FastAPI endpoint. FastAPI validates the request, uses the in-memory cache, and calls the server-side translation provider when needed. Provider credentials never enter the extension.

## Tests and Packaging

```bash
cd extension
npm ci
npm test
npm run build
npm run package

cd ../backend
python -m pip install -r requirements.txt
pytest
```

The package command creates `release/hover-sinhala-translator-v1.0.0.zip`. It contains only the production manifest, compiled assets, and options assets. CI runs on pushes and pull requests; tagged releases create a GitHub release artifact but do not publish to the Chrome Web Store.

## Production Configuration

Run the backend behind HTTPS and set `ENVIRONMENT=production`, `CORS_ORIGINS`, `TRANSLATION_API_KEY`, `TRANSLATION_API_URL`, and `TRANSLATION_TIMEOUT` in the deployment environment. Use `/health` for liveness. See `docs/deployment.md`, `docs/api.md`, and `docs/rollback.md` for operational guidance.

## Security and Limitations

Only the `storage` Chrome permission is requested. The hovered word and selected target language are sent to the configured backend; page contents, history, cookies, passwords, and form contents are not sent. The local backend cache is in-memory and is cleared on restart. Chrome Web Store submission and production website QA remain manual release-owner steps.
