import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-fallback-secret")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "postgresql://autodrop:autodrop_secret@localhost:5432/autodrop_db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
    }

    REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

    # Celery
    CELERY_BROKER_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

    # JWT config
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_SECURE = False  # True in production
    JWT_COOKIE_CSRF_PROTECT = False  # Enable in production with double-submit pattern
    JWT_ACCESS_TOKEN_EXPIRES = 900  # 15 minutes
    JWT_REFRESH_TOKEN_EXPIRES = 2592000  # 30 days
    JWT_COOKIE_SAMESITE = "Lax"

    # Billing
    ACTIVE_BILLING_GATEWAY = os.environ.get("ACTIVE_BILLING_GATEWAY", "stripe")
    STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")
    RAZORPAY_KEY_ID = os.environ.get("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET")
    RAZORPAY_WEBHOOK_SECRET = os.environ.get("RAZORPAY_WEBHOOK_SECRET")

    # Integrations
    SHOPIFY_API_KEY = os.environ.get("SHOPIFY_API_KEY")
    SHOPIFY_API_SECRET = os.environ.get("SHOPIFY_API_SECRET")
    SHOPIFY_REDIRECT_URI = os.environ.get("SHOPIFY_REDIRECT_URI", "http://localhost:5000/api/v1/stores/shopify/callback")


class DevelopmentConfig(Config):
    DEBUG = True
    JWT_COOKIE_SECURE = False


class ProductionConfig(Config):
    DEBUG = False
    JWT_COOKIE_SECURE = True
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_size": 20,
        "max_overflow": 40,
    }


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_COOKIE_SECURE = False


config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}
