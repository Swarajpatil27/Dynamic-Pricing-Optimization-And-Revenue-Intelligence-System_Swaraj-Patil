import json
import os
import sqlite3
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "pricepilot.db")
if not os.path.exists(DB_PATH):
    DB_PATH = os.path.join(os.path.dirname(BASE_DIR), "pricepilot.db")

# Category Normalizer mapping DummyJSON labels to UI categories
CATEGORY_MAP = {
    # Electronics
    "smartphones": "Electronics",
    "laptops": "Electronics",
    "tablets": "Electronics",
    "mobile-accessories": "Electronics",
    # Apparel
    "mens-shirts": "Apparel",
    "mens-shoes": "Apparel",
    "mens-watches": "Apparel",
    "womens-dresses": "Apparel",
    "womens-shoes": "Apparel",
    "womens-watches": "Apparel",
    "womens-bags": "Apparel",
    "womens-jewellery": "Apparel",
    "sunglasses": "Apparel",
    "tops": "Apparel",
    # Fragrances
    "fragrances": "Fragrances",
    # Beauty
    "beauty": "Beauty",
    "skin-care": "Beauty",
    # Furniture & Home
    "furniture": "Furniture",
    "home-decoration": "Furniture",
    "kitchen-accessories": "Furniture",
    "groceries": "Beauty",
}


def normalize_category(raw_cat: str) -> str:
    raw_lower = (raw_cat or "").lower().strip()
    return CATEGORY_MAP.get(
        raw_lower, raw_cat.replace("-", " ").title() if raw_cat else "General"
    )


def seed_dummyjson():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DROP TABLE IF EXISTS products")
    cursor.execute("""
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            cost_price REAL NOT NULL,
            current_price REAL NOT NULL,
            selling_price REAL NOT NULL,
            competitor_price REAL NOT NULL,
            stock_level INTEGER DEFAULT 0,
            image_url TEXT
        )
    """)

    print(
        "Fetching 100 live products from DummyJSON and normalizing categories..."
    )
    url = "https://dummyjson.com/products?limit=100"
    req = urllib.request.Request(
        url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )

    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())

    raw_products = data.get("products", [])
    if not raw_products:
        print("No products returned from DummyJSON.")
        return

    inserted_count = 0
    for item in raw_products:
        title = item.get("title", "Unknown Product")
        raw_cat = item.get("category", "General")
        category = normalize_category(raw_cat)

        price = float(item.get("price", 19.99))
        cost = round(price * 0.70, 2)
        discount = float(item.get("discountPercentage", 5.0))
        comp_price = round(price * (1.0 + (discount / 100.0) * 0.5), 2)
        stock = int(item.get("stock", 25))
        image_url = item.get("thumbnail") or (
            item.get("images")[0] if item.get("images") else ""
        )

        cursor.execute(
            """
            INSERT INTO products (name, category, cost_price, current_price, selling_price, competitor_price, stock_level, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                title,
                category,
                cost,
                price,
                price,
                comp_price,
                stock,
                image_url,
            ),
        )
        inserted_count += 1

    conn.commit()
    conn.close()
    print(
        f"Successfully seeded and normalized {inserted_count} products into pricepilot.db!"
    )


if __name__ == "__main__":
    seed_dummyjson()