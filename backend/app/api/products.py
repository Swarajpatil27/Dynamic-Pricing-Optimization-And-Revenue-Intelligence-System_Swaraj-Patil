from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.product import Product


router = APIRouter(
    prefix="/api/v1/products",
    tags=["Products"],
)


# ============================================================
# Pydantic Schemas
# ============================================================

class ProductBase(BaseModel):
    name: str
    sku: str
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
    sku: Optional[str] = None
    category: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    current_price: Optional[float] = None
    competitor_price: Optional[float] = None
    stock_level: Optional[int] = None
    image_url: Optional[str] = None


class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True


# ============================================================
# Helper Function
# ============================================================

def product_to_dict(product: Product) -> dict:
    """
    Converts a SQLAlchemy Product object into a dictionary.

    If current_price is missing, selling_price is used as
    the current price.
    """
    current_price = (
        product.current_price
        if product.current_price is not None
        else product.selling_price
    )

    return {
        "id": product.id,
        "name": product.name,
        "sku": product.sku,
        "category": product.category,
        "cost_price": product.cost_price,
        "current_price": current_price,
        "selling_price": product.selling_price,
        "competitor_price": product.competitor_price,
        "stock_level": product.stock_level,
        "image_url": product.image_url,
    }


# ============================================================
# GET ALL PRODUCTS
# ============================================================

@router.get(
    "",
    response_model=List[ProductResponse],
)
@router.get(
    "/",
    response_model=List[ProductResponse],
)
def get_products(
    q: Optional[str] = Query(
        None,
        description="Search products by name, SKU, or category",
    ),
    category: Optional[str] = Query(
        None,
        description="Category filter",
    ),
    db: Session = Depends(get_db),
):
    """
    Get all products.

    Optional:
    - q: search by product name, SKU, or category
    - category: filter by category
    """

    query = db.query(Product)

    # Category filter
    if category and category.strip().lower() != "all":
        category_term = category.strip().lower()

        query = query.filter(
            Product.category.ilike(f"%{category_term}%")
        )

    # Search filter
    if q and q.strip():
        search_term = q.strip()

        query = query.filter(
            (
                Product.name.ilike(f"%{search_term}%")
                | Product.sku.ilike(f"%{search_term}%")
                | Product.category.ilike(f"%{search_term}%")
            )
        )

    products = query.order_by(Product.id.asc()).all()

    return [product_to_dict(product) for product in products]


# ============================================================
# SEARCH PRODUCTS
# ============================================================

@router.get(
    "/search",
    response_model=List[ProductResponse],
)
def search_products(
    q: str = Query(
        ...,
        min_length=1,
        description="Search query",
    ),
    db: Session = Depends(get_db),
):
    """
    Search products by name, SKU, or category.
    """

    search_term = q.strip()

    products = (
        db.query(Product)
        .filter(
            (
                Product.name.ilike(f"%{search_term}%")
                | Product.sku.ilike(f"%{search_term}%")
                | Product.category.ilike(f"%{search_term}%")
            )
        )
        .order_by(Product.id.asc())
        .all()
    )

    return [product_to_dict(product) for product in products]


# ============================================================
# GET PRODUCT BY ID
# ============================================================

@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    Get a single product by ID.
    """

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product_to_dict(product)


# ============================================================
# CREATE PRODUCT
# ============================================================

@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new product.
    """

    # Check duplicate SKU
    existing_product = (
        db.query(Product)
        .filter(Product.sku == product_in.sku)
        .first()
    )

    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with this SKU already exists",
        )

    # If current_price is not provided,
    # use selling_price as current_price.
    current_price = (
        product_in.current_price
        if product_in.current_price is not None
        else product_in.selling_price
    )

    product = Product(
        name=product_in.name,
        sku=product_in.sku,
        category=product_in.category,
        cost_price=product_in.cost_price,
        current_price=current_price,
        selling_price=product_in.selling_price,
        competitor_price=(
            product_in.competitor_price
            if product_in.competitor_price is not None
            else 0.0
        ),
        stock_level=(
            product_in.stock_level
            if product_in.stock_level is not None
            else 0
        ),
        image_url=product_in.image_url,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product_to_dict(product)


# ============================================================
# UPDATE PRODUCT
# ============================================================

@router.put(
    "/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
):
    """
    Update an existing product.
    """

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    updates = product_in.model_dump(
        exclude_unset=True
    )

    # Check SKU uniqueness if SKU is being changed
    if "sku" in updates and updates["sku"] != product.sku:

        existing_product = (
            db.query(Product)
            .filter(
                Product.sku == updates["sku"],
                Product.id != product_id,
            )
            .first()
        )

        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A product with this SKU already exists",
            )

    # Apply updates
    for field, value in updates.items():
        setattr(product, field, value)

    # If selling price changes but current price
    # was not explicitly provided, keep them synchronized.
    if (
        "selling_price" in updates
        and "current_price" not in updates
    ):
        product.current_price = updates["selling_price"]

    db.commit()
    db.refresh(product)

    return product_to_dict(product)


# ============================================================
# DELETE PRODUCT
# ============================================================

@router.delete(
    "/{product_id}",
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete an existing product.
    """

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully",
        "product_id": product_id,
    }