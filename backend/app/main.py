from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
import time
from uuid import uuid4

from app.api.routes.translation import router as translation_router
from app.core.config import get_settings

async def validation_error_handler(request: Request, exc: RequestValidationError):
    from fastapi.responses import JSONResponse
    return JSONResponse(status_code=422, content={"error": {"code": "INVALID_REQUEST", "message": "The translation request is invalid."}})

settings = get_settings()
app = FastAPI(title="Hover Sinhala Translator API", version="1.0.0")
app.add_exception_handler(RequestValidationError, validation_error_handler)

@app.middleware("http")
async def request_context(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid4())
    started = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Server-Timing"] = f"app;dur={(time.perf_counter() - started) * 1000:.1f}"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=None if settings.environment == "production" else r"^chrome-extension://[a-z0-9]+$",
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(translation_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/ready")
def ready() -> dict[str, str]:
    return {"status": "ready"}
