"""Cleanup script to remove mock seeded products before live sync."""
from app import create_app
from app.extensions import db
from app.models.product import GlobalProduct

def cleanup():
    app = create_app()
    with app.app_context():
        print("🗑️  Purging mock global products...")
        num = GlobalProduct.query.delete()
        db.session.commit()
        print(f"✅ Removed {num} mock items. Catalog is now empty and ready for live sync.")

if __name__ == "__main__":
    cleanup()
