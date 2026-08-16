from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.pricing import router as pricing_router
from app.api.products import router as products_router, init_products_table
from app.api.forecast import router as forecast_router

app = FastAPI(title="PricePilot AI Backend")

# Initialize database schema on startup
@app.on_event("startup")
def startup_event():
    try:
        init_products_table()
        print("Database schema verified and active.")
    except Exception as e:
        print(f"Startup DB Error: {e}")

# Enable permissive CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(pricing_router)
app.include_router(products_router)
app.include_router(forecast_router)