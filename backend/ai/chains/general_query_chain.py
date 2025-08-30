from backend.utils.db_query import query_db
from backend.logging_setup import logger
from backend.utils.model_selector import tiny_model, mini_model
from langsmith import traceable


@traceable(name="Tiny Model Response")
def gpt_tiny_response(query: str, context: str) -> str:
    """Generate rephrased response using the tiny model."""
    model = tiny_model()
    prompt = (
        "You are a DeFi assistant. "
        "Rephrase the following answer. "
        "Respond only if the query is strictly about Decentralized Finance (DeFi). "
        "If the query is not about DeFi, reply with: 'I can only answer DeFi-related questions.'\n\n"
        f"Query: {query}\n\n"
        f"Answer: {context}\n\n"
        "Rephrased Answer:"
    )

    try:
        response = model.invoke(prompt)
        # Extract string content from AIMessage object
        if hasattr(response, 'content'):
            return response.content
        return str(response)
    except Exception as e:
        logger.error(f"Tiny model prediction failed: {e}")
        return "I can only answer DeFi-related questions."


@traceable(name="Mini Model Response")
def gpt_mini_response(query: str) -> str:
    """Generate response using the mini model."""
    model = mini_model()
    prompt = (
        "You are a DeFi assistant. "
        "Respond only to queries strictly related to Decentralized Finance (DeFi) or Greetings. "
        "If the query is not about DeFi or greetings, respond with: 'I can only answer DeFi-related questions' strictly, nothing else.\n\n"
        f"Query: {query}\n\n"
        "Answer:"
    )
    try:
        response = model.invoke(prompt)
        # Extract string content from AIMessage object
        if hasattr(response, 'content'):
            return response.content
        return str(response)
    except Exception as e:
        logger.error(f"Mini model prediction failed: {e}")
        return "I can only answer DeFi-related questions."


def general_query_chain(query: str) -> dict:
    """Process a general query and return an answer."""
    try:
        res = query_db(query)  # returns a dict
        result = res["answer"]
        confidence = res["confidence"]
        print(res)

        # If confidence is high enough, return the result directly
        if confidence > 0.7:
            return {"answer": result, "action": False}
        
        # If confidence is moderate, use GPT tiny model to rephrase
        elif confidence > 0.6:
            return {"answer": gpt_tiny_response(query, result), "action": False}
        
        # If confidence is low, use GPT mini model for a more generalized response
        else:
            return {"answer": gpt_mini_response(query), "action": False}
    except Exception as e:
        logger.error(f"Error processing general query: {e}")
        return {"answer": gpt_mini_response(query), "action": False}
