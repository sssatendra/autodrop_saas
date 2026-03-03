import logging
import requests
from app.integrations.base import AdsClient

logger = logging.getLogger(__name__)

class GoogleAdsClient(AdsClient):
    """Google Ads API client implementation (REST)."""
    
    def __init__(self, developer_token: str, customer_id: str, access_token: str = None):
        self.developer_token = developer_token
        self.customer_id = customer_id.replace("-", "")
        self.access_token = access_token
        self.version = "v16"
        self.base_url = f"https://googleads.googleapis.com/{self.version}"

    def create_campaign(self, campaign_data: dict) -> dict:
        """
        Creates a campaign on Google Ads.
        Calls POST /customers/{customer_id}/campaigns:mutate
        """
        logger.info(f"[Google Ads] Creating campaign '{campaign_data.get('name')}' for customer {self.customer_id}")
        
        endpoint = f"{self.base_url}/customers/{self.customer_id}/campaigns:mutate"
        
        headers = {
            "developer-token": self.developer_token,
            "login-customer-id": self.customer_id,
            "Authorization": f"Bearer {self.access_token}"
        }
        
        # Simple Search Campaign payload
        payload = {
            "operations": [
                {
                    "create": {
                        "name": campaign_data.get("name"),
                        "advertising_channel_type": "SEARCH",
                        "status": "PAUSED",
                        "manual_cpc": {}, # Example bidding strategy
                        "campaign_budget": f"customers/{self.customer_id}/campaignBudgets/mock_budget_id",
                        "network_settings": {
                            "target_google_search": True,
                            "target_search_network": True,
                        }
                    }
                }
            ]
        }
        
        try:
            response = requests.post(endpoint, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            logger.info(f"[Google Ads] Success: Mutation results {result}")
            # Note: actual ID is inside result['results'][0]['resourceName']
            return result
        except Exception as e:
            logger.error(f"[Google Ads] API Error: {e}")
            raise

    def get_metrics(self, platform_campaign_id: str) -> dict:
        """Fetches metrics for a Google Ads campaign using GAQL."""
        logger.info(f"[Google Ads] Fetching metrics for campaign {platform_campaign_id}")
        
        endpoint = f"{self.base_url}/customers/{self.customer_id}/googleAds:search"
        headers = {
            "developer-token": self.developer_token,
            "login-customer-id": self.customer_id,
            "Authorization": f"Bearer {self.access_token}"
        }
        
        query = f"""
            SELECT 
                metrics.cost_micros, 
                metrics.impressions, 
                metrics.clicks, 
                metrics.conversions 
            FROM campaign 
            WHERE campaign.id = '{platform_campaign_id.split('/')[-1]}'
        """
        
        payload = {"query": query}
        
        try:
            response = requests.post(endpoint, json=payload, headers=headers)
            response.raise_for_status()
            results = response.json().get("results", [])
            
            if not results:
                return {"spend": 0, "impressions": 0, "clicks": 0, "conversions": 0}
                
            metrics = results[0].get("metrics", {})
            return {
                "spend": float(metrics.get("costMicros", 0)) / 1_000_000,
                "impressions": int(metrics.get("impressions", 0)),
                "clicks": int(metrics.get("clicks", 0)),
                "conversions": float(metrics.get("conversions", 0))
            }
        except Exception as e:
            logger.error(f"[Google Ads] Search Error: {e}")
            return {"spend": 0, "impressions": 0, "clicks": 0, "conversions": 0}
