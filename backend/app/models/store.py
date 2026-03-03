import uuid
import enum
from datetime import datetime, timezone

from app.extensions import db


class StorePlatform(enum.Enum):
    SHOPIFY = "shopify"
    WOOCOMMERCE = "woocommerce"


class ConnectedStore(db.Model):
    __tablename__ = "connected_stores"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = db.Column(db.String(36), db.ForeignKey("tenants.id"), nullable=False, index=True)
    platform = db.Column(db.Enum(StorePlatform), nullable=False)
    store_name = db.Column(db.String(255), nullable=True)
    store_url = db.Column(db.String(512), nullable=False)
    access_token = db.Column(db.String(512), nullable=True)
    refresh_token = db.Column(db.String(512), nullable=True)
    # Platform-specific extra credentials (WooCommerce consumer_key/secret, etc.)
    platform_metadata = db.Column(db.JSON, nullable=True, default=dict)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_synced_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    tenant = db.relationship("Tenant", back_populates="stores")
    products = db.relationship("TenantProduct", back_populates="store", lazy="dynamic")
    orders = db.relationship("TenantOrder", back_populates="store", lazy="dynamic")

    def __repr__(self):
        return f"<ConnectedStore {self.store_name} ({self.platform.value})>"
