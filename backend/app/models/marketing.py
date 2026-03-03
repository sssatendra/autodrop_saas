import uuid
import enum
from datetime import datetime, timezone

from app.extensions import db


class AdPlatform(enum.Enum):
    META = "meta"
    GOOGLE = "google"


class CampaignStatus(enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"


class AdCampaign(db.Model):
    __tablename__ = "ad_campaigns"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = db.Column(db.String(36), db.ForeignKey("tenants.id"), nullable=False, index=True)
    tenant_product_id = db.Column(db.String(36), db.ForeignKey("tenant_products.id"), nullable=False, index=True)
    platform = db.Column(db.Enum(AdPlatform), nullable=False)
    campaign_name = db.Column(db.String(255), nullable=False)
    platform_campaign_id = db.Column(db.String(120), nullable=True)
    status = db.Column(db.Enum(CampaignStatus), default=CampaignStatus.DRAFT, nullable=False)
    daily_budget = db.Column(db.Numeric(10, 2), nullable=True)
    total_spend = db.Column(db.Numeric(10, 2), default=0, nullable=False)
    impressions = db.Column(db.Integer, default=0, nullable=False)
    clicks = db.Column(db.Integer, default=0, nullable=False)
    conversions = db.Column(db.Integer, default=0, nullable=False)
    roas = db.Column(db.Float, default=0.0, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    tenant = db.relationship("Tenant", back_populates="campaigns")
    tenant_product = db.relationship("TenantProduct", back_populates="campaigns")

    def __repr__(self):
        return f"<AdCampaign {self.campaign_name}>"
