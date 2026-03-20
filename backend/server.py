import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/health")
def health_root():
    return {"status": "ok"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


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
    # Remove hop-by-hop headers
    for h in ["host", "content-length", "transfer-encoding", "connection"]:
        headers.pop(h, None)

    body = await request.body()

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
        )

    # Return response
    excluded = {"content-encoding", "transfer-encoding", "connection"}
    resp_headers = {k: v for k, v in resp.headers.items() if k.lower() not in excluded}
    return Response(
        content=resp.content,
        status_code=resp.status_code,
        headers=resp_headers,
    )
