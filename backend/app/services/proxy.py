import httpx
from typing import Optional, Dict, Any
from app.config import settings

class ProxyService:
    """Service for proxying requests to external API"""
    
    def __init__(self):
        self.base_url = settings.API_BASE_URL
        self.partner_key = settings.PARTNER_KEY
    
    def get_headers(self, extra_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        """Get default headers with optional extra headers"""
        headers = {'x-partner-key': self.partner_key}
        if extra_headers:
            headers.update(extra_headers)
        return headers
    
    async def get(self, path: str, extra_headers: Optional[Dict[str, str]] = None) -> Any:
        """Proxy GET request to external API"""
        url = f"{self.base_url}{path}"
        headers = self.get_headers(extra_headers)
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
    
    async def post(self, path: str, data: Any, extra_headers: Optional[Dict[str, str]] = None) -> Any:
        """Proxy POST request to external API"""
        url = f"{self.base_url}{path}"
        headers = self.get_headers(extra_headers)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()

proxy_service = ProxyService()
