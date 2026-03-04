from pydantic import BaseModel, EmailStr
from typing import Optional, Literal

class BecomePartnerRequest(BaseModel):
    name: str
    email: EmailStr
    message: Optional[str] = None
    partnershipType: Literal['INDIVIDUAL', 'SMALL_BUSINESS', 'LARGE_BUSINESS']
    partnershipAim: Literal['DISCOUNT', 'MARKETING_COLLABORATION', 'BULK_ORDERS', 'REFERRALS']

class ProjectInquiryRequest(BaseModel):
    name: str
    email: EmailStr
    message: str
    phone: Optional[str] = None
