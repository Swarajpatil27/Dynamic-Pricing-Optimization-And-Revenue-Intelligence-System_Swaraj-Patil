import asyncio
import random
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.product import Product

async def fetch_external_market_signal():
    """
    Simulates live real-time market fluctuations:
    - Competitor price fluctuates by -3% to +3%
    - Stock levels decrease periodically as orders occur
    """
    competitor_shift = random.uniform(-0.03, 0.03)
    stock_change = random.choice([0, 0, -1, -2, -5])
    return competitor_shift, stock_change


async def start_realtime_data_stream(interval_seconds: int = 10):
    """
    Background worker continuously streaming and updating product metrics in real-time.
    """
    print(f"⚡ [Live Stream Engine] Started background stream worker (Interval: {interval_seconds}s)")

    while True:
        await asyncio.sleep(interval_seconds)
        db: Session = SessionLocal()
        try:
            products = db.query(Product).all()
            if not products:
                continue

            updated_count = 0
            for product in products:
                shift, stock_delta = await fetch_external_market_signal()

                # Update Competitor Price dynamically
                new_comp_price = round(product.competitor_price * (1 + shift), 2)
                product.competitor_price = max(5.0, new_comp_price)

                # Update Stock Level (Simulating real-time orders)
                if product.stock_level > 5:
                    product.stock_level = max(0, product.stock_level + stock_delta)

                updated_count += 1

            db.commit()
            print(f"🔄 [Live Stream Engine] Successfully updated {updated_count} products with live telemetry.")
        except Exception as e:
            print(f"⚠️ [Live Stream Error]: {e}")
            db.rollback()
        finally:
            db.close()