from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    current_price: float
    cost_price: float
    competitor_price: float
    stock_level: int
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    current_price: Optional[float] = None
    cost_price: Optional[float] = None
    competitor_price: Optional[float] = None
    stock_level: Optional[int] = None
    image_url: Optional[str] = None

class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True