from fastapi import APIRouter, HTTPException

from app.schemas.translation import TranslateRequest, TranslateResponse
from app.services.translation_service import TranslationService

router = APIRouter(prefix="/api/v1", tags=["translation"])
service = TranslationService()


@router.post("/translate", response_model=TranslateResponse)
def translate(request: TranslateRequest) -> TranslateResponse:
    result = service.translate(request.word, request.target_language)
    if result is None:
        raise HTTPException(status_code=404, detail="Meaning not available.")
    return result
