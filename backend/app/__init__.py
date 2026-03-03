import os
from flask import Flask
from config import config_map
from app.extensions import db, migrate, cors, jwt


def create_app(config_name: str | None = None) -> Flask:
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_map[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, supports_credentials=True, origins=["http://localhost:5173"])
    jwt.init_app(app)

    # Import models so Alembic can detect them
    from app import models  # noqa: F401
    from app import tasks   # noqa: F401

    # Register blueprints
    from app.api import api_bp
    app.register_blueprint(api_bp, url_prefix="/api/v1")

    return app
