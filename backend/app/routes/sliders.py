from fastapi import APIRouter
from typing import Optional
from app.services.proxy import proxy_service

router = APIRouter(prefix="/proxy/web/sliders", tags=["sliders"])

@router.get("")
async def get_sliders():
    """Get all sliders"""
    return await proxy_service.get("/web/sliders")

@router.get("/{slider_id}")
async def get_slider(slider_id: int):
    """Get slider by ID"""
    return await proxy_service.get(f"/web/sliders/{slider_id}")
