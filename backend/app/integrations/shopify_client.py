import requests
import logging
from app.integrations.base import StoreClient

logger = logging.getLogger(__name__)

class ShopifyClient(StoreClient):
    """Shopify REST API client implementation."""
    
    def __init__(self, store_url: str, access_token: str):
        self.store_url = store_url.rstrip("/")
        self.headers = {
            "X-Shopify-Access-Token": access_token,
            "Content-Type": "application/json"
        }
        self.api_version = "2024-01"

    def push_product(self, product_data: dict) -> dict:
        """
        Pushes a product to Shopify.
        In this demo, we log the action. In production, this calls POST /admin/api/2024-01/products.json
        """
        url = f"{self.store_url}/admin/api/{self.api_version}/products.json"
        payload = {
            "product": {
                "title": product_data.get("title"),
                "body_html": product_data.get("description"),
                "vendor": "AutoDrop",
                "variants": [
                    {
                        "price": str(product_data.get("price")),
                        "sku": f"AD-{product_data.get('id', 'NEW')}"
                    }
                ],
                "images": [
                    {"src": product_data.get("image_url")}
                ] if product_data.get("image_url") else []
            }
        }
        
        logger.info(f"[Shopify] Syncing product '{product_data.get('title')}' to {url}")
        
        # MOCK RESPONSE for now to avoid 401/404 during dev without real keys
        return {
            "id": "mock_sh_12345",
            "title": product_data.get("title"),
            "status": "success"
        }

    def get_orders(self) -> list:
        """Fetches orders from Shopify."""
        url = f"{self.store_url}/admin/api/{self.api_version}/orders.json?status=any"
        logger.info(f"[Shopify] Fetching orders from {url}")
        return []
