from sqlalchemy import Column, Integer, String, Float
# Use 'from app.db.database import Base' if your file is named database.py
from app.db.database import Base 

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    current_price = Column(Float)
    cost_price = Column(Float, default=0.0)
    stock_level = Column(Integer)
    demand_trend = Column(String)
    units_sold = Column(Integer, default=0)
    historical_demand = Column(Integer, default=0)
    seasonality_factor = Column(Float, default=1.0)
    competitor_price = Column(Float, default=0.0)