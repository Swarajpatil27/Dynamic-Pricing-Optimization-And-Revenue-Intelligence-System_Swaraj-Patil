import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Ensure output directory exists
MODEL_DIR = os.path.join("app", "ml", "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)
MODEL_SAVE_PATH = os.path.join(MODEL_DIR, "demand_model.joblib")

np.random.seed(42)
n_samples = 4000

# 1. Category Baseline Map
category_map = {
    "Electronics": 0,
    "Apparel": 1,
    "Beauty": 2,
    "Fragrances": 3,
    "Furniture": 4,
    "Home & Kitchen": 5,
}

# 2. Synthetic Feature Generation
categories = np.random.choice(list(category_map.keys()), size=n_samples)
category_encoded = np.array([category_map[c] for c in categories])

# Horizons: 7, 14, 30, 90, 180, 365 days
horizons = np.random.choice([7, 14, 30, 90, 180, 365], size=n_samples)

# Prices & Competitor Benchmarks
selling_prices = np.random.uniform(10.0, 1200.0, size=n_samples)
competitor_prices = selling_prices * np.random.uniform(0.85, 1.20, size=n_samples)
price_ratios = selling_prices / competitor_prices

# Seasonality & Promotions
seasonal_multipliers = np.random.choice([0.8, 1.0, 1.1, 1.25, 1.5], size=n_samples)
promotions = np.random.choice([0, 1], size=n_samples, p=[0.75, 0.25])

# 3. Base Velocity by Category
category_base_velocity = {
    0: 36,  # Electronics
    1: 60,  # Apparel
    2: 75,  # Beauty
    3: 30,  # Fragrances
    4: 12,  # Furniture
    5: 42,  # Home & Kitchen
}
base_daily = np.array([category_base_velocity[c] for c in category_encoded])

# 4. Target Calculation (Simulated Ground Truth Demand)
elasticity_effect = np.clip(1.0 - ((price_ratios - 1.0) * 1.35), 0.3, 2.0)
promo_effect = np.where(promotions == 1, 1.35, 1.0)
daily_demand = base_daily * elasticity_effect * seasonal_multipliers * promo_effect
noise = np.random.normal(0, 2.0, size=n_samples)
target_units = np.maximum(1, np.round((daily_demand + noise) * horizons)).astype(int)

# 5. Build Training Matrix
X = np.column_stack([
    category_encoded,
    horizons,
    selling_prices,
    competitor_prices,
    price_ratios,
    seasonal_multipliers,
    promotions,
])
y = target_units

# 6. Train/Test Split & Model Fitting
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training RandomForest Demand Regressor...")
model = RandomForestRegressor(
    n_estimators=150,
    max_depth=12,
    min_samples_split=4,
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train, y_train)

# 7. Evaluate Metrics
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
score = model.score(X_test, y_test) * 100

print(f"Model Training Complete!")
print(f"R² Score: {score:.2f}%")
print(f"MAE: {mae:.2f}")
print(f"RMSE: {rmse:.2f}")

# 8. Serialize Model
joblib.dump(model, MODEL_SAVE_PATH)
print(f"Saved trained artifact to: {MODEL_SAVE_PATH}")