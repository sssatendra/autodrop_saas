"""Authentication endpoints: register, login, logout, me."""
import re
import uuid
from datetime import datetime, timezone

from flask import request, jsonify, make_response
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    unset_jwt_cookies,
)
from werkzeug.security import generate_password_hash, check_password_hash

from app.api import api_bp
from app.extensions import db
from app.models.tenant import Tenant, User, UserRole


def _slug_from_name(name: str) -> str:
    """Convert company name to URL-safe slug."""
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    # append short uuid fragment to guarantee uniqueness
    return f"{slug}-{uuid.uuid4().hex[:6]}"


def _user_to_dict(user: User) -> dict:
    tenant = user.tenant
    sub = tenant.subscription
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
        "tenant": {
            "id": tenant.id,
            "name": tenant.name,
            "slug": tenant.slug,
        },
        "subscription": {
            "plan_tier": sub.plan_tier.value if sub else "free",
            "status": sub.status.value if sub else None,
        } if sub else None,
    }


def _set_auth_cookies(response, user_id: str):
    """Attach HTTP-only JWT access + refresh cookies to response."""
    access_token = create_access_token(identity=user_id)
    refresh_token = create_refresh_token(identity=user_id)
    response.set_cookie(
        "access_token_cookie",
        access_token,
        httponly=True,
        samesite="Lax",
        secure=False,  # set True in production (HTTPS)
    )
    response.set_cookie(
        "refresh_token_cookie",
        refresh_token,
        httponly=True,
        samesite="Lax",
        secure=False,
    )
    return response


# ────────────────────────────────────────────────────────────
# POST /api/v1/auth/register
# ────────────────────────────────────────────────────────────
@api_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    company_name = (data.get("companyName") or "").strip()
    email = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""

    # ── Basic validation ──
    errors = {}
    if not company_name or len(company_name) < 2:
        errors["companyName"] = "Company name must be at least 2 characters."
    if not email or "@" not in email:
        errors["email"] = "Valid email is required."
    if not password or len(password) < 8:
        errors["password"] = "Password must be at least 8 characters."
    if errors:
        return jsonify({"errors": errors}), 422

    # ── Uniqueness check ──
    if User.query.filter_by(email=email).first():
        return jsonify({"errors": {"email": "An account with this email already exists."}}), 409

    # ── Create tenant + owner user atomically ──
    try:
        tenant = Tenant(name=company_name, slug=_slug_from_name(company_name))
        db.session.add(tenant)
        db.session.flush()  # get tenant.id

        user = User(
            tenant_id=tenant.id,
            email=email,
            password_hash=generate_password_hash(password),
            full_name=company_name,
            role=UserRole.OWNER,
        )
        db.session.add(user)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": "Registration failed. Please try again."}), 500

    resp = make_response(jsonify({"user": _user_to_dict(user)}), 201)
    return _set_auth_cookies(resp, user.id)


# ────────────────────────────────────────────────────────────
# POST /api/v1/auth/login
# ────────────────────────────────────────────────────────────
@api_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email, is_active=True).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password."}), 401

    resp = make_response(jsonify({"user": _user_to_dict(user)}), 200)
    return _set_auth_cookies(resp, user.id)


# ────────────────────────────────────────────────────────────
# POST /api/v1/auth/logout
# ────────────────────────────────────────────────────────────
@api_bp.route("/auth/logout", methods=["POST"])
def logout():
    resp = make_response(jsonify({"message": "Logged out."}), 200)
    unset_jwt_cookies(resp)
    return resp


# ────────────────────────────────────────────────────────────
# GET /api/v1/auth/me  — requires valid access cookie
# ────────────────────────────────────────────────────────────
@api_bp.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_active:
        resp = make_response(jsonify({"error": "User not found."}), 401)
        unset_jwt_cookies(resp)
        return resp
    return jsonify({"user": _user_to_dict(user)}), 200


# ────────────────────────────────────────────────────────────
# POST /api/v1/auth/refresh  — rotate access token
# ────────────────────────────────────────────────────────────
@api_bp.route("/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_active:
        resp = make_response(jsonify({"error": "Session expired."}), 401)
        unset_jwt_cookies(resp)
        return resp
        
    resp = make_response(jsonify({"message": "Token refreshed."}), 200)
    new_access = create_access_token(identity=user_id)
    resp.set_cookie(
        "access_token_cookie",
        new_access,
        httponly=True,
        samesite="Lax",
        secure=False,
    )
    return resp
