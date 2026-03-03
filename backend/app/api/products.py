"""Products API — tenant product management."""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.api import api_bp
from app.extensions import db
from app.models.tenant import User
from app.models.product import TenantProduct, GlobalProduct, SyncStatus
from app.models.store import ConnectedStore


@api_bp.route("/products", methods=["GET"])
@jwt_required()
def list_products():
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    pag = (
        TenantProduct.query
        .filter_by(tenant_id=user.tenant_id)
        .order_by(TenantProduct.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )
    return jsonify({
        "items": [_tp_dict(p) for p in pag.items],
        "total": pag.total,
        "pages": pag.pages,
        "page": pag.page,
    }), 200


@api_bp.route("/products/import", methods=["POST"])
@jwt_required()
def import_product():
    """Import a global product into a tenant store."""
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    data = request.get_json(silent=True) or {}
    global_product_id = data.get("global_product_id")
    store_id = data.get("store_id")
    if not global_product_id or not store_id:
        return jsonify({"error": "global_product_id and store_id are required."}), 422

    gp = GlobalProduct.query.get_or_404(global_product_id)
    store = ConnectedStore.query.filter_by(id=store_id, tenant_id=user.tenant_id).first_or_404()

    existing = TenantProduct.query.filter_by(
        tenant_id=user.tenant_id,
        store_id=store.id,
        global_product_id=gp.id,
    ).first()
    if existing:
        return jsonify({"error": "Product already imported to this store."}), 409

    tp = TenantProduct(
        tenant_id=user.tenant_id,
        store_id=store.id,
        global_product_id=gp.id,
        custom_title=gp.title,
        custom_description=gp.description,
        custom_price=gp.estimated_retail_price,
        sync_status=SyncStatus.PENDING,
    )
    db.session.add(tp)
    db.session.commit()
    
    # Auto-trigger sync on import
    from app.tasks import sync_product_task
    sync_product_task.delay(tp.id)
    
    return jsonify({"product": _tp_dict(tp)}), 201


@api_bp.route("/products/<product_id>/sync", methods=["POST"])
@jwt_required()
def sync_product(product_id):
    """Manually trigger product sync."""
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "User not found"}), 401
    
    tp = TenantProduct.query.filter_by(id=product_id, tenant_id=user.tenant_id).first_or_404()
    
    from app.tasks import sync_product_task
    sync_product_task.delay(tp.id)
    
    return jsonify({"message": "Sync task triggered.", "status": "pending"}), 202


def _tp_dict(p: TenantProduct) -> dict:
    gp = p.global_product
    store = p.store
    return {
        "id": p.id,
        "custom_title": p.custom_title,
        "custom_description": p.custom_description,
        "custom_price": float(p.custom_price) if p.custom_price else None,
        "platform_product_id": p.platform_product_id,
        "sync_status": p.sync_status.value,
        "is_active": p.is_active,
        "store": {
            "id": store.id,
            "name": store.store_name,
            "platform": store.platform.value,
        } if store else None,
        "global_product": {
            "id": gp.id,
            "title": gp.title,
            "image_url": gp.image_url,
            "supplier_cost": float(gp.supplier_cost) if gp.supplier_cost else None,
        } if gp else None,
        "created_at": p.created_at.isoformat(),
    }
