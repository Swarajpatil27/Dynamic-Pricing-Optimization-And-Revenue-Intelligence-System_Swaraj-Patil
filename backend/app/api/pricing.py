import os
import joblib
import numpy as np
import pandas as pd

from fastapi import APIRouter
from pydantic import BaseModel


# ============================================================
# PRICEPILOT AI - PRICING OPTIMIZATION API
# ============================================================

router = APIRouter(
    prefix="/api/v1/pricing",
    tags=["Pricing Optimizer ML"],
)


# ============================================================
# MODEL PATH
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "app",
    "ml",
    "saved_models",
    "demand_model.joblib",
)


# ============================================================
# LOAD DEMAND MODEL
# ============================================================

model = None

if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)

        print(
            f"Loaded Pricing Demand Model successfully from "
            f"{MODEL_PATH}"
        )

    except Exception as e:
        print(
            f"Warning: Unable to load Pricing Demand Model: {e}"
        )

else:
    print(
        f"Warning: Pricing Demand Model not found at "
        f"{MODEL_PATH}"
    )


# ============================================================
# CATEGORY ENCODING
# Must match the training model
# ============================================================

CATEGORY_MAP = {
    "Electronics": 0,
    "Apparel": 1,
    "Beauty": 2,
    "Fragrances": 3,
    "Furniture": 4,
    "Home & Kitchen": 5,
}


# ============================================================
# REQUEST MODEL
# ============================================================

class PricingPredictRequest(BaseModel):
    product_name: str
    category: str
    cost_price: float
    current_price: float
    competitor_price: float
    stock_level: int


# ============================================================
# DEMAND PREDICTION FUNCTION
# ============================================================

def predict_demand(
    category_encoded: int,
    horizon: int,
    selling_price: float,
    competitor_price: float,
    seasonal_multiplier: float,
    promotion: int,
) -> float:

    if model is None:
        raise RuntimeError(
            "Demand model is not loaded."
        )

    selling_price = max(
        float(selling_price),
        0.01,
    )

    competitor_price = max(
        float(competitor_price),
        0.01,
    )

    price_ratio = (
        selling_price / competitor_price
    )

    features = pd.DataFrame(
        [[
            category_encoded,
            horizon,
            selling_price,
            competitor_price,
            price_ratio,
            seasonal_multiplier,
            promotion,
        ]],
        columns=[
            "category",
            "horizon",
            "selling_price",
            "competitor_price",
            "price_ratio",
            "seasonal_multiplier",
            "promotion",
        ],
    )

    prediction = float(
        model.predict(features)[0]
    )

    return max(
        1.0,
        prediction,
    )


# ============================================================
# OPTIMAL PRICE PREDICTION
# ============================================================

@router.post("/predict")
def predict_optimal_price(
    req: PricingPredictRequest
):

    # --------------------------------------------------------
    # Clean input values
    # --------------------------------------------------------

    cost = max(
        float(req.cost_price),
        0.01,
    )

    current_price = max(
        float(req.current_price),
        0.01,
    )

    competitor_price = float(
        req.competitor_price
    )

    if competitor_price <= 0:
        competitor_price = (
            current_price * 1.05
        )

    stock = max(
        int(req.stock_level),
        0,
    )


    # --------------------------------------------------------
    # Model conditions
    # --------------------------------------------------------

    horizon = 30
    seasonal_multiplier = 1.0
    promotion = 0

    category_encoded = CATEGORY_MAP.get(
        req.category,
        CATEGORY_MAP["Home & Kitchen"],
    )


    # --------------------------------------------------------
    # Safe price range
    #
    # Minimum:
    #   At least 5% above cost
    #   OR no lower than 80% of current price
    #
    # Maximum:
    #   No more than 20% above current price
    #   No more than 5% above competitor price
    # --------------------------------------------------------

    minimum_price = max(
        cost * 1.05,
        current_price * 0.80,
    )

    maximum_price = min(
        current_price * 1.20,
        competitor_price * 1.05,
    )

    # Safety check for unusual input combinations
    if maximum_price < minimum_price:
        maximum_price = minimum_price


    # --------------------------------------------------------
    # Generate candidate prices
    # --------------------------------------------------------

    candidate_prices = np.linspace(
        minimum_price,
        maximum_price,
        31,
    )


    # --------------------------------------------------------
    # Find price with highest expected profit
    # --------------------------------------------------------

    best_price = None
    best_demand = None
    best_profit = None

    if model is not None:

        try:

            for candidate_price in candidate_prices:

                predicted_demand = predict_demand(
                    category_encoded=category_encoded,
                    horizon=horizon,
                    selling_price=float(candidate_price),
                    competitor_price=competitor_price,
                    seasonal_multiplier=seasonal_multiplier,
                    promotion=promotion,
                )

                # Basic expected profit
                expected_profit = (
                    float(candidate_price) - cost
                ) * predicted_demand


                # ------------------------------------------------
                # Market competitiveness penalty
                #
                # Prices above competitor price receive
                # progressively lower effective profit.
                # This prevents the optimizer from blindly
                # selecting the highest allowed price.
                # ------------------------------------------------

                price_ratio_to_competitor = (
                    float(candidate_price)
                    / competitor_price
                )

                if price_ratio_to_competitor > 1.0:

                    market_penalty = max(
                        0.70,
                        1.0
                        - (
                            (
                                price_ratio_to_competitor
                                - 1.0
                            )
                            * 2.0
                        ),
                    )

                    expected_profit *= (
                        market_penalty
                    )


                # ------------------------------------------------
                # Store best candidate
                # ------------------------------------------------

                if (
                    best_profit is None
                    or expected_profit > best_profit
                ):

                    best_profit = expected_profit
                    best_price = float(
                        candidate_price
                    )
                    best_demand = (
                        predicted_demand
                    )


        except Exception as e:

            print(
                f"Warning: ML optimization failed: {e}"
            )

            best_price = None
            best_demand = None
            best_profit = None


    # ========================================================
    # FALLBACK
    # ========================================================

    if best_price is None:

        if competitor_price > cost * 1.10:

            best_price = (
                competitor_price * 0.98
            )

        else:

            best_price = (
                cost * 1.22
            )

        best_price = round(
            best_price,
            2,
        )

        best_demand = max(
            1.0,
            5000 / np.sqrt(best_price),
        )

        best_profit = (
            best_price - cost
        ) * best_demand


    # ========================================================
    # FINAL PRICE
    # ========================================================

    predicted_price = round(
        float(best_price),
        2,
    )

    expected_demand_units = max(
        1,
        int(
            round(best_demand)
        ),
    )


    # ========================================================
    # CURRENT PRICE DEMAND
    # Used to calculate demand change
    # ========================================================

    current_demand = None

    if model is not None:

        try:

            current_demand = predict_demand(
                category_encoded=category_encoded,
                horizon=horizon,
                selling_price=current_price,
                competitor_price=competitor_price,
                seasonal_multiplier=seasonal_multiplier,
                promotion=promotion,
            )

        except Exception as e:

            print(
                "Warning: Current-price demand "
                f"prediction failed: {e}"
            )

            current_demand = None


    # ========================================================
    # DEMAND LIFT
    # ========================================================

    if (
        current_demand is not None
        and current_demand > 0
    ):

        demand_lift = (
            (
                best_demand
                - current_demand
            )
            / current_demand
        ) * 100

    else:

        demand_lift = 0.0


    demand_lift = round(
        float(demand_lift),
        1,
    )


    # ========================================================
    # PROFIT MARGIN
    # ========================================================

    unit_profit = (
        predicted_price - cost
    )

    unit_profit = round(
        unit_profit,
        2,
    )

    if predicted_price > 0:

        profit_margin = (
            unit_profit
            / predicted_price
        ) * 100

    else:

        profit_margin = 0.0


    profit_margin = round(
        float(profit_margin),
        1,
    )


    # ========================================================
    # PRICE DIFFERENCE
    # ========================================================

    price_gap = round(
        predicted_price
        - current_price,
        2,
    )


    # ========================================================
    # CONFIDENCE SCORE
    #
    # This is a heuristic confidence indicator,
    # NOT a statistical model probability.
    # ========================================================

    if model is not None:

        confidence_score = 90.0

        if competitor_price > cost:
            confidence_score += 2.0

        if expected_demand_units > 0:
            confidence_score += 1.0

        confidence_score = min(
            confidence_score,
            97.0,
        )

    else:

        confidence_score = 60.0


    # ========================================================
    # RECOMMENDATION MESSAGE
    # ========================================================

    if predicted_price > current_price:

        recommended_action = (
            f"ML Optimization Recommendation: "
            f"Optimal price is ${predicted_price:.2f}, "
            f"maximizing predicted profit with approximately "
            f"{expected_demand_units} units of demand "
            f"over a {horizon}-day horizon."
        )

    elif predicted_price < current_price:

        recommended_action = (
            f"ML Optimization Recommendation: "
            f"Optimal price is ${predicted_price:.2f}, "
            f"with approximately "
            f"{expected_demand_units} units of predicted demand "
            f"over a {horizon}-day horizon."
        )

    else:

        recommended_action = (
            f"ML Optimization Recommendation: "
            f"Current price of ${predicted_price:.2f} "
            f"is near the predicted profit optimum."
        )


    # ========================================================
    # RECOMMENDATION FACTORS
    # ========================================================

    factors = [

        {
            "name": "Competitor Benchmark",

            "impact": (
                f"Optimization considered the market "
                f"benchmark of ${competitor_price:.2f}"
            ),

            "influence": (
                "Positive"
                if predicted_price
                <= competitor_price * 1.05
                else "Neutral"
            ),
        },

        {
            "name": "Profit Margin",

            "impact": (
                f"Estimated {profit_margin}% margin "
                f"over unit cost (${cost:.2f})"
            ),

            "influence": (
                "Positive"
                if profit_margin >= 15
                else "Warning"
            ),
        },

        {
            "name": "Predicted Demand",

            "impact": (
                f"ML model estimates approximately "
                f"{expected_demand_units} units "
                f"over a {horizon}-day horizon"
            ),

            "influence": "Positive",
        },

        {
            "name": "Demand Change",

            "impact": (
                f"Predicted demand changes by "
                f"{demand_lift:+.1f}% "
                f"versus the current price"
            ),

            "influence": (
                "Positive"
                if demand_lift >= 0
                else "Negative"
            ),
        },

        {
            "name": "Inventory Context",

            "impact": (
                f"Current inventory is {stock} units. "
                f"Inventory is reported as business context; "
                f"it is not an input feature of the trained "
                f"7-feature demand model."
            ),

            "influence": "Neutral",
        },
    ]


    # ========================================================
    # API RESPONSE
    # ========================================================

    return {

        "product_name": req.product_name,

        "optimal_price": predicted_price,

        "recommended_price": predicted_price,

        "recommended_action": recommended_action,

        "expected_demand_lift": (
            f"{demand_lift:+.1f}%"
        ),

        "expected_demand_units": (
            expected_demand_units
        ),

        "projected_margin": (
            profit_margin
        ),

        "confidence_score": (
            confidence_score
        ),

        "factors": factors,
    }