"""Database seeding script for development.

Run: python seed.py
"""

import random
from decimal import Decimal
from datetime import datetime, timezone, timedelta

from werkzeug.security import generate_password_hash

from app import create_app
from app.extensions import db
from app.models.tenant import Tenant, User, Subscription, UserRole, PlanTier, BillingGateway, SubscriptionStatus
from app.models.product import GlobalProduct, TenantProduct, ProductStatus, SyncStatus
from app.models.store import ConnectedStore, StorePlatform
from app.models.marketing import AdCampaign, AdPlatform, CampaignStatus
from app.models.integration import TenantIntegration, IntegrationPlatform
from app.models.order import TenantOrder, Fulfillment, OrderStatus, FulfillmentStatus


GLOBAL_PRODUCTS_DATA = [
    {"title": "Wireless Noise-Canceling Earbuds", "category": "Electronics", "cost": 8.50, "retail": 34.99, "source": "AliExpress"},
    {"title": "Portable LED Ring Light 10\"", "category": "Electronics", "cost": 6.20, "retail": 24.99, "source": "AliExpress"},
    {"title": "Magnetic Phone Car Mount", "category": "Accessories", "cost": 2.80, "retail": 14.99, "source": "CJDropshipping"},
    {"title": "Minimalist Leather Watch", "category": "Fashion", "cost": 12.00, "retail": 49.99, "source": "AliExpress"},
    {"title": "Ergonomic Lumbar Support Pillow", "category": "Home", "cost": 9.50, "retail": 39.99, "source": "CJDropshipping"},
    {"title": "Smart Water Bottle with Temp Display", "category": "Fitness", "cost": 7.30, "retail": 29.99, "source": "AliExpress"},
    {"title": "Ultra-Slim RFID Blocking Wallet", "category": "Accessories", "cost": 3.50, "retail": 19.99, "source": "CJDropshipping"},
    {"title": "Sunrise Alarm Clock Light", "category": "Home", "cost": 11.00, "retail": 44.99, "source": "AliExpress"},
    {"title": "Electric Milk Frother Handheld", "category": "Kitchen", "cost": 4.20, "retail": 16.99, "source": "AliExpress"},
    {"title": "Posture Corrector Back Brace", "category": "Health", "cost": 5.60, "retail": 22.99, "source": "CJDropshipping"},
    {"title": "Mini Projector HD 1080P", "category": "Electronics", "cost": 45.00, "retail": 129.99, "source": "AliExpress"},
    {"title": "Collapsible Silicone Water Bottle", "category": "Fitness", "cost": 3.10, "retail": 15.99, "source": "CJDropshipping"},
    {"title": "Smart LED Strip Lights 5M", "category": "Home", "cost": 6.80, "retail": 27.99, "source": "AliExpress"},
    {"title": "Bamboo Wireless Charging Pad", "category": "Electronics", "cost": 5.90, "retail": 24.99, "source": "CJDropshipping"},
    {"title": "Portable Espresso Maker", "category": "Kitchen", "cost": 18.00, "retail": 59.99, "source": "AliExpress"},
]

CUSTOMER_NAMES = [
    ("Alice Johnson", "alice.j@example.com"),
    ("Bob Martinez", "bob.m@example.com"),
    ("Carol Chen", "carol.c@example.com"),
    ("David Kim", "david.k@example.com"),
    ("Eva Patel", "eva.p@example.com"),
]


def seed():
    app = create_app()
    with app.app_context():
        print("🗑️  Clearing existing data...")
        db.drop_all()
        db.create_all()

        # --- Tenants ---
        tenant_starter = Tenant(name="TrendVault", slug="trendvault")
        tenant_pro = Tenant(name="DropElite", slug="dropelite")
        db.session.add_all([tenant_starter, tenant_pro])
        db.session.flush()
        print("✅ Created 2 tenants")

        # --- Users ---
        user_starter = User(
            tenant_id=tenant_starter.id,
            email="owner@trendvault.io",
            password_hash=generate_password_hash("Password123!"),
            full_name="Sarah Vault",
            role=UserRole.OWNER,
        )
        user_pro = User(
            tenant_id=tenant_pro.id,
            email="owner@dropelite.io",
            password_hash=generate_password_hash("Password123!"),
            full_name="Marcus Elite",
            role=UserRole.OWNER,
        )
        db.session.add_all([user_starter, user_pro])
        db.session.flush()
        print("✅ Created 2 users")

        # --- Subscriptions ---
        now = datetime.now(timezone.utc)
        sub_starter = Subscription(
            tenant_id=tenant_starter.id,
            plan_tier=PlanTier.STARTER,
            billing_gateway=BillingGateway.STRIPE,
            gateway_customer_id="cus_mock_starter",
            gateway_subscription_id="sub_mock_starter",
            status=SubscriptionStatus.ACTIVE,
            current_period_start=now,
            current_period_end=now + timedelta(days=30),
        )
        sub_pro = Subscription(
            tenant_id=tenant_pro.id,
            plan_tier=PlanTier.PRO,
            billing_gateway=BillingGateway.STRIPE,
            gateway_customer_id="cus_mock_pro",
            gateway_subscription_id="sub_mock_pro",
            status=SubscriptionStatus.ACTIVE,
            current_period_start=now,
            current_period_end=now + timedelta(days=30),
        )
        db.session.add_all([sub_starter, sub_pro])
        db.session.flush()
        print("✅ Created 2 subscriptions")

        # --- Global Products ---
        global_products = []
        for i, p in enumerate(GLOBAL_PRODUCTS_DATA):
            gp = GlobalProduct(
                title=p["title"],
                description=f"High-quality {p['title'].lower()} sourced from trusted suppliers.",
                image_url=f"https://picsum.photos/seed/product{i+1}/400/400",
                supplier_url=f"https://{p['source'].lower()}.com/item/{10000+i}",
                supplier_cost=Decimal(str(p["cost"])),
                estimated_retail_price=Decimal(str(p["retail"])),
                category=p["category"],
                source_platform=p["source"],
                multi_factor_score=round(random.uniform(40.0, 95.0), 1),
                status=ProductStatus.ACTIVE,
            )
            global_products.append(gp)
        db.session.add_all(global_products)
        db.session.flush()
        print(f"✅ Created {len(global_products)} global products")

        # --- Connected Store (Pro tenant) ---
        store = ConnectedStore(
            tenant_id=tenant_pro.id,
            platform=StorePlatform.SHOPIFY,
            store_name="DropElite Official",
            store_url="https://dropelite-official.myshopify.com",
            access_token="shpat_mock_token_xxxxx",
            is_active=True,
            last_synced_at=now,
        )
        db.session.add(store)
        db.session.flush()
        print("✅ Created 1 connected store")

        # --- Tenant Products (import 3 global products to Pro tenant) ---
        tenant_products = []
        for i in range(3):
            gp = global_products[i]
            tp = TenantProduct(
                tenant_id=tenant_pro.id,
                store_id=store.id,
                global_product_id=gp.id,
                custom_title=f"Premium {gp.title}",
                custom_description=f"Exclusive {gp.title} - fast shipping, premium quality.",
                custom_price=gp.estimated_retail_price + Decimal("5.00"),
                platform_product_id=f"shopify_{7000000 + i}",
                sync_status=SyncStatus.SYNCED,
            )
            tenant_products.append(tp)
        db.session.add_all(tenant_products)
        db.session.flush()
        print(f"✅ Created {len(tenant_products)} tenant products")

        # --- Tenant Orders ---
        order_statuses = [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING, OrderStatus.PENDING, OrderStatus.DELIVERED]
        fulfillment_statuses = [FulfillmentStatus.DELIVERED, FulfillmentStatus.SHIPPED, FulfillmentStatus.ORDERED, FulfillmentStatus.PENDING, FulfillmentStatus.DELIVERED]

        orders = []
        fulfillments = []
        for i in range(5):
            tp = tenant_products[i % len(tenant_products)]
            gp = global_products[i % len(tenant_products)]
            sale = float(tp.custom_price)
            cost = float(gp.supplier_cost)
            profit = round(sale - cost, 2)
            customer = CUSTOMER_NAMES[i]

            order = TenantOrder(
                tenant_id=tenant_pro.id,
                store_id=store.id,
                tenant_product_id=tp.id,
                platform_order_id=f"#10{50 + i}",
                customer_email=customer[1],
                customer_name=customer[0],
                quantity=1,
                sale_price=Decimal(str(sale)),
                supplier_cost=Decimal(str(cost)),
                profit=Decimal(str(profit)),
                status=order_statuses[i],
                created_at=now - timedelta(days=5 - i),
            )
            orders.append(order)

        db.session.add_all(orders)
        db.session.flush()

        for i, order in enumerate(orders):
            ff = Fulfillment(
                tenant_order_id=order.id,
                supplier_order_id=f"SUP-{9000 + i}" if i < 4 else None,
                tracking_number=f"TRK{100000 + i}" if i < 3 else None,
                tracking_url=f"https://track.example.com/TRK{100000 + i}" if i < 3 else None,
                shipping_carrier="DHL" if i < 3 else None,
                status=fulfillment_statuses[i],
                fulfilled_at=now - timedelta(days=2 - i) if fulfillment_statuses[i] == FulfillmentStatus.DELIVERED else None,
            )
            fulfillments.append(ff)

        db.session.add_all(fulfillments)
        db.session.commit()
        print(f"✅ Created {len(orders)} orders and {len(fulfillments)} fulfillments")
        print("\n🎉 Database seeded successfully!")
        print(f"   Login: owner@trendvault.io / Password123! (Starter)")
        print(f"   Login: owner@dropelite.io / Password123! (Pro)")


if __name__ == "__main__":
    seed()
