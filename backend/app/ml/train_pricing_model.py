import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

# Create dataset folder if missing
os.makedirs("app/ml/saved_models", exist_ok=True)

np.random.seed(42)
n_samples = 3000

# 1. Generate Realistic Price Data
cost_price = np.random.uniform(300, 1000, n_samples)
competitor_price = cost_price * np.random.uniform(1.2, 1.5)
# Current price centered closely around market competitor benchmark
current_price = competitor_price * np.random.uniform(0.92, 1.05)
stock_level = np.random.randint(10, 200, n_samples)

# 2. Real-World Demand Elasticity Formula (Strict Penalty for overpriced items)
base_demand = 100 - (current_price / competitor_price) * 45
stock_penalty = np.where(stock_level > 100, 10, 0)
price_ratio = current_price / competitor_price

# Sharp drop in demand if price exceeds competitor benchmark
elasticity_multiplier = np.where(price_ratio > 1.02, 0.4, 1.1)

target_demand = np.maximum(5, (base_demand + stock_penalty) * elasticity_multiplier)

df = pd.DataFrame({
    'current_price': current_price,
    'cost_price': cost_price,
    'competitor_price': competitor_price,
    'stock_level': stock_level,
    'demand': target_demand
})

# 3. Train Random Forest Model
X = df[['current_price', 'cost_price', 'competitor_price', 'stock_level']]
y = df['demand']

model = RandomForestRegressor(n_estimators=150, random_state=42)
model.fit(X, y)

# 4. Save Model
joblib.dump(model, "app/ml/saved_models/pricing_optimizer.pkl")
print("Successfully retrained pricing model with real-time market bounds!")