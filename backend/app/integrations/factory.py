from app.models.store import StorePlatform
from app.models.integration import IntegrationPlatform
from app.integrations.shopify_client import ShopifyClient
from app.integrations.woocommerce_client import WooCommerceClient
from app.integrations.meta_ads_client import MetaAdsClient
from app.integrations.google_ads_client import GoogleAdsClient

class IntegrationFactory:
    """Factory to instantiate integration clients based on platform."""
    
    @staticmethod
    def get_store_client(store):
        """Returns a StoreClient instance for the given ConnectedStore."""
        if store.platform == StorePlatform.SHOPIFY:
            return ShopifyClient(
                store_url=store.store_url,
                access_token=store.access_token
            )
        elif store.platform == StorePlatform.WOOCOMMERCE:
            return WooCommerceClient(
                store_url=store.store_url,
                consumer_key=store.platform_metadata.get("consumer_key"),
                consumer_secret=store.platform_metadata.get("consumer_secret")
            )
        else:
            raise ValueError(f"Unsupported store platform: {store.platform}")

    @staticmethod
    def get_ads_client(integration):
        """Returns an AdsClient instance for the given TenantIntegration."""
        if integration.platform == IntegrationPlatform.META:
            return MetaAdsClient(
                access_token=integration.credentials.get("access_token"),
                ad_account_id=integration.credentials.get("ad_account_id")
            )
        elif integration.platform == IntegrationPlatform.GOOGLE:
            return GoogleAdsClient(
                developer_token=integration.credentials.get("developer_token"),
                customer_id=integration.credentials.get("customer_id")
            )
        else:
            raise ValueError(f"Unsupported ads platform: {integration.platform}")
