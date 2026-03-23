import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

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
