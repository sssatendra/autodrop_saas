import uuid
import enum
from datetime import datetime, timezone

from app.extensions import db


class ProductStatus(enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    UNDER_REVIEW = "under_review"


class SyncStatus(enum.Enum):
    PENDING = "pending"
    SYNCED = "synced"
    FAILED = "failed"


class GlobalProduct(db.Model):
    __tablename__ = "global_products"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(512), nullable=True)
    supplier_url = db.Column(db.String(512), nullable=True)
    supplier_cost = db.Column(db.Numeric(10, 2), nullable=False)
    estimated_retail_price = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(120), nullable=True, index=True)
    source_platform = db.Column(db.String(60), nullable=True)
    multi_factor_score = db.Column(db.Float, default=0.0, nullable=False)
    status = db.Column(db.Enum(ProductStatus), default=ProductStatus.ACTIVE, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    tenant_products = db.relationship("TenantProduct", back_populates="global_product", lazy="dynamic")

    def __repr__(self):
        return f"<GlobalProduct {self.title}>"


class TenantProduct(db.Model):
    __tablename__ = "tenant_products"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = db.Column(db.String(36), db.ForeignKey("tenants.id"), nullable=False, index=True)
    store_id = db.Column(db.String(36), db.ForeignKey("connected_stores.id"), nullable=False, index=True)
    global_product_id = db.Column(db.String(36), db.ForeignKey("global_products.id"), nullable=False, index=True)
    custom_title = db.Column(db.String(255), nullable=True)
    custom_description = db.Column(db.Text, nullable=True)
    custom_price = db.Column(db.Numeric(10, 2), nullable=True)
    platform_product_id = db.Column(db.String(120), nullable=True)
    sync_status = db.Column(db.Enum(SyncStatus), default=SyncStatus.PENDING, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    tenant = db.relationship("Tenant", back_populates="products")
    store = db.relationship("ConnectedStore", back_populates="products")
    global_product = db.relationship("GlobalProduct", back_populates="tenant_products")
    campaigns = db.relationship("AdCampaign", back_populates="tenant_product", lazy="dynamic")
    orders = db.relationship("TenantOrder", back_populates="tenant_product", lazy="dynamic")

    def __repr__(self):
        return f"<TenantProduct {self.custom_title or self.global_product_id}>"
