from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)

class StoreClient(ABC):
    """Abstract base class for E-commerce store integrations."""
    
    @abstractmethod
    def push_product(self, product_data: dict) -> dict:
        """Pushes a product to the external store."""
        pass

    @abstractmethod
    def get_orders(self) -> list:
        """Fetches recent orders from the external store."""
        pass


class AdsClient(ABC):
    """Abstract base class for Ad platform integrations."""
    
    @abstractmethod
    def create_campaign(self, campaign_data: dict) -> dict:
        """Creates an ad campaign on the platform."""
        pass

    @abstractmethod
    def get_metrics(self, platform_campaign_id: str) -> dict:
        """Fetches performance metrics for a campaign."""
        pass


class SupplierClient(ABC):
    """Abstract base class for Supplier marketplaces (AliExpress, CJ)."""

    @abstractmethod
    def search_products(self, keyword: str, limit: int = 20) -> list:
        """Search for products by keyword."""
        pass

    @abstractmethod
    def get_trending_products(self) -> list:
        """Fetch current trending/winning products."""
        pass

    @abstractmethod
    def get_product_details(self, platform_id: str) -> dict:
        """Fetch real-time price and stock for a product."""
        pass
