"""Catalog API — paginated global product listing."""
from flask import request, jsonify
from flask_jwt_extended import jwt_required

from app.api import api_bp
from app.models.product import GlobalProduct, ProductStatus


@api_bp.route("/catalog", methods=["GET"])
@jwt_required()
def catalog():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 12, type=int)
    category = request.args.get("category")
    q = GlobalProduct.query.filter_by(status=ProductStatus.ACTIVE)
    if category:
        q = q.filter(GlobalProduct.category == category)
    q = q.order_by(GlobalProduct.multi_factor_score.desc())
    pag = q.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "items": [_product_dict(p) for p in pag.items],
        "total": pag.total,
        "pages": pag.pages,
        "page": pag.page,
    }), 200


def _product_dict(p: GlobalProduct) -> dict:
    cost = float(p.supplier_cost) if p.supplier_cost else 0
    retail = float(p.estimated_retail_price) if p.estimated_retail_price else 0
    margin = round(((retail - cost) / retail) * 100, 1) if retail else 0
    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "image_url": p.image_url,
        "supplier_url": p.supplier_url,
        "supplier_cost": cost,
        "estimated_retail_price": retail,
        "margin_pct": margin,
        "category": p.category,
        "source_platform": p.source_platform,
        "multi_factor_score": float(p.multi_factor_score) if p.multi_factor_score else 0,
        "status": p.status.value,
        "created_at": p.created_at.isoformat(),
    }
