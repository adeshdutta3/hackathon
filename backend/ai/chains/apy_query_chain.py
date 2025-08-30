from backend.utils.apy import get_top_low_yield_apy_pools
from backend.logging_setup import logger

def apy_query_chain() -> str:
    """Process an APY-related query and return the top APY pools formatted as a string."""
    try:
        # Fetch APY data (List of dictionaries)
        apy_data = get_top_low_yield_apy_pools()

        if isinstance(apy_data, list) and len(apy_data) > 0:
            # Build a string representation of the APY pools
            apy_message = "Here are the top 3 APY pools with yields less than 20%:\n"
            for i, pool in enumerate(apy_data, 1):
                apy_message += f"\n{i}. {pool['protocol']} - {pool['coinpair']} (APY: {pool['apy_percentage']}%)"
                apy_message += f"\n   TVL: ${pool['tvl_usd']:,} USD, Chain: {pool['chain']}\n"
            
            return apy_message
        else:
            return "Sorry, no APY data found or there was an issue fetching it."
        
    except Exception as e:
        logger.error(f"Error processing APY query chain: {e}")
        return f"Failed to fetch or process APY data: {str(e)}"
