import httpx

from app.db.database import Base, SessionLocal, engine
from app.models.product import Product
from app.models.user import User
from app.models.competitor import CompetitorPriceLog


def init_db_with_real_ecommerce_data():
    # Create all tables if they do not already exist.
    # Importing the models above registers them with Base.metadata.
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Do not delete existing products.
        # This makes the initialization process safe to run again.
        existing_products = db.query(Product).count()

        if existing_products > 0:
            print(
                f"Database already contains {existing_products} product(s). "
                "Skipping product seeding."
            )
            return

        print("No products found. Fetching sample e-commerce data...")

        response = httpx.get(
            "https://dummyjson.com/products?limit=20",
            timeout=15.0,
        )
        response.raise_for_status()

        items = response.json().get("products", [])

        if not items:
            print("No products were returned from the data source.")
            return

        for item in items:
            cost = round(item["price"] * 0.6, 2)

            comp_price = round(
                item["price"]
                * (1 + (item.get("discountPercentage", 5) / 100)),
                2,
            )

            image = item.get("thumbnail")

            if not image and item.get("images"):
                image = item["images"][0]

            product = Product(
                name=item["title"],
                sku=f"SKU-{item['id'] + 1000}",
                category=item["category"].capitalize(),
                cost_price=cost,
                current_price=float(item["price"]),
                selling_price=float(item["price"]),
                competitor_price=comp_price,
                stock_level=int(item["stock"]),
                image_url=image,
            )

            db.add(product)

        db.commit()

        print(f"Successfully seeded {len(items)} product(s).")

    except httpx.HTTPError as e:
        db.rollback()
        print(f"Unable to fetch sample product data: {e}")

    except Exception as e:
        db.rollback()
        print(f"Database initialization error: {e}")

    finally:
        db.close()


if __name__ == "__main__":
    init_db_with_real_ecommerce_data()