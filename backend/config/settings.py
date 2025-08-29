from pydantic_settings import BaseSettings
from typing import Optional, List
from dotenv import load_dotenv
load_dotenv(dotenv_path="backend/.env")


class LangChainSettings(BaseSettings):
    LANGSMITH_API_KEY: Optional[str] = None
    LANGCHAIN_TRACING_V2: bool = False
    LANGCHAIN_PROJECT: str = "Some Shit App"

    class Config:
        env_file = ".env"


class OpenAISettings(BaseSettings):
    _API_KEYOPENAI: Optional[str] = None
    class Config:
        env_file = ".env"



class ModelSettings(BaseSettings):
    DEFAULT_MODEL: str = "gpt-5-mini"
    FALLBACK_MODEL: str = "gpt-5-mini"
    DEFAULT_TEMPERATURE: float = 0.0
    MAX_TOKENS: int = 1000

    INTENT_MODEL: str = "gpt-5-nano"
    QUERY_MODEL: str = "gpt-5-mini"
    ACTION_MODEL: str = "gpt-5-mini"
    ADVANCED_MODEL: str = "gpt-5"

    class Config:
        env_file = ".env"


class SecuritySettings(BaseSettings):
    DEBUG: bool = False
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8501"]

    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000

    class Config:
        env_file = ".env"


class VectorSettings(BaseSettings):
    VECTOR_SEARCH_TOP_K: int = 3
    HIGH_CONFIDENCE_THRESHOLD: float = 0.98
    MEDIUM_CONFIDENCE_THRESHOLD: float = 0.90

    class Config:
        env_file = ".env"


class SessionSettings(BaseSettings):
    SESSION_TTL: int = 300
    MAX_CONVERSATION_HISTORY: int = 10

    class Config:
        env_file = ".env"

class ChatBot(BaseSettings):
    USE_GPT: bool = False

    class Config:
        env_file = ".env"




# Instantiate
openai_settings = OpenAISettings()
model_settings = ModelSettings()
security_settings = SecuritySettings()
vector_settings = VectorSettings()
session_settings = SessionSettings()
chatbot_settings = ChatBot()
langchain_settings = LangChainSettings()