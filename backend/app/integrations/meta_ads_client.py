import logging
import requests
from app.integrations.base import AdsClient

logger = logging.getLogger(__name__)

class MetaAdsClient(AdsClient):
    """Meta (Facebook) Marketing API client implementation."""
    
    def __init__(self, access_token: str, ad_account_id: str):
        self.access_token = access_token
        # Ensure account ID is in 'act_12345' format
        self.ad_account_id = f"act_{ad_account_id.replace('act_', '')}"
        self.base_url = "https://graph.facebook.com/v19.0"

    def create_campaign(self, campaign_data: dict) -> dict:
        """
        Creates a campaign on Meta.
        Calls POST /act_<AD_ACCOUNT_ID>/campaigns
        """
        logger.info(f"[Meta] Creating campaign '{campaign_data.get('name')}' for ad account {self.ad_account_id}")
        
        endpoint = f"{self.base_url}/{self.ad_account_id}/campaigns"
        
        payload = {
            "name": campaign_data.get("name"),
            "objective": campaign_data.get("objective", "OUTCOME_SALES"),
            "status": "PAUSED", # Default to PAUSED for safety
            "special_ad_categories": "NONE",
            "daily_budget": int(float(campaign_data.get("budget", 0)) * 100), # Meta uses subunits
            "access_token": self.access_token
        }
        
        try:
            response = requests.post(endpoint, data=payload)
            response.raise_for_status()
            result = response.json()
            logger.info(f"[Meta] Success: Created campaign {result.get('id')}")
            return result
        except Exception as e:
            logger.error(f"[Meta] API Error: {e}")
            raise

    def get_metrics(self, platform_campaign_id: str) -> dict:
        """Fetches insights for a Meta campaign."""
        logger.info(f"[Meta] Fetching insights for campaign {platform_campaign_id}")
        
        endpoint = f"{self.base_url}/{platform_campaign_id}/insights"
        params = {
            "fields": "spend,impressions,clicks,actions",
            "access_token": self.access_token
        }
        
        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            data = response.json().get("data", [])
            
            if not data:
                return {"spend": 0, "impressions": 0, "clicks": 0, "conversions": 0}
                
            insights = data[0]
            conversions = 0
            for action in insights.get("actions", []):
                if action.get("action_type") == "offsite_conversion.fb_pixel_purchase":
                    conversions = int(action.get("value", 0))
                    
            return {
                "spend": float(insights.get("spend", 0)),
                "impressions": int(insights.get("impressions", 0)),
                "clicks": int(insights.get("clicks", 0)),
                "conversions": conversions
            }
        except Exception as e:
            logger.error(f"[Meta] Insights Error: {e}")
            return {"spend": 0, "impressions": 0, "clicks": 0, "conversions": 0}
