import os
import hmac
import hashlib
import requests
from flask import request, jsonify, redirect, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.api import api_bp
from app.extensions import db
from app.models.tenant import User
from app.models.store import ConnectedStore, StorePlatform


@api_bp.route("/stores", methods=["GET"])
@jwt_required()
def list_stores():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    stores = ConnectedStore.query.filter_by(tenant_id=user.tenant_id).all()
    return jsonify({"stores": [_store_dict(s) for s in stores]}), 200


@api_bp.route("/stores/connect", methods=["POST"])
@jwt_required()
def connect_store():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    data = request.get_json(silent=True) or {}
    
    platform_val = data.get("platform")
    store_url = data.get("store_url")
    store_name = data.get("store_name")
    
    if not platform_val or not store_url:
        return jsonify({"error": "platform and store_url are required."}), 422
    
    try:
        platform = StorePlatform(platform_val)
    except ValueError:
        return jsonify({"error": f"Invalid platform. Must be {[p.value for p in StorePlatform]}"}), 422

    # Handle manual connection/mocking
    # In a real app, Shopify would use OAuth, WooCommerce would use consumer keys
    metadata = {}
    if platform == StorePlatform.WOOCOMMERCE:
        metadata["consumer_key"] = data.get("consumer_key")
        metadata["consumer_secret"] = data.get("consumer_secret")
        if not metadata["consumer_key"] or not metadata["consumer_secret"]:
            return jsonify({"error": "WooCommerce requires consumer_key and consumer_secret."}), 422
    
    elif platform == StorePlatform.SHOPIFY:
        # For simplicity in this demo, we'll allow an access_token directly or mock it
        access_token = data.get("access_token")
        if not access_token:
            return jsonify({"error": "Shopify requires an access_token."}), 422

    store = ConnectedStore(
        tenant_id=user.tenant_id,
        platform=platform,
        store_name=store_name or f"{platform_val.capitalize()} Store",
        store_url=store_url,
        access_token=data.get("access_token"),
        platform_metadata=metadata,
        is_active=True
    )
    
    db.session.add(store)
    db.session.commit()
    
    return jsonify({"store": _store_dict(store)}), 201


@api_bp.route("/stores/shopify/authorize", methods=["GET"])
@jwt_required()
def shopify_authorize():
    shop = request.args.get("shop")
    if not shop:
        return jsonify({"error": "shop parameter is required"}), 400
    
    # Ensure .myshopify.com
    if not shop.endswith(".myshopify.com"):
        shop = f"{shop}.myshopify.com"
        
    api_key = current_app.config.get("SHOPIFY_API_KEY")
    redirect_uri = current_app.config.get("SHOPIFY_REDIRECT_URI")
    scopes = "read_products,write_products,read_orders,write_orders"
    
    # Store user identity in state or a temporary session (for simplicity we use a mock state here)
    # In production, use a signed state token
    state = get_jwt_identity() 
    
    auth_url = f"https://{shop}/admin/oauth/authorize?client_id={api_key}&scope={scopes}&redirect_uri={redirect_uri}&state={state}"
    return jsonify({"url": auth_url}), 200


@api_bp.route("/stores/shopify/callback", methods=["GET"])
def shopify_callback():
    params = request.args.to_dict()
    hmac_val = params.pop("hmac", None)
    code = params.get("code")
    shop = params.get("shop")
    state = params.get("state") # This is our user_id
    
    if not hmac_val or not code or not shop or not state:
        return "Invalid request parameters", 400
    
    # Verify HMAC
    api_secret = current_app.config.get("SHOPIFY_API_SECRET")
    message = "&".join([f"{k}={v}" for k, v in sorted(params.items())])
    hash_hmac = hmac.new(api_secret.encode(), message.encode(), hashlib.sha256).hexdigest()
    
    if not hmac.compare_digest(hash_hmac, hmac_val):
        return "HMAC verification failed", 401
    
    # Exchange code for access token
    api_key = current_app.config.get("SHOPIFY_API_KEY")
    token_url = f"https://{shop}/admin/oauth/access_token"
    token_payload = {
        "client_id": api_key,
        "client_secret": api_secret,
        "code": code
    }
    
    response = requests.post(token_url, json=token_payload)
    if response.status_code != 200:
        return "Failed to exchange code for token", 400
        
    token_data = response.json()
    access_token = token_data.get("access_token")
    
    # Save the store
    user = User.query.get(state)
    if not user:
        return "User not found", 404
        
    # Get shop info for the name
    shop_info_url = f"https://{shop}/admin/api/2024-01/shop.json"
    shop_res = requests.get(shop_info_url, headers={"X-Shopify-Access-Token": access_token})
    shop_name = shop
    if shop_res.status_code == 200:
        shop_name = shop_res.json().get("shop", {}).get("name", shop)

    store = ConnectedStore(
        tenant_id=user.tenant_id,
        platform=StorePlatform.SHOPIFY,
        store_name=shop_name,
        store_url=f"https://{shop}",
        access_token=access_token,
        is_active=True
    )
    
    db.session.add(store)
    db.session.commit()
    
    # Redirect back to frontend
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    return redirect(f"{frontend_url}/app/stores?status=success")



@api_bp.route("/stores/<store_id>", methods=["GET"])
@jwt_required()
def get_store(store_id):
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    store = ConnectedStore.query.filter_by(id=store_id, tenant_id=user.tenant_id).first_or_404()
    return jsonify({"store": _store_dict(store)}), 200


@api_bp.route("/stores/<store_id>", methods=["DELETE"])
@jwt_required()
def delete_store(store_id):
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    store = ConnectedStore.query.filter_by(id=store_id, tenant_id=user.tenant_id).first_or_404()
    db.session.delete(store)
    db.session.commit()
    return jsonify({"message": "Store disconnected."}), 200


def _store_dict(s: ConnectedStore) -> dict:
    return {
        "id": s.id,
        "platform": s.platform.value,
        "store_name": s.store_name,
        "store_url": s.store_url,
        "is_active": s.is_active,
        "last_synced_at": s.last_synced_at.isoformat() if s.last_synced_at else None,
        "created_at": s.created_at.isoformat(),
    }
