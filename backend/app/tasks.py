import logging
from app.extensions import db
from app.models.product import TenantProduct, GlobalProduct, SyncStatus, ProductStatus
from app.models.marketing import AdCampaign, CampaignStatus
from app.integrations.factory import IntegrationFactory
from app.celery_app import celery

logger = logging.getLogger(__name__)

@celery.task
def sync_product_task(tenant_product_id: str):
    """Celery task to push a tenant product to its connected store."""
    tp = TenantProduct.query.get(tenant_product_id)
    if not tp:
        logger.error(f"TenantProduct {tenant_product_id} not found.")
        return

    if not tp.store:
        logger.error(f"TenantProduct {tenant_product_id} has no connected store.")
        return

    try:
        tp.sync_status = SyncStatus.SYNCING
        db.session.commit()

        client = IntegrationFactory.get_store_client(tp.store)
        product_data = {
            "id": tp.id,
            "title": tp.custom_title,
            "description": tp.custom_description,
            "price": tp.custom_price,
            "image_url": tp.global_product.image_url if tp.global_product else None
        }

        result = client.push_product(product_data)
        
        tp.platform_product_id = result.get("id")
        tp.sync_status = SyncStatus.SYNCED
        db.session.commit()
        
        logger.info(f"Successfully synced product {tp.id} to {tp.store.platform.value}")

    except Exception as e:
        logger.exception(f"Failed to sync product {tp.id}")
        tp.sync_status = SyncStatus.FAILED
        db.session.commit()


@celery.task
def schedule_campaign_task(campaign_id: str):
    """Celery task to create/schedule a campaign on an ad platform."""
    campaign = AdCampaign.query.get(campaign_id)
    if not campaign:
        logger.error(f"AdCampaign {campaign_id} not found.")
        return

    # Find the integration for this platform
    from app.models.integration import TenantIntegration
    integration = TenantIntegration.query.filter_by(
        tenant_id=campaign.tenant_id,
        platform=campaign.platform.value # This might need enum adjustment
    ).first()

    if not integration:
        logger.error(f"No integration found for platform {campaign.platform.value}")
        return

    try:
        client = IntegrationFactory.get_ads_client(integration)
        campaign_data = {
            "name": campaign.campaign_name,
            "budget": float(campaign.daily_budget)
        }

        result = client.create_campaign(campaign_data)
        
        campaign.platform_campaign_id = result.get("id")
        campaign.status = CampaignStatus.ACTIVE
        db.session.commit()
        
        logger.info(f"Successfully scheduled campaign {campaign.id} on {campaign.platform.value}")

    except Exception as e:
        logger.exception(f"Failed to schedule campaign {campaign.id}")
        db.session.rollback()


@celery.task
def discover_winning_products_task(tenant_id: str = None):
    """
    Automated discovery engine. 
    If tenant_id is provided, uses that tenant's specific credentials.
    Otherwise, runs for all active integrations.
    """
    from app.models.integration import TenantIntegration, IntegrationPlatform
    
    logger.info(f"Starting Supplier Discovery Engine task (Tenant: {tenant_id or 'ALL'})...")
    
    # 1. Determine which integrations to run
    query = TenantIntegration.query.filter_by(is_active=True)
    if tenant_id:
        query = query.filter_by(tenant_id=tenant_id)
    
    integrations = query.filter(
        TenantIntegration.platform.in_([IntegrationPlatform.ALIEXPRESS, IntegrationPlatform.CJ])
    ).all()

    if not integrations:
        logger.warning("No active supplier integrations found to run discovery.")
        return

    for integration in integrations:
        s_name = integration.platform.value
        try:
            # Pass credentials from integration
            api_key = integration.credentials.get("api_key")
            client = AliExpressScraper(api_key=api_key) if integration.platform == IntegrationPlatform.ALIEXPRESS else CJScraper(api_key=api_key)
            
            trending = client.get_trending_products()
            new_products_count = 0
            
            for item in trending:
                # Upsert logic
                existing = GlobalProduct.query.filter_by(
                    source_platform=s_name, 
                    title=item["title"]
                ).first()
                
                if existing:
                    existing.supplier_cost = item["supplier_cost"]
                    existing.estimated_retail_price = item["retail_price"]
                    existing.multi_factor_score = _calculate_mfs(item)
                    continue

                gp = GlobalProduct(
                    title=item["title"],
                    description=item["description"],
                    image_url=item["image_url"],
                    supplier_url=item["supplier_url"],
                    supplier_cost=item["supplier_cost"],
                    estimated_retail_price=item["retail_price"],
                    category="Trending",
                    source_platform=s_name,
                    multi_factor_score=_calculate_mfs(item),
                    status=ProductStatus.ACTIVE
                )
                db.session.add(gp)
                new_products_count += 1
                
            db.session.commit()
            logger.info(f"Discovery complete for {s_name} (Tenant: {integration.tenant_id}). Added {new_products_count} entries.")
            
        except Exception as e:
            logger.error(f"Discovery failed for {s_name}: {e}")
            db.session.rollback()

def _calculate_mfs(item: dict) -> float:
    """
    Multi-Factor Scoring (MFS) ROI algorithm.
    Weights: 40% Margin, 30% Demand (Orders), 30% Rating
    """
    cost = float(item["supplier_cost"])
    retail = float(item["retail_price"])
    margin_pct = ((retail - cost) / retail) if retail > 0 else 0
    
    # Normalize Demand (assuming 500 orders is top 10/10)
    demand_score = min(float(item.get("orders", 0)) / 500, 1.0)
    
    # Normalize Rating (assuming 5.0 is 10/10)
    rating_score = float(item.get("rating", 0)) / 5.0
    
    # Weighted Average
    mfs = (0.4 * margin_pct * 100) + (0.3 * demand_score * 100) + (0.3 * rating_score * 100)
    return round(mfs, 1)
