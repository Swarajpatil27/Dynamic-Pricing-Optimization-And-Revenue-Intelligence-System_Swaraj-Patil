-- ============================================================
-- PricePilot AI
-- Database Schema
-- Based on the current backend implementation
-- Database Engine: SQLite
-- ============================================================

PRAGMA foreign_keys = ON;


-- ============================================================
-- 1. USERS
-- Used by:
-- app/api/auth.py
-- app/models/user.py
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'PricingManager'
);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);


-- ============================================================
-- 2. PRODUCTS
-- Used by:
-- app/models/product.py
-- app/api/products.py
-- app/api/analytics.py
-- app/api/profitability.py
-- app/services/live_stream.py
--
-- current_price is the main price field in the SQLAlchemy
-- Product model.
--
-- selling_price is also referenced by older product/
-- profitability code in the backend.
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    current_price REAL NOT NULL,
    cost_price REAL NOT NULL,
    competitor_price REAL NOT NULL,
    stock_level INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    selling_price REAL
);

CREATE INDEX IF NOT EXISTS idx_products_sku
    ON products(sku);

CREATE INDEX IF NOT EXISTS idx_products_name
    ON products(name);

CREATE INDEX IF NOT EXISTS idx_products_category
    ON products(category);


-- ============================================================
-- 3. COMPETITOR PRICE LOGS
-- Defined by:
-- app/models/competitor.py
--
-- Stores competitor price observations associated
-- with products.
-- ============================================================

CREATE TABLE IF NOT EXISTS competitor_price_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    platform_name TEXT NOT NULL,
    competitor_price REAL NOT NULL,
    our_price REAL NOT NULL,
    price_difference REAL NOT NULL,
    is_undercutting INTEGER NOT NULL DEFAULT 0,
    stock_status TEXT NOT NULL DEFAULT 'In Stock',
    seller_rating REAL NOT NULL DEFAULT 4.5,
    captured_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_competitor_logs_product
    ON competitor_price_logs(product_id);

CREATE INDEX IF NOT EXISTS idx_competitor_logs_platform
    ON competitor_price_logs(platform_name);

CREATE INDEX IF NOT EXISTS idx_competitor_logs_captured_at
    ON competitor_price_logs(captured_at);


-- ============================================================
-- END OF SCHEMA
-- ============================================================