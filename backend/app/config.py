import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # MongoDB
    MONGO_URL: str = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME: str = os.getenv('DB_NAME', 'full-stack')
    
    # External API
    API_BASE_URL: str = os.getenv('API_BASE_URL', 'https://planetworkspace.com/api')
    PARTNER_KEY: str = os.getenv('PARTNER_KEY', '')
    
    # Server
    HOST: str = '0.0.0.0'
    PORT: int = 8001
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:4200",
        "https://catalog-preview-13.preview.emergentagent.com",
    ]

settings = Settings()
