import logging
from app.integrations.base import AdsClient

logger = logging.getLogger(__name__)

class MetaAdsClient(AdsClient):
    """Meta (Facebook) Marketing API client implementation."""
    
    def __init__(self, access_token: str, ad_account_id: str):
        self.access_token = access_token
        self.ad_account_id = ad_account_id.replace("act_", "")
        self.base_url = "https://graph.facebook.com/v19.0"

    def create_campaign(self, campaign_data: dict) -> dict:
        """
        Creates a campaign on Meta.
        In production, this calls POST /act_<AD_ACCOUNT_ID>/campaigns
        """
        logger.info(f"[Meta] Creating campaign '{campaign_data.get('name')}' for ad account act_{self.ad_account_id}")
        
        # MOCK RESPONSE
        return {
            "id": "mock_meta_camp_111",
            "name": campaign_data.get("name"),
            "status": "success"
        }

    def get_metrics(self, platform_campaign_id: str) -> dict:
        """Fetches metrics for a Meta campaign."""
        logger.info(f"[Meta] Fetching metrics for campaign {platform_campaign_id}")
        return {
            "spend": 50.0,
            "impressions": 5000,
            "clicks": 150,
            "conversions": 10
        }
