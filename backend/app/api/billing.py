import os
import logging
import stripe
import razorpay
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.api import api_bp
from app.extensions import db
from app.models.tenant import User, Subscription, PlanTier, BillingGateway, SubscriptionStatus


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


@api_bp.route("/billing/create-checkout", methods=["POST"])
@jwt_required()
def create_checkout():
    user = User.query.get(get_jwt_identity())
    data = request.get_json()
    tier_val = data.get("plan_tier")
    gateway_val = data.get("gateway", "stripe") # default to stripe

    try:
        tier = PlanTier(tier_val)
        gateway = BillingGateway(gateway_val)
    except ValueError:
        return jsonify({"error": "Invalid plan or gateway"}), 400

    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    if gateway == BillingGateway.STRIPE:
        stripe.api_key = current_app.config.get("STRIPE_SECRET_KEY")
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "usd",
                        "product_data": {"name": f"AutoDrop {tier.value.capitalize()} Plan"},
                        "unit_amount": 2900 if tier == PlanTier.STARTER else 7900 if tier == PlanTier.PRO else 19900,
                    },
                    "quantity": 1,
                }],
                mode="subscription",
                success_url=f"{frontend_url}/app/billing?success=true",
                cancel_url=f"{frontend_url}/app/billing?canceled=true",
                metadata={"tenant_id": user.tenant_id, "plan_tier": tier.value}
            )
            return jsonify({"url": session.url})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif gateway == BillingGateway.RAZORPAY:
        # Minimalist Razorpay Order creation
        client = razorpay.Client(
            auth=(current_app.config.get("RAZORPAY_KEY_ID"), current_app.config.get("RAZORPAY_KEY_SECRET"))
        )
        amount = 250000 if tier == PlanTier.STARTER else 650000 # in paise
        order_data = {
            "amount": amount,
            "currency": "INR",
            "receipt": f"rcpt_{user.tenant_id[:10]}",
            "notes": {"tenant_id": user.tenant_id, "plan_tier": tier.value}
        }
        try:
            order = client.order.create(data=order_data)
            return jsonify({"order": order, "key_id": current_app.config.get("RAZORPAY_KEY_ID")})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Gateway not implemented"}), 501


@api_bp.route("/billing/webhook/stripe", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")
    endpoint_secret = current_app.config.get("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except Exception as e:
        return "Invalid payload", 400

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        _handle_successful_payment(session)

    return "OK", 200

def _handle_successful_payment(session):
    tenant_id = session.get("metadata", {}).get("tenant_id")
    plan_tier = session.get("metadata", {}).get("plan_tier")
    
    if tenant_id and plan_tier:
        sub = Subscription.query.filter_by(tenant_id=tenant_id).first()
        if sub:
            sub.plan_tier = PlanTier(plan_tier)
            sub.status = SubscriptionStatus.ACTIVE
            sub.billing_gateway = BillingGateway.STRIPE
            sub.gateway_customer_id = session.get("customer")
            sub.gateway_subscription_id = session.get("subscription")
            db.session.commit()
            logger.info(f"Updated subscription for tenant {tenant_id} to {plan_tier}")
