from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class CompetitorPriceLog(Base):
    __tablename__ = "competitor_price_logs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String, nullable=False)
    platform_name = Column(String, nullable=False)  # Amazon, Walmart, Flipkart, etc.
    competitor_price = Column(Float, nullable=False)
    our_price = Column(Float, nullable=False)
    price_difference = Column(Float, nullable=False)
    is_undercutting = Column(Boolean, default=False)
    stock_status = Column(String, default="In Stock")  # In Stock, Low Stock, Out of Stock
    seller_rating = Column(Float, default=4.5)
    captured_at = Column(DateTime, default=datetime.utcnow)