from fastapi import APIRouter, HTTPException, Request, Response
from slowapi import Limiter
from slowapi.util import get_remote_address
from backend.config.settings import security_settings

from backend.models.schemas import (
    UserQuery,
    QueryResponse
)
from backend.middleware.input_sanitizer import sanitize_text_input, validate_query_safety
from backend.ai.chains.intent_chain import classify_intent
from backend.ai.chains.general_query_chain import general_query_chain
from backend.logging_setup import logger
from backend.ai.chains.run_action_chain import run_action_chain
from backend.ai.chains.apy_query_chain import apy_query_chain

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/", response_model=QueryResponse)
@limiter.limit(f"{security_settings.RATE_LIMIT_PER_MINUTE}/minute")
async def handle_query(
    request: Request,
    user_input: UserQuery,
    response: Response,
) -> QueryResponse:
    """
    Handle a query to the DeFi AI Assistant.
    """
    query_text = sanitize_text_input((user_input.query or "").strip(), max_length=1000)
    if not query_text or not validate_query_safety(query_text):
        raise HTTPException(status_code=400, detail="Invalid or empty query")

    user_id = getattr(user_input, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    client_ip = get_remote_address(request)
    user_agent = request.headers.get("user-agent", "unknown")

    # 🔹 Top-level intent classification
    intent = classify_intent(query_text)

    if intent == "general_query":
        try:
            data = general_query_chain(query_text)
            
            # Ensure that data is a dictionary with answer and action
            if isinstance(data, dict) and "answer" in data and "action" in data:
                answer = data["answer"]
                action = data["action"]
                return QueryResponse(answer=answer, action=action)
            else:
                logger.error(f"Unexpected response format: {data}")
                raise HTTPException(status_code=500, detail="Unexpected response format from general query chain")
        except Exception as e:
            logger.error(f"Error processing general query: {e}")
            raise HTTPException(status_code=500, detail="Error processing query")

    elif intent == "clarification":
        return QueryResponse(answer="Could you please clarify your question?")

    elif intent == "action_intent":
        try:
            # 🔹 now async
            data = await run_action_chain(query_text, user_id)
            
            # Log the raw response from run_action_chain for debugging
            logger.debug(f"Action Intent Response: {data}")
            
            # Ensure the correct format for answer and action
            answer = data.get("answer", "")
            action = data.get("action", False)  # Default to False if action isn't found
            
            # Log final answer and action to be returned
            logger.debug(f"Returning answer: {answer}, action: {action}")
            
            # Check if the answer is empty, just to ensure it's not blank
            if not answer:  # If answer is empty, log it as a warning
                logger.warning("Empty answer received from run_action_chain")
            
            return QueryResponse(answer=answer, action=action)
        except Exception as e:
            logger.error(f"Error running action chain: {e}")
            raise HTTPException(status_code=500, detail="Error executing blockchain action")

    else:
        answer = apy_query_chain()
        return QueryResponse(answer=answer, action=False)
