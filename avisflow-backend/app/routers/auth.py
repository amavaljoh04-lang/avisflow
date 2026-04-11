from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister):
    with get_db() as db:
        existing = db.execute("SELECT id FROM users WHERE email = ?", (data.email,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        cursor = db.execute(
            "INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)",
            (data.email, hash_password(data.password), data.full_name, "user"),
        )
        user_id = cursor.lastrowid
        user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

        token = create_access_token(user_id, "user")
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                full_name=user["full_name"],
                role=user["role"],
                created_at=str(user["created_at"]),
                is_active=bool(user["is_active"]),
            ),
        )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE email = ?", (data.email,)).fetchone()
        if not user or not verify_password(data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not user["is_active"]:
            raise HTTPException(status_code=403, detail="Account deactivated")

        token = create_access_token(user["id"], user["role"])
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user["id"],
                email=user["email"],
                full_name=user["full_name"],
                role=user["role"],
                created_at=str(user["created_at"]),
                is_active=bool(user["is_active"]),
            ),
        )
