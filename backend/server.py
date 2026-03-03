from fastapi import FastAPI, APIRouter, Request, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
from pathlib import Path
from typing import Optional, Any

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EXTERNAL_API = "https://dev.planetworkspace.com/api"
PARTNER_KEY = os.environ.get('PARTNER_KEY', '')

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    client.close()

app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def partner_headers(extra: dict = None):
    h = {"x-partner-key": PARTNER_KEY, "Content-Type": "application/json"}
    if extra:
        h.update(extra)
    return h


async def proxy_get(path: str, params: dict = None, extra_headers: dict = None):
    async with httpx.AsyncClient(timeout=30) as c:
        resp = await c.get(
            f"{EXTERNAL_API}{path}",
            headers=partner_headers(extra_headers),
            params={k: v for k, v in (params or {}).items() if v is not None}
        )
        return resp.json()


async def proxy_post(path: str, body: Any = None, params: dict = None, extra_headers: dict = None):
    async with httpx.AsyncClient(timeout=30) as c:
        resp = await c.post(
            f"{EXTERNAL_API}{path}",
            headers=partner_headers(extra_headers),
            json=body or {},
            params={k: v for k, v in (params or {}).items() if v is not None}
        )
        return resp.json()


# ── Partner Info ────────────────────────────────────────────────────────────
@api_router.get("/proxy/web/partner/self")
async def get_partner():
    return await proxy_get("/web/partner/self")


# ── Sliders ──────────────────────────────────────────────────────────────────
@api_router.get("/proxy/web/sliders")
async def get_sliders():
    return await proxy_get("/web/sliders")


# ── Promotional Units ────────────────────────────────────────────────────────
@api_router.get("/proxy/web/promotional-unit")
async def get_promo_units(startDate: Optional[str] = None, endDate: Optional[str] = None):
    return await proxy_get("/web/promotional-unit", {"startDate": startDate, "endDate": endDate})


# ── Sections ─────────────────────────────────────────────────────────────────
@api_router.get("/proxy/web/section")
async def get_sections():
    return await proxy_get("/web/section")


@api_router.post("/proxy/web/product/section/{section_id}")
async def get_section_products(section_id: str, request: Request, customerId: Optional[str] = None):
    body = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    return await proxy_post(f"/web/product/section/{section_id}", body, {"customerId": customerId})


# ── Product Explore ──────────────────────────────────────────────────────────
@api_router.post("/proxy/web/product/explore")
async def explore_products(request: Request, customerId: Optional[str] = None):
    body = await request.json()
    return await proxy_post("/web/product/explore", body, {"customerId": customerId})


# ── Product Detail ───────────────────────────────────────────────────────────
@api_router.get("/proxy/web/product/{slug}")
async def get_product(slug: str):
    return await proxy_get(f"/web/product/{slug}")


# ── Categories ───────────────────────────────────────────────────────────────
@api_router.get("/proxy/web/category")
async def get_categories(locale: Optional[str] = None):
    headers = {"x-locale-code": locale} if locale else {}
    return await proxy_get("/web/category", extra_headers=headers)


@api_router.get("/proxy/web/category/{slug}/attributes")
async def get_category_attributes(slug: str, locale: Optional[str] = None):
    headers = {"x-locale-code": locale} if locale else {}
    return await proxy_get(f"/web/category/{slug}/attributes", extra_headers=headers)


# ── Brands ────────────────────────────────────────────────────────────────────
@api_router.get("/proxy/web/brand")
async def get_brands():
    return await proxy_get("/web/brand")


@api_router.get("/proxy/web/brand/category/{category_id}")
async def get_brands_by_category(category_id: str):
    return await proxy_get(f"/web/brand/category/{category_id}")


@api_router.get("/proxy/web/brand/{slug}")
async def get_brand_detail(slug: str, locale: Optional[str] = None):
    headers = {"x-locale-code": locale} if locale else {}
    return await proxy_get(f"/web/brand/{slug}", extra_headers=headers)


# ── Currency ─────────────────────────────────────────────────────────────────
@api_router.get("/proxy/web/currency")
async def get_currencies():
    return await proxy_get("/web/currency")


# ── Blog ─────────────────────────────────────────────────────────────────────
@api_router.get("/proxy/web/blog/paged")
async def get_blogs(page: int = 1, limit: int = 12, name: Optional[str] = None):
    return await proxy_get("/web/blog/paged", {"page": page, "limit": limit, "name": name})


@api_router.get("/proxy/web/blog/slug/{slug}")
async def get_blog(slug: str):
    return await proxy_get(f"/web/blog/slug/{slug}")


# ── Auth ─────────────────────────────────────────────────────────────────────
@api_router.post("/auth/login")
async def login(request: Request):
    body = await request.json()
    async with httpx.AsyncClient(timeout=30) as c:
        resp = await c.post(f"{EXTERNAL_API}/web/auth/customer/login", json=body)
        return resp.json()


@api_router.post("/auth/refresh")
async def refresh_token(request: Request):
    body = await request.json()
    async with httpx.AsyncClient(timeout=30) as c:
        resp = await c.post(f"{EXTERNAL_API}/web/auth/customer/refresh", json=body)
        return resp.json()


@api_router.post("/auth/logout")
async def logout(request: Request):
    auth = request.headers.get("authorization", "")
    async with httpx.AsyncClient(timeout=30) as c:
        resp = await c.post(
            f"{EXTERNAL_API}/web/auth/customer/logout",
            headers={"Authorization": auth}
        )
        return resp.json()


# ── Customer ──────────────────────────────────────────────────────────────────
@api_router.get("/customer/self")
async def get_customer(request: Request):
    auth = request.headers.get("authorization", "")
    return await proxy_get("/web/customer/self", extra_headers={"Authorization": auth})


# ── Project Inquiry / Quote ───────────────────────────────────────────────────
@api_router.post("/proxy/web/project-inquiry")
async def project_inquiry(request: Request):
    body = await request.json()
    if 'type' not in body:
        body['type'] = 'product'
    async with httpx.AsyncClient(timeout=30) as c:
        resp = await c.post(
            f"{EXTERNAL_API}/web/project-inquiry",
            headers=partner_headers(),
            json=body
        )
        return resp.json()



@api_router.get("/health")
async def health():
    return {"status": "ok", "partner_key_set": bool(PARTNER_KEY)}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
