import os
import httpx
from datetime import datetime, timezone
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import motor.motor_asyncio

# Load env from backend/.env first, then frontend/.env as fallback
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env'))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_BASE_URL = os.environ.get("API_BASE_URL", "https://api-prod.optowire.net")
PARTNER_KEY = os.environ.get("PARTNER_KEY", "")
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

# --- MongoDB ---
_mongo_client = motor.motor_asyncio.AsyncIOMotorClient(os.environ.get("MONGO_URL", "mongodb://localhost:27017"))
_db = _mongo_client[os.environ.get("DB_NAME", "optowire")]

# --- Telegram helpers ---

async def tg_send(text: str, chat_id: str = "") -> bool:
    """Send a message via Telegram Bot API."""
    cid = chat_id or TELEGRAM_CHAT_ID
    if not TELEGRAM_BOT_TOKEN or not cid:
        return False
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(url, json={"chat_id": cid, "text": text, "parse_mode": "HTML"})
        return r.status_code == 200

async def tg_get_chat_id() -> Optional[str]:
    """Get the first available chat_id from bot updates."""
    if not TELEGRAM_BOT_TOKEN:
        return None
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url)
        data = r.json()
        for upd in reversed(data.get("result", [])):
            msg = upd.get("message") or upd.get("channel_post") or {}
            chat = msg.get("chat", {})
            if chat.get("id"):
                return str(chat["id"])
    return None


# --- Partner inquiry model ---

class PartnerInquiry(BaseModel):
    name: str
    email: str
    message: Optional[str] = ""
    partnershipType: Optional[str] = ""
    partnershipAim: Optional[str] = ""


@app.get("/health")
def health_root():
    return {"status": "ok"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/telegram/setup")
async def telegram_setup():
    """Return the first chat_id found in bot updates (for initial setup)."""
    chat_id = await tg_get_chat_id()
    if chat_id:
        return {"ok": True, "chat_id": chat_id,
                "hint": f"Add TELEGRAM_CHAT_ID={chat_id} to backend/.env and restart backend"}
    return {"ok": False,
            "hint": "Send any message to the bot first, then call this endpoint again"}


@app.post("/api/partner-inquiry")
async def partner_inquiry(data: PartnerInquiry):
    """Receive a partner application and send it to Telegram."""
    aim_map = {
        "DISCOUNT": "Get Discounts",
        "MARKETING_COLLABORATION": "Marketing Collaboration",
        "BULK_ORDERS": "Bulk Orders",
        "REFERRALS": "Referral Program",
    }
    type_map = {
        "INDIVIDUAL": "Individual",
        "SMALL_BUSINESS": "Small Business",
        "LARGE_BUSINESS": "Large Business",
    }
    text = (
        "<b>New Partner Application</b>\n\n"
        f"<b>Name:</b> {data.name}\n"
        f"<b>Email:</b> {data.email}\n"
        f"<b>Type:</b> {type_map.get(data.partnershipType, data.partnershipType)}\n"
        f"<b>Goal:</b> {aim_map.get(data.partnershipAim, data.partnershipAim)}\n"
    )
    if data.message:
        text += f"<b>Message:</b> {data.message}\n"

    # Resolve chat_id: use env var or auto-detect from updates
    chat_id = TELEGRAM_CHAT_ID or await tg_get_chat_id() or ""
    sent = await tg_send(text, chat_id=chat_id)
    return {"ok": True, "telegram_sent": sent}


# ── Tracking models ──────────────────────────────────────────────────────────

class ProductViewEvent(BaseModel):
    product_id: int
    product_name: str
    slug: Optional[str] = ""

class SearchEvent(BaseModel):
    query: str
    results_found: int


@app.post("/api/track/product-view")
async def track_product_view(event: ProductViewEvent):
    """Record a product page view."""
    doc = {
        "product_id": event.product_id,
        "product_name": event.product_name,
        "slug": event.slug,
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "ts": datetime.now(timezone.utc),
    }
    await _db["product_views"].insert_one(doc)
    return {"ok": True}


@app.post("/api/track/search")
async def track_search(event: SearchEvent):
    """Record a search query."""
    if not event.query or len(event.query.strip()) < 2:
        return {"ok": False}
    doc = {
        "query": event.query.strip().lower(),
        "results_found": event.results_found,
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "ts": datetime.now(timezone.utc),
    }
    await _db["search_queries"].insert_one(doc)
    return {"ok": True}


@app.get("/api/stats/product-views")
async def stats_product_views(date: str = ""):
    """Top 10 most viewed products for a given date (YYYY-MM-DD)."""
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    pipeline = [
        {"$match": {"date": date}},
        {"$group": {
            "_id": "$product_id",
            "product_name": {"$first": "$product_name"},
            "slug": {"$first": "$slug"},
            "clicks": {"$sum": 1},
        }},
        {"$sort": {"clicks": -1}},
        {"$limit": 10},
        {"$project": {"_id": 0, "product_id": "$_id",
                      "product_name": 1, "slug": 1, "clicks": 1}},
    ]
    cursor = _db["product_views"].aggregate(pipeline)
    results = await cursor.to_list(length=10)
    return {"date": date, "data": results}


@app.get("/api/stats/searches")
async def stats_searches(date: str = ""):
    """Top 10 search queries for a given date (YYYY-MM-DD)."""
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    pipeline = [
        {"$match": {"date": date}},
        {"$group": {
            "_id": "$query",
            "count": {"$sum": 1},
            "results_found": {"$last": "$results_found"},
        }},
        {"$sort": {"count": -1}},
        {"$limit": 10},
        {"$project": {"_id": 0, "query": "$_id",
                      "count": 1, "results_found": 1}},
    ]
    cursor = _db["search_queries"].aggregate(pipeline)
    results = await cursor.to_list(length=10)
    return {"date": date, "data": results}


@app.api_route("/api/ext/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy(path: str, request: Request):
    """Proxy all /api/ext/** requests to the external API."""
    # Build target URL
    query = request.url.query
    target_url = f"{API_BASE_URL}/{path}"
    if query:
        target_url = f"{target_url}?{query}"

    # Forward headers, injecting partner key
    headers = dict(request.headers)
    headers["x-partner-key"] = PARTNER_KEY
    # Force gzip only — avoids Brotli responses that httpx cannot decompress
    headers["accept-encoding"] = "gzip, deflate"
    # Remove hop-by-hop headers and browser-specific headers that cause
    # CORS/auth rejection at the external API
    for h in ["host", "content-length", "transfer-encoding", "connection",
              "origin", "referer", "sec-fetch-site", "sec-fetch-mode",
              "sec-fetch-dest", "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform"]:
        headers.pop(h, None)

    body = await request.body()

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
        )

    # resp.content is already decompressed by httpx — return plain JSON
    # Strip all caching headers from upstream + force no-cache so browsers
    # never serve stale API data (prevents 304 with empty/broken cached responses)
    excluded = {
        "content-encoding", "transfer-encoding", "connection",
        "etag", "last-modified", "expires", "cache-control", "pragma",
        "vary",
    }
    resp_headers = {k: v for k, v in resp.headers.items() if k.lower() not in excluded}
    resp_headers["cache-control"] = "no-store, no-cache, must-revalidate, max-age=0"
    resp_headers["pragma"] = "no-cache"
    resp_headers["expires"] = "0"
    return Response(
        content=resp.content,
        status_code=resp.status_code,
        headers=resp_headers,
    )


# ── Sitemap ──────────────────────────────────────────────────────────────────

SITE_URL = os.environ.get("SITE_URL", "https://optowire.net")
ALLOWED_CATEGORY_IDS = {1, 91, 188, 212}

def flatten_categories(cats: list, result: list = None) -> list:
    if result is None:
        result = []
    for cat in cats:
        result.append(cat)
        if cat.get("children"):
            flatten_categories(cat["children"], result)
    return result

@app.get("/sitemap.xml", response_class=Response)
async def sitemap():
    urls = []
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    static_routes = [
        ("", "1.0", "daily"),
        ("/brands", "0.8", "weekly"),
        ("/new-arrivals", "0.8", "weekly"),
        ("/about", "0.6", "monthly"),
        ("/contact", "0.6", "monthly"),
        ("/partner", "0.6", "monthly"),
    ]
    for path, priority, changefreq in static_routes:
        urls.append({
            "loc": f"{SITE_URL}{path}",
            "lastmod": today,
            "changefreq": changefreq,
            "priority": priority,
        })

    async with httpx.AsyncClient(timeout=30.0) as client:
        headers = {"x-partner-key": PARTNER_KEY, "accept-encoding": "gzip, deflate"}

        try:
            r = await client.get(f"{API_BASE_URL}/web/category",
                                 params={"customerId": "0"}, headers=headers)
            if r.status_code == 200:
                all_cats = flatten_categories(r.json())
                for cat in all_cats:
                    if cat.get("id") and int(cat["id"]) in ALLOWED_CATEGORY_IDS:
                        slug = cat.get("slug", "")
                        if slug:
                            urls.append({
                                "loc": f"{SITE_URL}/category/{slug}",
                                "lastmod": today,
                                "changefreq": "weekly",
                                "priority": "0.8",
                            })
        except Exception:
            pass

        try:
            page, page_size = 1, 100
            while True:
                r = await client.post(
                    f"{API_BASE_URL}/web/product/explore",
                    params={"customerId": "0"},
                    headers=headers,
                    json={"page": page, "limit": page_size},
                )
                if r.status_code not in (200, 201):
                    break
                data = r.json()
                items = data.get("products") or data.get("items") or (data if isinstance(data, list) else [])
                if not items:
                    break
                for product in items:
                    slug = product.get("slug", "")
                    if slug:
                        urls.append({
                            "loc": f"{SITE_URL}/product/{slug}",
                            "lastmod": today,
                            "changefreq": "weekly",
                            "priority": "0.7",
                        })
                total = data.get("total", 0) if isinstance(data, dict) else 0
                if page * page_size >= total:
                    break
                page += 1
        except Exception:
            pass

    xml_parts = ['<?xml version="1.0" encoding="UTF-8"?>',
                 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        xml_parts.append(
            f"  <url>\n"
            f"    <loc>{u['loc']}</loc>\n"
            f"    <lastmod>{u['lastmod']}</lastmod>\n"
            f"    <changefreq>{u['changefreq']}</changefreq>\n"
            f"    <priority>{u['priority']}</priority>\n"
            f"  </url>"
        )
    xml_parts.append("</urlset>")

    return Response(
        content="\n".join(xml_parts),
        media_type="application/xml",
        headers={"Cache-Control": "public, max-age=3600"},
    )
