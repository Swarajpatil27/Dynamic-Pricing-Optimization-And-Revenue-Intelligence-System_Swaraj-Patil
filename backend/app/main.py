import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine, SessionLocal
from app.models.product import Product
from app.models.user import User
from app.api import auth, products

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PricePilot AI - Dynamic Pricing Engine", version="1.0.0")

# Enable CORS for Next.js Front-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Seed Initial Dataset on Startup
@app.on_event("startup")
def seed_dataset():
    db = SessionLocal()
    try:
        # Check candidate locations for initial_products.csv
        possible_paths = [
            os.path.join(os.path.dirname(__file__), "initial_products.csv"),
            os.path.join(os.path.dirname(__file__), "data", "initial_products.csv"),
            os.path.join(os.path.dirname(__file__), "..", "initial_products.csv"),
        ]

        csv_path = None
        for p in possible_paths:
            if os.path.exists(p):
                csv_path = p
                break

        if csv_path:
            # Clear old records to seed fresh real dataset
            db.query(Product).delete()
            db.commit()

            df = pd.read_csv(csv_path)
            for idx, row in df.iterrows():
                product = Product(
                    name=str(row["name"]),
                    category=str(row["category"]),
                    current_price=float(row["current_price"]),
                    cost_price=float(row.get("cost_price", 0.0)),
                    stock_level=int(row["stock_level"]),
                    demand_trend=str(row["demand_trend"]),
                    units_sold=int(row.get("units_sold", 0)),
                    historical_demand=int(row.get("historical_demand", 0)),
                    seasonality_factor=float(row.get("seasonality_factor", 1.0)),
                    competitor_price=float(row.get("competitor_price", 0.0))
                )
                db.add(product)
            db.commit()
            print(f"INFO: Real-world retail dataset successfully seeded from {csv_path}!")
        else:
            print("ERROR: Could not locate initial_products.csv in any app folder.")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

app.include_router(auth.router)
app.include_router(products.router)

@app.get("/")
def root():
    return {"status": "Online", "system": "PricePilot AI Backend"}