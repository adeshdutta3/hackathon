import os
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from backend.middleware.langsmith_tracer import LangSmithTracerMiddleware

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv(dotenv_path="backend/.env")
from backend.config.settings import security_settings, langchain_settings
from backend.routes import query
from backend.middleware.log_requests import log_requests


# Initialize FastAPI
app = FastAPI(
    title="DeFi AI Assistant",
    description="Cost-efficient DeFi assistant which does Nothing but praise team 69LPA",
    version="1.0.0",
    docs_url="/docs" if security_settings.DEBUG else None,
    redoc_url="/redoc" if security_settings.DEBUG else None
)

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)   # <-- GLOBAL RATE LIMITING

# Enable LangSmith tracing
os.environ["LANGSMITH_API_KEY"] = langchain_settings.LANGSMITH_API_KEY
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = langchain_settings.LANGCHAIN_PROJECT

# Custom middleware
app.middleware("http")(log_requests)
app.add_middleware(LangSmithTracerMiddleware)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=security_settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Routes
app.include_router(query.router, prefix="/query")


# Optional: allow running with `python backend/main.py`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
