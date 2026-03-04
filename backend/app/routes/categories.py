from fastapi import APIRouter
from typing import Optional
from app.services.proxy import proxy_service

router = APIRouter(prefix="/proxy/web/category", tags=["categories"])

@router.get("")
async def get_categories(locale: Optional[str] = None):
    """Get all categories"""
    headers = {"x-locale-code": locale} if locale else None
    return await proxy_service.get("/web/category", headers)

@router.get("/{slug:path}/attributes")
async def get_category_attributes(slug: str, locale: Optional[str] = None):
    """Get category attributes by slug (supports nested paths)"""
    headers = {"x-locale-code": locale} if locale else None
    return await proxy_service.get(f"/web/category/{slug}/attributes", headers)
