from fastapi import APIRouter, Request
from typing import Optional
from app.services.proxy import proxy_service

router = APIRouter(prefix="/proxy/web/product", tags=["products"])

@router.post("/explore")
async def explore_products(request: Request):
    """Explore products with filters"""
    body = await request.json()
    return await proxy_service.post("/web/product/explore", body)

@router.get("/{slug:path}")
async def get_product(slug: str, locale: Optional[str] = None):
    """Get product by slug"""
    headers = {"x-locale-code": locale} if locale else None
    return await proxy_service.get(f"/web/product/{slug}", headers)
