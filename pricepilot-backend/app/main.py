from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI App
app = FastAPI(
    title="PricePilot AI - End-to-End Dynamic Pricing & Intelligence Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Product Catalog & Search Router
try:
    from app.api.products import router as products_router, init_products_table
    init_products_table()
    app.include_router(products_router)
    print("Mounted Products & Catalog API Router")
except Exception as e:
    print(f"Warning: Products router error: {e}")

# 2. Competitor Intelligence Router (Milestone 3 Tasks 1 & 2 • Module 5)
try:
    from app.api.competitors import router as competitors_router
    app.include_router(competitors_router)
    print("Mounted Competitor Intelligence API Router")
except Exception as e:
    print(f"Warning: Competitors router error: {e}")

# 3. Market Intelligence Router (Milestone 3 Tasks 3 & 4)
try:
    from app.api.intelligence import router as intelligence_router
    app.include_router(intelligence_router)
    print("Mounted Market Intelligence API Router")
except Exception as e:
    print(f"Warning: Intelligence router error: {e}")

# 4. Revenue Optimization & Margin Simulator Router (Milestone 3 • Module 6)
try:
    from app.api.revenue_optimization import router as revenue_opt_router
    app.include_router(revenue_opt_router)
    print("Mounted Revenue Optimization API Router")
except Exception as e:
    print(f"Warning: Revenue Optimization router error: {e}")

# 5. Pricing Analytics & Profitability Dashboard Router (Milestone 3 • Module 7)
try:
    from app.api.profitability import router as profitability_router
    app.include_router(profitability_router)
    print("Mounted Pricing Analytics & Profitability API Router")
except Exception as e:
    print(f"Warning: Profitability router error: {e}")

# 6. Machine Learning Price Optimization Router (Milestone 2)
try:
    from app.api.pricing import router as pricing_router
    app.include_router(pricing_router)
    print("Mounted Pricing Optimization ML Router")
except Exception as e:
    print(f"Notice: Pricing ML router not mounted or standalone: {e}")

# 7. Machine Learning Demand Forecasting Router (Milestone 2)
try:
    from app.api.forecast import router as forecast_router
    app.include_router(forecast_router)
    print("Mounted Demand Forecasting ML Router")
except Exception as e:
    print(f"Notice: Demand Forecast ML router not mounted or standalone: {e}")


@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "PricePilot AI Backend",
        "active_modules": [
            "Products & Catalog Engine",
            "Competitor Intelligence & Scraper Monitor",
            "Profitability & Price Elasticity Simulation",
            "Revenue Optimization & Margin Simulator",
            "Pricing Analytics & Business Intelligence Dashboard",
            "Demand Forecast Time-Series Projections",
            "Optimal Price ML Estimator"
        ]
    }