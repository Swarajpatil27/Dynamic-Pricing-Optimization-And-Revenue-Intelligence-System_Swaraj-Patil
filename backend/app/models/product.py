from sqlalchemy import Column, Integer, String, Float
from app.db.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)
    current_price = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)
    competitor_price = Column(Float, nullable=False)
    stock_level = Column(Integer, nullable=False)
    image_url = Column(String, nullable=True)  # New image URL field