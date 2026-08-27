# Backend Deployment

Production traffic should use:

`Chrome Extension -> HTTPS -> FastAPI -> Translation Provider`

Set these backend environment variables without committing them:

- `ENVIRONMENT=production`
- `CORS_ORIGINS` to the required production origins
- `TRANSLATION_API_KEY`
- `TRANSLATION_API_URL`
- `TRANSLATION_TIMEOUT`
- Cache settings from `.env.example`

Run the application with `uvicorn app.main:app --host 0.0.0.0 --port 8000` behind an HTTPS-capable reverse proxy. Configure the extension's central backend URL for the deployed HTTPS API before publishing. Use `GET /health` for liveness and inspect request IDs and server timing when troubleshooting.
