import httpx
from app.db.database import Base, SessionLocal, engine
from app.models.product import Product


def init_db_with_real_ecommerce_data():
  Base.metadata.create_all(bind=engine)
  db = SessionLocal()

  # Clean existing items
  db.query(Product).delete()

  response = httpx.get("https://dummyjson.com/products?limit=20")
  if response.status_code == 200:
    items = response.json().get("products", [])

    for item in items:
      cost = round(item["price"] * 0.6, 2)
      comp_price = round(
          item["price"] * (1 + (item.get("discountPercentage", 5) / 100)), 2
      )

      # Extract thumbnail image URL
      image = item.get("thumbnail") or (
          item.get("images")[0] if item.get("images") else None
      )

      product = Product(
          name=item["title"],
          sku=f"SKU-{item['id'] + 1000}",
          category=item["category"].capitalize(),
          current_price=float(item["price"]),
          cost_price=cost,
          competitor_price=comp_price,
          stock_level=int(item["stock"]),
          image_url=image,
      )
      db.add(product)

    db.commit()
    print("Successfully re-seeded DB with product images!")
  db.close()


if __name__ == "__main__":
  init_db_with_real_ecommerce_data()