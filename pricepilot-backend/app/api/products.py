import os
import sqlite3
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/products", tags=["Products"])

# Locate pricepilot.db file in backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "pricepilot.db")
if not os.path.exists(DB_PATH):
    if os.path.exists(os.path.join(BASE_DIR, "app", "pricepilot.db")):
        DB_PATH = os.path.join(BASE_DIR, "app", "pricepilot.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_products_table():
    """Initializes table if not present (called by main.py)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            cost_price REAL NOT NULL,
            current_price REAL NOT NULL,
            selling_price REAL NOT NULL,
            competitor_price REAL NOT NULL,
            stock_level INTEGER DEFAULT 0,
            image_url TEXT
        )
    """)
    conn.commit()
    conn.close()


# Pydantic Schemas
class ProductBase(BaseModel):
    name: str
    category: str
    cost_price: float
    selling_price: float
    current_price: Optional[float] = None
    competitor_price: Optional[float] = 0.0
    stock_level: Optional[int] = 0
    image_url: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    current_price: Optional[float] = None
    competitor_price: Optional[float] = None
    stock_level: Optional[int] = None
    image_url: Optional[str] = None


class ProductResponse(ProductBase):
    id: int


def row_to_dict(row) -> dict:
    d = dict(row)
    if not d.get("current_price"):
        d["current_price"] = d.get("selling_price", 0.0)
    return d


# ==========================================
# Endpoints
# ==========================================
@router.get("", response_model=List[ProductResponse])
@router.get("/", response_model=List[ProductResponse])
def get_products(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Category filter"),
):
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = "SELECT * FROM products WHERE 1=1"
    params = []

    if category and category.strip().lower() != "all":
        sql += " AND LOWER(category) LIKE ?"
        params.append(f"%{category.strip().lower()}%")

    if q and q.strip():
        sql += " AND (LOWER(name) LIKE ? OR LOWER(category) LIKE ?)"
        term = f"%{q.strip().lower()}%"
        params.extend([term, term])

    cursor.execute(sql, params)
    rows = cursor.fetchall()
    conn.close()

    return [row_to_dict(r) for r in rows]


@router.get("/search", response_model=List[ProductResponse])
def search_products(q: str = Query(..., min_length=1)):
    conn = get_db_connection()
    cursor = conn.cursor()
    term = f"%{q.strip().lower()}%"
    cursor.execute(
        "SELECT * FROM products WHERE LOWER(name) LIKE ? OR LOWER(category) LIKE ?",
        (term, term),
    )
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(r) for r in rows]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    return row_to_dict(row)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    data = product_in.model_dump()
    selling_p = float(data.get("selling_price", 0.0))
    current_p = float(data.get("current_price") or selling_p)
    cost_p = float(data.get("cost_price", 0.0))
    comp_p = float(data.get("competitor_price", 0.0))
    stock_l = int(data.get("stock_level", 0))
    img_url = data.get("image_url") or "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"

    cursor.execute(
        """
        INSERT INTO products (name, category, cost_price, current_price, selling_price, competitor_price, stock_level, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """,
        (
            data.get("name"),
            data.get("category"),
            cost_p,
            current_p,
            selling_p,
            comp_p,
            stock_l,
            img_url,
        ),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return {
        "id": new_id,
        "name": data.get("name"),
        "category": data.get("category"),
        "cost_price": cost_p,
        "current_price": current_p,
        "selling_price": selling_p,
        "competitor_price": comp_p,
        "stock_level": stock_l,
        "image_url": img_url,
    }


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_in: ProductUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    current_data = dict(existing)
    updates = product_in.model_dump(exclude_unset=True)

    for k, v in updates.items():
        current_data[k] = v

    if "selling_price" in updates and "current_price" not in updates:
        current_data["current_price"] = updates["selling_price"]

    cursor.execute(
        """
        UPDATE products
        SET name = ?, category = ?, cost_price = ?, current_price = ?, selling_price = ?, competitor_price = ?, stock_level = ?, image_url = ?
        WHERE id = ?
    """,
        (
            current_data["name"],
            current_data["category"],
            current_data["cost_price"],
            current_data["current_price"],
            current_data["selling_price"],
            current_data["competitor_price"],
            current_data["stock_level"],
            current_data["image_url"],
            product_id,
        ),
    )
    conn.commit()
    conn.close()

    return current_data


@router.delete("/{product_id}")
def delete_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return {"message": "Product deleted successfully"}