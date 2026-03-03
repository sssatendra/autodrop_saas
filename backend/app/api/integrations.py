"""Integrations API — manage ad platform credentials."""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.api import api_bp
from app.extensions import db
from app.models.tenant import User
from app.models.integration import TenantIntegration, IntegrationPlatform


@api_bp.route("/integrations", methods=["GET"])
@jwt_required()
def list_integrations():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    integrations = TenantIntegration.query.filter_by(tenant_id=user.tenant_id).all()
    return jsonify({
        "integrations": [
            {
                "platform": i.platform.value,
                "is_active": i.is_active,
                "created_at": i.created_at.isoformat(),
                # Do NOT return full credentials, just a presence flag
                "has_credentials": True if i.credentials else False
            } for i in integrations
        ]
    }), 200


@api_bp.route("/integrations/connect", methods=["POST"])
@jwt_required()
def connect_integration():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    data = request.get_json(silent=True) or {}
    
    platform_val = data.get("platform")
    credentials = data.get("credentials")
    
    if not platform_val or not credentials:
        return jsonify({"error": "platform and credentials are required."}), 422
    
    try:
        platform = IntegrationPlatform(platform_val)
    except ValueError:
        return jsonify({"error": f"Invalid platform. Must be {[p.value for p in IntegrationPlatform]}"}), 422

    # Validate based on platform (basic check)
    if platform == IntegrationPlatform.META:
        if not credentials.get("access_token") or not credentials.get("ad_account_id"):
            return jsonify({"error": "Meta integration requires access_token and ad_account_id."}), 422
    elif platform == IntegrationPlatform.GOOGLE:
        if not credentials.get("developer_token") or not credentials.get("customer_id"):
            return jsonify({"error": "Google Ads integration requires developer_token and customer_id."}), 422

    # Update or Create
    integration = TenantIntegration.query.filter_by(
        tenant_id=user.tenant_id, 
        platform=platform
    ).first()
    
    if not integration:
        integration = TenantIntegration(
            tenant_id=user.tenant_id,
            platform=platform,
            credentials=credentials,
            is_active=True
        )
        db.session.add(integration)
    else:
        integration.credentials = credentials
        integration.is_active = True
    
    db.session.commit()
    
    return jsonify({
        "platform": integration.platform.value,
        "is_active": integration.is_active
    }), 200


@api_bp.route("/integrations/<platform>", methods=["DELETE"])
@jwt_required()
def disconnect_integration(platform):
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    try:
        platform_enum = IntegrationPlatform(platform)
    except ValueError:
        return jsonify({"error": "Invalid platform"}), 400
        
    integration = TenantIntegration.query.filter_by(
        tenant_id=user.tenant_id, 
        platform=platform_enum
    ).first_or_404()
    
    db.session.delete(integration)
    db.session.commit()
    
    return jsonify({"message": f"{platform} disconnected successfully."}), 200
