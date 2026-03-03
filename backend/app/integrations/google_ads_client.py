import logging
from app.integrations.base import AdsClient

logger = logging.getLogger(__name__)

class GoogleAdsClient(AdsClient):
    """Google Ads API client implementation."""
    
    def __init__(self, developer_token: str, customer_id: str):
        self.developer_token = developer_token
        self.customer_id = customer_id.replace("-", "")
        # Google Ads uses a complex gRPC/REST discovery service

    def create_campaign(self, campaign_data: dict) -> dict:
        """
        Creates a campaign on Google Ads.
        Calls the Google Ads API service.
        """
        logger.info(f"[Google Ads] Creating campaign '{campaign_data.get('name')}' for customer ID {self.customer_id}")
        
        # MOCK RESPONSE
        return {
            "id": "mock_google_camp_222",
            "resource_name": f"customers/{self.customer_id}/campaigns/mock_google_camp_222",
            "status": "success"
        }

    def get_metrics(self, platform_campaign_id: str) -> dict:
        """Fetches metrics for a Google Ads campaign."""
        logger.info(f"[Google Ads] Fetching metrics for campaign {platform_campaign_id}")
        return {
            "spend": 75.0,
            "impressions": 8000,
            "clicks": 200,
            "conversions": 15
        }
