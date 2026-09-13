import os
import sqlite3
import json
import urllib.request

# Locate pricepilot.db
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "pricepilot.db")
if not os.path.exists(DB_PATH):
    if os.path.exists(os.path.join(BASE_DIR, "app", "pricepilot.db")):
        DB_PATH = os.path.join(BASE_DIR, "app", "pricepilot.db")

print(f"Targeting Database: {DB_PATH}")

# Explicit, strict category mappings
VALID_CATEGORIES = {
    # 1. Electronics
    "smartphones": "Electronics",
    "laptops": "Electronics",
    "tablets": "Electronics",
    "mobile-accessories": "Electronics",
    
    # 2. Apparel
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
    
    # 3. Fragrances
    "fragrances": "Fragrances",
    
    # 4. Beauty
    "beauty": "Beauty",
    "skin-care": "Beauty",
    
    # 5. Furniture
    "furniture": "Furniture",
    "home-decoration": "Furniture",
    "kitchen-accessories": "Furniture"
}

# Explicit blacklist to eliminate food/groceries
BLACKLIST_WORDS = ["beef", "chicken", "meat", "cat food", "dog food", "cucumber", "egg", "apple", "banana", "fish", "oil", "milk"]

def seed_clean_products():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Recreate table cleanly
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

    print("Fetching catalog from DummyJSON...")
    url = "https://dummyjson.com/products?limit=194"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())

    raw_items = data.get("products", [])
    inserted_count = 0

    for item in raw_items:
        raw_cat = (item.get("category") or "").lower()
        title = item.get("title", "")
        
        # Check if category is valid
        if raw_cat not in VALID_CATEGORIES:
            continue
            
        # Reject blacklist items
        if any(bad in title.lower() for bad in BLACKLIST_WORDS) and raw_cat == "groceries":
            continue

        target_category = VALID_CATEGORIES[raw_cat]
        price = float(item.get("price", 29.99))
        cost = round(price * 0.70, 2)
        discount = float(item.get("discountPercentage", 5.0))
        comp_price = round(price * (1.0 + (discount / 100.0) * 0.5), 2)
        stock = int(item.get("stock", 30))
        thumb = item.get("thumbnail") or (item.get("images")[0] if item.get("images") else "")

        cursor.execute("""
            INSERT INTO products (name, category, cost_price, current_price, selling_price, competitor_price, stock_level, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (title, target_category, cost, price, price, comp_price, stock, thumb))
        
        inserted_count += 1

    conn.commit()
    conn.close()
    print(f"SUCCESS: Loaded {inserted_count} strictly categorized items into the database!")

if __name__ == "__main__":
    seed_clean_products()