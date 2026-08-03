import csv
import os
from sqlalchemy.orm import Session
from app.models.product import Product

def init_db(db: Session):
    # If database already has products, skip seeding
    if db.query(Product).first():
        return

    csv_path = os.path.join(os.path.dirname(__file__), "..", "initial_products.csv")
    if os.path.exists(csv_path):
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                product = Product(
                    name=row["name"],
                    category=row["category"],
                    current_price=float(row["current_price"]),
                    cost_price=float(row["cost_price"]),
                    stock_level=int(row["stock_level"]),
                    demand_trend=row["demand_trend"],
                    units_sold=int(row["units_sold"]),
                    historical_demand=int(row["historical_demand"]),
                    seasonality_factor=float(row["seasonality_factor"]),
                    competitor_price=float(row["competitor_price"]),
                )
                db.add(product)
            db.commit()
            print("INFO: Real-world retail dataset successfully loaded into SQLite database!")