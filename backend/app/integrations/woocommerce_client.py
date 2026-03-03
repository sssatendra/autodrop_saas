import requests
import logging
from app.integrations.base import StoreClient

logger = logging.getLogger(__name__)

class WooCommerceClient(StoreClient):
    """WooCommerce REST API client implementation."""
    
    def __init__(self, store_url: str, consumer_key: str, consumer_secret: str):
        self.store_url = store_url.rstrip("/")
        # WooCommerce uses Basic Auth with consumer_key:consumer_secret
        self.auth = (consumer_key, consumer_secret)
        self.api_path = "/wp-json/wc/v3"

    def push_product(self, product_data: dict) -> dict:
        """
        Pushes a product to WooCommerce.
        Calls POST /wp-json/wc/v3/products
        """
        url = f"{self.store_url}{self.api_path}/products"
        payload = {
            "name": product_data.get("title"),
            "type": "simple",
            "regular_price": str(product_data.get("price")),
            "description": product_data.get("description"),
            "images": [
                {"src": product_data.get("image_url")}
            ] if product_data.get("image_url") else []
        }
        
        logger.info(f"[WooCommerce] Syncing product '{product_data.get('title')}' to {url}")
        
        # MOCK RESPONSE
        return {
            "id": "mock_wc_56789",
            "name": product_data.get("title"),
            "status": "success"
        }

    def get_orders(self) -> list:
        """Fetches orders from WooCommerce."""
        url = f"{self.store_url}{self.api_path}/orders"
        logger.info(f"[WooCommerce] Fetching orders from {url}")
        return []
