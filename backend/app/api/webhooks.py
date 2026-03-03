import logging
import hmac
import hashlib
from flask import request, jsonify
from app.api import api_bp
from app.extensions import db
from app.models.store import ConnectedStore
from app.models.product import TenantProduct
from app.models.order import TenantOrder, OrderStatus

logger = logging.getLogger(__name__)

@api_bp.route("/webhooks/shopify", methods=["POST"])
def shopify_webhook():
    """Handle Shopify webhooks (orders/paid, orders/fulfilled)."""
    data = request.get_json()
    topic = request.headers.get("X-Shopify-Topic")
    shop_domain = request.headers.get("X-Shopify-Shop-Domain")
    
    logger.info(f"[Shopify Webhook] Received {topic} from {shop_domain}")

    # For development, we find the store by domain
    store = ConnectedStore.query.filter(ConnectedStore.store_url.contains(shop_domain)).first()
    if not store:
        logger.error(f"No store found for domain {shop_domain}")
        return "Store not found", 404

    if topic == "orders/paid":
        _handle_shopify_order_paid(data, store)
    
    return "OK", 200

def _handle_shopify_order_paid(data: dict, store: ConnectedStore):
    """Create a TenantOrder when a Shopify order is paid."""
    for item in data.get("line_items", []):
        tp = TenantProduct.query.filter_by(store_id=store.id, platform_product_id=str(item.get("product_id"))).first()
        
        if tp:
            order = TenantOrder(
                tenant_id=store.tenant_id,
                store_id=store.id,
                tenant_product_id=tp.id,
                platform_order_id=str(data.get("id")),
                customer_email=data.get("customer", {}).get("email"),
                customer_name=f"{data.get('customer', {}).get('first_name')} {data.get('customer', {}).get('last_name')}",
                quantity=item.get("quantity", 1),
                sale_price=float(item.get("price", 0)),
                supplier_cost=float(tp.global_product.supplier_cost if tp.global_product else 0),
                profit=float(item.get("price", 0)) - float(tp.global_product.supplier_cost if tp.global_product else 0),
                status=OrderStatus.PROCESSING
            )
            db.session.add(order)
            db.session.commit()
            logger.info(f"Created TenantOrder for product {tp.id} via Shopify webhook")

@api_bp.route("/webhooks/woocommerce", methods=["POST"])
def woocommerce_webhook():
    """Handle WooCommerce webhooks."""
    data = request.get_json()
    logger.info(f"[WooCommerce Webhook] Order received: {data.get('id')}")
    return "OK", 200
