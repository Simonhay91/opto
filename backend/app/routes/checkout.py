from fastapi import APIRouter, Request
from app.services.proxy import proxy_service

router = APIRouter(prefix="/proxy/web/checkout", tags=["checkout"])

@router.post("/global-preorder")
async def global_preorder(request: Request):
    """Submit global preorder/quote request"""
    body = await request.json()
    return await proxy_service.post("/web/checkout/global-preorder", body)
