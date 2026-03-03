import uuid
import enum
from datetime import datetime, timezone

from app.extensions import db


class UserRole(enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class SubscriptionStatus(enum.Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELLED = "cancelled"
    TRIALING = "trialing"


class PlanTier(enum.Enum):
    STARTER = "starter"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class BillingGateway(enum.Enum):
    STRIPE = "stripe"
    RAZORPAY = "razorpay"


class Tenant(db.Model):
    __tablename__ = "tenants"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(120), unique=True, nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    users = db.relationship("User", back_populates="tenant", lazy="dynamic")
    subscription = db.relationship("Subscription", back_populates="tenant", uselist=False)
    stores = db.relationship("ConnectedStore", back_populates="tenant", lazy="dynamic")
    products = db.relationship("TenantProduct", back_populates="tenant", lazy="dynamic")
    campaigns = db.relationship("AdCampaign", back_populates="tenant", lazy="dynamic")
    orders = db.relationship("TenantOrder", back_populates="tenant", lazy="dynamic")
    integrations = db.relationship("TenantIntegration", back_populates="tenant", lazy="dynamic")

    def __repr__(self):
        return f"<Tenant {self.name}>"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = db.Column(db.String(36), db.ForeignKey("tenants.id"), nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120))
    role = db.Column(db.Enum(UserRole), default=UserRole.MEMBER, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    tenant = db.relationship("Tenant", back_populates="users")

    def __repr__(self):
        return f"<User {self.email}>"


class Subscription(db.Model):
    __tablename__ = "subscriptions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = db.Column(db.String(36), db.ForeignKey("tenants.id"), unique=True, nullable=False)
    plan_tier = db.Column(db.Enum(PlanTier), default=PlanTier.STARTER, nullable=False)
    billing_gateway = db.Column(db.Enum(BillingGateway), nullable=True)
    gateway_customer_id = db.Column(db.String(255), nullable=True)
    gateway_subscription_id = db.Column(db.String(255), nullable=True)
    status = db.Column(db.Enum(SubscriptionStatus), default=SubscriptionStatus.TRIALING, nullable=False)
    current_period_start = db.Column(db.DateTime, nullable=True)
    current_period_end = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    tenant = db.relationship("Tenant", back_populates="subscription")

    def __repr__(self):
        return f"<Subscription {self.tenant_id} - {self.plan_tier.value}>"
