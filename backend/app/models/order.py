import uuid
import enum
from datetime import datetime, timezone

from app.extensions import db


class OrderStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class FulfillmentStatus(enum.Enum):
    PENDING = "pending"
    ORDERED = "ordered"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    FAILED = "failed"


class TenantOrder(db.Model):
    __tablename__ = "tenant_orders"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = db.Column(db.String(36), db.ForeignKey("tenants.id"), nullable=False, index=True)
    store_id = db.Column(db.String(36), db.ForeignKey("connected_stores.id"), nullable=False, index=True)
    tenant_product_id = db.Column(db.String(36), db.ForeignKey("tenant_products.id"), nullable=False, index=True)
    platform_order_id = db.Column(db.String(120), nullable=True)
    customer_email = db.Column(db.String(255), nullable=True)
    customer_name = db.Column(db.String(255), nullable=True)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    sale_price = db.Column(db.Numeric(10, 2), nullable=False)
    supplier_cost = db.Column(db.Numeric(10, 2), nullable=False)
    profit = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    tenant = db.relationship("Tenant", back_populates="orders")
    store = db.relationship("ConnectedStore", back_populates="orders")
    tenant_product = db.relationship("TenantProduct", back_populates="orders")
    fulfillment = db.relationship("Fulfillment", back_populates="order", uselist=False)

    def __repr__(self):
        return f"<TenantOrder {self.id} - {self.status.value}>"


class Fulfillment(db.Model):
    __tablename__ = "fulfillments"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_order_id = db.Column(db.String(36), db.ForeignKey("tenant_orders.id"), unique=True, nullable=False)
    supplier_order_id = db.Column(db.String(120), nullable=True)
    tracking_number = db.Column(db.String(120), nullable=True)
    tracking_url = db.Column(db.String(512), nullable=True)
    shipping_carrier = db.Column(db.String(60), nullable=True)
    status = db.Column(db.Enum(FulfillmentStatus), default=FulfillmentStatus.PENDING, nullable=False)
    fulfilled_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    order = db.relationship("TenantOrder", back_populates="fulfillment")

    def __repr__(self):
        return f"<Fulfillment {self.tenant_order_id} - {self.status.value}>"
