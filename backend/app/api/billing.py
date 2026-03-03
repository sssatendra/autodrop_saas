"""Billing API — subscription info and plan usage."""
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.api import api_bp
from app.models.tenant import User


@api_bp.route("/billing", methods=["GET"])
@jwt_required()
def billing_info():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    tenant = user.tenant
    sub = tenant.subscription

    # Count usage
    store_count = tenant.stores.count()
    product_count = tenant.products.count()

    plan_limits = {
        "free":       {"stores": 1, "products": 5},
        "starter":    {"stores": 1, "products": 50},
        "pro":        {"stores": 3, "products": 999999},
        "enterprise": {"stores": 999999, "products": 999999},
    }
    tier = sub.plan_tier.value if sub else "free"
    limits = plan_limits.get(tier, plan_limits["free"])

    return jsonify({
        "subscription": {
            "plan_tier": tier,
            "status": sub.status.value if sub else None,
            "billing_gateway": sub.billing_gateway.value if sub and sub.billing_gateway else None,
            "current_period_end": sub.current_period_end.isoformat() if sub and sub.current_period_end else None,
        } if sub else None,
        "usage": {
            "stores": {"current": store_count, "limit": limits["stores"]},
            "products": {"current": product_count, "limit": limits["products"]},
        },
    }), 200
