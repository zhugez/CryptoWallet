from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Crypto Wallet API"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./wallet.db"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]
    
    # Web3 Settings
    WEB3_PROVIDER_URI: str = "https://mainnet.infura.io/v3/your-project-id"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
