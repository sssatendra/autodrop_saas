import logging
from app.extensions import db
from app.models.product import TenantProduct, SyncStatus
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
