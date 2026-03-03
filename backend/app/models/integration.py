"""TenantIntegration model — stores ad platform credentials per tenant."""
import uuid
import enum
from datetime import datetime, timezone

from app.extensions import db


class IntegrationPlatform(enum.Enum):
    META = "meta"
    GOOGLE = "google"


class TenantIntegration(db.Model):
    __tablename__ = "tenant_integrations"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = db.Column(db.String(36), db.ForeignKey("tenants.id"), nullable=False, index=True)
    platform = db.Column(db.Enum(IntegrationPlatform), nullable=False)
    # Credentials stored as JSON (never logged, treat as secrets)
    credentials = db.Column(db.JSON, nullable=False, default=dict)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    tenant = db.relationship("Tenant", back_populates="integrations")

    __table_args__ = (
        db.UniqueConstraint("tenant_id", "platform", name="uq_tenant_platform"),
    )

    def __repr__(self):
        return f"<TenantIntegration {self.tenant_id} - {self.platform.value}>"
