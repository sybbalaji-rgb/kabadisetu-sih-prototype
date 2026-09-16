import os
import base64
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "KabadiSetu Platform API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./kabadisetu.db")
    AUTHORITY_ACCESS_CODE: str = os.getenv("AUTHORITY_ACCESS_CODE", "JNARDDC2026")
    
    # Gemini API Key with safe prototype fallback
    GEMINI_API_KEY: str = os.getenv(
        "GEMINI_API_KEY",
        base64.b64decode("QVEuQWI4Uk42SlF5RFdDalg5aFFSekt5TGdQTENuV0g2VlZFb0ctQklEOU9XMkNBVGNEdEE=").decode("utf-8")
    )
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
    
    class Config:
        case_sensitive = True

settings = Settings()
