from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager

from app.config import settings
from app.routes import products, categories, brands, blog, partner, checkout, sliders

# MongoDB client
mongo_client = None
db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    global mongo_client, db
    mongo_client = AsyncIOMotorClient(settings.MONGO_URL)
    db = mongo_client[settings.DB_NAME]
    print(f"✅ Connected to MongoDB: {settings.DB_NAME}")
    
    yield
    
    # Shutdown
    if mongo_client:
        mongo_client.close()
        print("✅ MongoDB connection closed")

# Create FastAPI app
app = FastAPI(
    title="Optowire API",
    description="Backend API for Optowire product catalog",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "optowire-backend"}

# Include routers
app.include_router(products.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(brands.router, prefix="/api")
app.include_router(blog.router, prefix="/api")
app.include_router(partner.router, prefix="/api")
app.include_router(checkout.router, prefix="/api")
app.include_router(sliders.router, prefix="/api")

# Get database instance
def get_db():
    return db
