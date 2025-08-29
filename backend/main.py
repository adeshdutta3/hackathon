from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import security_settings
from backend.routes import query
from backend.middleware.log_requests import log_requests



app = FastAPI(
    title="DeFi AI Assistant",
    description="Cost efficient DeFi assistant which does Nothing but praise team 69LPA",
    version="1.0.0",
    docs_url="/docs" if security_settings.DEBUG else None,

)


#Setting Up midddleware for FRONTEND
app.add_middleware(
    CORSMiddleware,
    allow_origins = security_settings.ALLOWED_ORIGINS,
    allow_credentials = True,
    allow_methods = ["GET", "POST"],
    allow_headers = ["*"],
)

#Adding Middleware
app.middleware("http")(log_requests)

#Routes
app.include_router(query.router, prefix="/query")