from fastapi import APIRouter
from typing import Optional
from app.services.proxy import proxy_service

router = APIRouter(prefix="/proxy/web/blog", tags=["blog"])

@router.get("/paged")
async def get_blogs_paged(page: int = 1, limit: int = 12, name: Optional[str] = None):
    """Get paginated blog posts"""
    params = f"?page={page}&limit={limit}"
    if name:
        params += f"&name={name}"
    return await proxy_service.get(f"/web/blog/paged{params}")

@router.get("/slug/{slug}")
async def get_blog_by_slug(slug: str):
    """Get blog post by slug"""
    return await proxy_service.get(f"/web/blog/slug/{slug}")
