from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/v1/pricing", tags=["Price Prediction & Optimization"])


class PredictionRequest(BaseModel):
    product_name: str
    category: str
    cost_price: float
    current_price: float
    competitor_price: float
    stock_level: int
    discount_percentage: Optional[float] = 0.0


class RecommendationFactor(BaseModel):
    title: str
    description: str
    impact: str  # "Positive", "Neutral", "Alert"


class PredictionResponse(BaseModel):
    product_name: str
    recommended_price: float
    expected_demand: int
    expected_revenue: float
    profit_margin_percent: float
    price_elasticity: float
    strategy_recommendation: str
    recommendation_factors: List[RecommendationFactor]


@router.post("/predict", response_model=PredictionResponse)
def predict_optimal_price(req: PredictionRequest):
    cost = req.cost_price
    curr = req.current_price
    comp = req.competitor_price
    stock = req.stock_level

    # 1. Real-time Optimal Price calculation
    # Price 4% below competitor while protecting 25% minimum margin floor
    competitor_undercut = comp * 0.96 if comp > 0 else curr * 0.98
    margin_floor = cost * 1.25 if cost > 0 else curr * 0.70
    optimal_price = max(margin_floor, competitor_undercut)
    optimal_price = round(optimal_price, 2)

    # 2. Demand Elasticity & Revenue Estimation
    price_ratio = (optimal_price - comp) / comp if comp > 0 else 0
    elasticity = -1.45
    base_velocity = max(20, int(stock * 4.5)) if stock > 0 else 140
    demand_multiplier = max(0.5, 1.0 - (price_ratio * abs(elasticity)))
    expected_demand = int(round(base_velocity * demand_multiplier))
    expected_revenue = round(expected_demand * optimal_price, 2)

    # 3. Margin Calculation
    margin_percent = round(((optimal_price - cost) / optimal_price) * 100, 1) if cost > 0 else 32.5

    # 4. Simplified Recommendation Factors
    factors = [
        RecommendationFactor(
            title="Competitor Benchmark",
            description=f"Set 4% below competitor (${comp:.2f}) to attract price-sensitive buyers.",
            impact="Positive",
        ),
        RecommendationFactor(
            title="Profit Margin",
            description=f"Protects a healthy {margin_percent}% margin over unit cost (${cost:.2f}).",
            impact="Positive",
        ),
        RecommendationFactor(
            title="Stock Velocity",
            description=f"Inventory level of {stock} units supports increased demand volume without stockouts.",
            impact="Neutral",
        ),
    ]

    strategy = (
        f"Recommended optimal price is ${optimal_price:.2f}. This prices the item 4% below the competitor (${comp:.2f}) "
        f"to maximize sales velocity while locking in a {margin_percent}% profit margin."
    )

    return PredictionResponse(
        product_name=req.product_name,
        recommended_price=optimal_price,
        expected_demand=expected_demand,
        expected_revenue=expected_revenue,
        profit_margin_percent=margin_percent,
        price_elasticity=elasticity,
        strategy_recommendation=strategy,
        recommendation_factors=factors,
    )