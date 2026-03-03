from flask import jsonify
from app.api import api_bp
from app.extensions import db


@api_bp.route("/health", methods=["GET"])
def health_check():
    status = {"status": "ok", "database": "disconnected"}
    try:
        db.session.execute(db.text("SELECT 1"))
        status["database"] = "connected"
    except Exception:
        status["status"] = "degraded"
    return jsonify(status), 200 if status["status"] == "ok" else 503
