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
