from pydantic import BaseModel

class ProductResponse(BaseModel):
    id: int
    sku: str
    name: str
    category: str
    currentPrice: float
    optimalPrice: float
    stock: int
    demandTrend: str

    class Config:
        from_attributes = True