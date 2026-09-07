import os
import sqlite3
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/v1/revenue-optimization", tags=["Revenue Optimization"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "pricepilot.db")
if not os.path.exists(DB_PATH):
    if os.path.exists(os.path.join(BASE_DIR, "app", "pricepilot.db")):
        DB_PATH = os.path.join(BASE_DIR, "app", "pricepilot.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@router.get("/simulate")
def simulate_revenue_and_margins(
    product_name: str = Query("Apple iPhone Charger"),
    current_price: float = Query(19.99),
    cost_price: float = Query(13.99),
    price_adjustment_pct: float = Query(0.0),
    strategy: str = Query("balanced")  # "aggressive_volume", "balanced", "premium_margin"
):
    # Strategy elasticity weights
    elasticity_map = {
        "aggressive_volume": -1.8,
        "balanced": -1.35,
        "premium_margin": -0.85
    }
    elasticity = elasticity_map.get(strategy, -1.35)

    base_daily_units = max(5, int(4200 / (current_price + 30)))
    base_unit_margin = round(current_price - cost_price, 2)
    base_revenue_30d = round(base_daily_units * current_price * 30, 2)
    base_profit_30d = round(base_daily_units * base_unit_margin * 30, 2)

    # Simulated with price adjustment
    sim_price = round(current_price * (1.0 + (price_adjustment_pct / 100.0)), 2)
    demand_multiplier = max(0.2, 1.0 + ((price_adjustment_pct / 100.0) * elasticity))
    sim_daily_units = max(1, int(base_daily_units * demand_multiplier))
    sim_unit_margin = round(sim_price - cost_price, 2)
    sim_margin_pct = round((sim_unit_margin / sim_price) * 100, 1) if sim_price > 0 else 0

    sim_revenue_30d = round(sim_daily_units * sim_price * 30, 2)
    sim_profit_30d = round(sim_daily_units * sim_unit_margin * 30, 2)
    revenue_delta = round(sim_revenue_30d - base_revenue_30d, 2)
    profit_delta = round(sim_profit_30d - base_profit_30d, 2)

    # Strategy Recommendations
    strategies = [
        {
            "name": "Market Penetration",
            "suggested_price": round(current_price * 0.93, 2),
            "expected_volume_change": "+22%",
            "margin_pct": round(((current_price * 0.93 - cost_price) / (current_price * 0.93)) * 100, 1),
            "objective": "Max Volume & Market Share"
        },
        {
            "name": "Profit Maximization (AI Recommended)",
            "suggested_price": round(current_price * 1.04, 2),
            "expected_volume_change": "-3%",
            "margin_pct": round(((current_price * 1.04 - cost_price) / (current_price * 1.04)) * 100, 1),
            "objective": "Optimal Revenue & Net Margin"
        },
        {
            "name": "Premium Skimming",
            "suggested_price": round(current_price * 1.15, 2),
            "expected_volume_change": "-18%",
            "margin_pct": round(((current_price * 1.15 - cost_price) / (current_price * 1.15)) * 100, 1),
            "objective": "High Margin per Unit"
        }
    ]

    # Simulation Curves (Points for graph)
    simulation_curve = []
    for step in range(-20, 25, 5):
        step_p = round(current_price * (1 + step / 100.0), 2)
        step_u = max(1, int(base_daily_units * (1 + (step / 100.0) * elasticity)))
        step_rev = round(step_u * step_p * 30, 2)
        step_prof = round(step_u * (step_p - cost_price) * 30, 2)
        simulation_curve.append({
            "adjustment": f"{step:+d}%",
            "price": step_p,
            "projected_revenue": step_rev,
            "projected_profit": step_prof
        })

    return {
        "product_name": product_name,
        "base_metrics": {
            "selling_price": current_price,
            "cost_price": cost_price,
            "unit_margin": base_unit_margin,
            "margin_pct": round((base_unit_margin / current_price) * 100, 1),
            "projected_revenue_30d": base_revenue_30d,
            "projected_profit_30d": base_profit_30d
        },
        "simulation": {
            "price_adjustment_pct": price_adjustment_pct,
            "simulated_price": sim_price,
            "unit_margin": sim_unit_margin,
            "margin_pct": sim_margin_pct,
            "daily_volume": sim_daily_units,
            "simulated_revenue_30d": sim_revenue_30d,
            "simulated_profit_30d": sim_profit_30d,
            "revenue_delta": revenue_delta,
            "profit_delta": profit_delta
        },
        "strategies": strategies,
        "simulation_curve": simulation_curve
    }