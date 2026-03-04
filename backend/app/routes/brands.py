from fastapi import APIRouter
from typing import Optional
from app.services.proxy import proxy_service

router = APIRouter(prefix="/proxy/web/brand", tags=["brands"])

@router.get("")
async def get_brands(locale: Optional[str] = None):
    """Get all brands"""
    headers = {"x-locale-code": locale} if locale else None
    return await proxy_service.get("/web/brand", headers)
