from fastapi import APIRouter, Request
from app.services.proxy import proxy_service
from app.models.partner import BecomePartnerRequest, ProjectInquiryRequest

router = APIRouter(prefix="/proxy/web", tags=["partner"])

@router.post("/become-partner")
async def become_partner(data: BecomePartnerRequest):
    """Submit partnership application"""
    return await proxy_service.post("/web/become-partner", data.dict())

@router.post("/project-inquiry")
async def project_inquiry(request: Request):
    """Submit project inquiry"""
    body = await request.json()
    return await proxy_service.post("/web/project-inquiry", body)

@router.get("/partner")
async def get_partner():
    """Get partner information"""
    return await proxy_service.get("/web/partner")

@router.get("/sliders")
async def get_sliders():
    """Get sliders for homepage"""
    return await proxy_service.get("/web/sliders")

@router.get("/promotional-unit")
async def get_promotional_unit():
    """Get promotional units"""
    return await proxy_service.get("/web/promotional-unit")

