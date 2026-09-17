from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    require_role
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)


# =========================================================
# REGISTER USER
# =========================================================

@router.post("/register", response_model=Token)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):

    # Check whether email already exists
    db_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Hash password before storing it
    hashed_pw = get_password_hash(user_data.password)

    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_pw,
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create JWT
    token = create_access_token(
        data={
            "sub": new_user.email,
            "role": new_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": new_user.name,
        "role": new_user.role
    }


# =========================================================
# LOGIN USER
# =========================================================

@router.post("/login", response_model=Token)
def login_user(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):

    # Find user by email
    user = (
        db.query(User)
        .filter(User.email == credentials.email)
        .first()
    )

    # Validate email and password
    if not user or not verify_password(
        credentials.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Create JWT containing user role
    token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": user.name,
        "role": user.role
    }


# =========================================================
# GET REGISTERED USERS
# =========================================================
# ONLY PricingManager can access this endpoint.
# =========================================================

@router.get("/users")
def get_registered_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        require_role("PricingManager")
    )
):

    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]