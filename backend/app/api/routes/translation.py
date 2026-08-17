from fastapi import APIRouter, Depends, HTTPException, status

from app.core.exceptions import TranslationProviderError
from app.providers.google_cloud import GoogleCloudTranslationProvider
from app.schemas.translation import TranslateRequest, TranslateResponse
from app.services.translation_service import TranslationService
from app.core.config import get_settings

router = APIRouter(prefix="/api/v1", tags=["translation"])


def get_translation_service() -> TranslationService:
    settings = get_settings()
    provider = GoogleCloudTranslationProvider(settings)
    return TranslationService(provider)


@router.post("/translate", response_model=TranslateResponse)
async def translate(
    request: TranslateRequest,
    service: TranslationService = Depends(get_translation_service),
) -> TranslateResponse:
    try:
        result = await service.translate(request.word, "en", request.target_language)
    except TranslationProviderError as exc:
        if exc.kind == "config":
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Translation service unavailable.") from exc
        if exc.kind == "timeout":
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Translation service unavailable.") from exc
        if exc.kind == "rate_limit":
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Translation service unavailable.") from exc
        if exc.kind == "upstream":
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Translation service unavailable.") from exc
        if exc.kind == "request":
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Translation service unavailable.") from exc
        if exc.kind == "parse":
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Translation service unavailable.") from exc
        if exc.kind == "network":
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Translation service unavailable.") from exc
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Translation service unavailable.") from exc

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meaning not available.")

    return result
