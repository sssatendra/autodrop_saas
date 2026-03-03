"""Orders API — tenant order and fulfillment listing."""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.api import api_bp
from app.models.tenant import User
from app.models.order import TenantOrder


@api_bp.route("/orders", methods=["GET"])
@jwt_required()
def list_orders():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    pag = (
        TenantOrder.query
        .filter_by(tenant_id=user.tenant_id)
        .order_by(TenantOrder.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )
    return jsonify({
        "items": [_order_dict(o) for o in pag.items],
        "total": pag.total,
        "pages": pag.pages,
        "page": pag.page,
    }), 200


def _order_dict(o: TenantOrder) -> dict:
    ff = o.fulfillment
    return {
        "id": o.id,
        "platform_order_id": o.platform_order_id,
        "customer_name": o.customer_name,
        "customer_email": o.customer_email,
        "quantity": o.quantity,
        "sale_price": float(o.sale_price) if o.sale_price else 0,
        "supplier_cost": float(o.supplier_cost) if o.supplier_cost else 0,
        "profit": float(o.profit) if o.profit else 0,
        "status": o.status.value,
        "product_title": o.tenant_product.custom_title if o.tenant_product else None,
        "store_name": o.store.store_name if o.store else None,
        "fulfillment": {
            "status": ff.status.value,
            "tracking_number": ff.tracking_number,
            "tracking_url": ff.tracking_url,
            "shipping_carrier": ff.shipping_carrier,
            "fulfilled_at": ff.fulfilled_at.isoformat() if ff.fulfilled_at else None,
        } if ff else None,
        "created_at": o.created_at.isoformat(),
    }
