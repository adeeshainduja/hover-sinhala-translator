from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.translation import router as translation_router

app = FastAPI(title="Hover Sinhala Translator API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"^chrome-extension://[a-z0-9]+$",
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(translation_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
