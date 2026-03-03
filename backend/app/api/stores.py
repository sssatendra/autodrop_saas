"""Stores API — list connected stores for the tenant."""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.api import api_bp
from app.extensions import db
from app.models.tenant import User
from app.models.store import ConnectedStore


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
