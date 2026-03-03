"""Campaigns API — ad campaign listing and metrics."""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.api import api_bp
from app.models.tenant import User
from app.models.marketing import AdCampaign


@api_bp.route("/campaigns", methods=["GET"])
@jwt_required()
def list_campaigns():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    pag = (
        AdCampaign.query
        .filter_by(tenant_id=user.tenant_id)
        .order_by(AdCampaign.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )
    items = [_campaign_dict(c) for c in pag.items]
    # compute aggregate metrics
    total_spend = sum(i["total_spend"] for i in items)
    blended_roas = (
        sum(i["roas"] * i["total_spend"] for i in items if i["total_spend"]) / total_spend
        if total_spend else 0
    )
    return jsonify({
        "items": items,
        "total": pag.total,
        "pages": pag.pages,
        "page": pag.page,
        "metrics": {
            "total_spend": round(total_spend, 2),
            "blended_roas": round(blended_roas, 2),
        },
    }), 200


@api_bp.route("/campaigns/<campaign_id>/schedule", methods=["POST"])
@jwt_required()
def schedule_campaign(campaign_id):
    """Manually trigger campaign scheduling."""
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    campaign = AdCampaign.query.filter_by(id=campaign_id, tenant_id=user.tenant_id).first_or_404()
    
    from app.tasks import schedule_campaign_task
    schedule_campaign_task.delay(campaign.id)
    
    return jsonify({"message": "Schedule task triggered.", "status": "pending"}), 202


def _campaign_dict(c: AdCampaign) -> dict:
    return {
        "id": c.id,
        "campaign_name": c.campaign_name,
        "platform": c.platform.value,
        "platform_campaign_id": c.platform_campaign_id,
        "status": c.status.value,
        "daily_budget": float(c.daily_budget) if c.daily_budget else 0,
        "total_spend": float(c.total_spend) if c.total_spend else 0,
        "impressions": c.impressions or 0,
        "clicks": c.clicks or 0,
        "conversions": c.conversions or 0,
        "roas": float(c.roas) if c.roas else 0,
        "product_title": c.tenant_product.custom_title if c.tenant_product else None,
        "created_at": c.created_at.isoformat(),
    }
