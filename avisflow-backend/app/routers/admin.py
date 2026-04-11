from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.models.schemas import AdminStats
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(user: dict = Depends(require_admin)):
    with get_db() as db:
        total_users = db.execute("SELECT COUNT(*) as c FROM users").fetchone()["c"]
        total_businesses = db.execute("SELECT COUNT(*) as c FROM businesses WHERE is_active = 1").fetchone()["c"]
        total_reviews = db.execute("SELECT COUNT(*) as c FROM reviews").fetchone()["c"]
        total_scans = db.execute("SELECT COALESCE(SUM(scan_count), 0) as s FROM qr_codes").fetchone()["s"]

        recent_users = db.execute(
            "SELECT id, email, full_name, role, created_at, is_active FROM users ORDER BY created_at DESC LIMIT 20"
        ).fetchall()

        recent_reviews = db.execute(
            """SELECT r.*, b.name as business_name FROM reviews r
            JOIN businesses b ON r.business_id = b.id
            ORDER BY r.created_at DESC LIMIT 20"""
        ).fetchall()

        return AdminStats(
            total_users=total_users,
            total_businesses=total_businesses,
            total_reviews=total_reviews,
            total_scans=total_scans,
            recent_users=[dict(u) for u in recent_users],
            recent_reviews=[dict(r) for r in recent_reviews],
        )


@router.get("/users")
async def list_all_users(user: dict = Depends(require_admin)):
    with get_db() as db:
        rows = db.execute(
            """SELECT u.id, u.email, u.full_name, u.role, u.created_at, u.is_active,
            COUNT(b.id) as business_count
            FROM users u LEFT JOIN businesses b ON u.id = b.user_id AND b.is_active = 1
            GROUP BY u.id ORDER BY u.created_at DESC"""
        ).fetchall()
        return [dict(r) for r in rows]


@router.get("/businesses")
async def list_all_businesses(user: dict = Depends(require_admin)):
    with get_db() as db:
        rows = db.execute(
            """SELECT b.*, u.email as owner_email, u.full_name as owner_name,
            COUNT(r.id) as review_count, COALESCE(AVG(r.rating), 0) as avg_rating
            FROM businesses b
            JOIN users u ON b.user_id = u.id
            LEFT JOIN reviews r ON b.id = r.business_id
            WHERE b.is_active = 1
            GROUP BY b.id ORDER BY b.created_at DESC"""
        ).fetchall()
        return [dict(r) for r in rows]


@router.get("/reviews")
async def list_all_reviews(user: dict = Depends(require_admin)):
    with get_db() as db:
        rows = db.execute(
            """SELECT r.*, b.name as business_name
            FROM reviews r JOIN businesses b ON r.business_id = b.id
            ORDER BY r.created_at DESC LIMIT 100"""
        ).fetchall()
        return [dict(r) for r in rows]


@router.put("/users/{user_id}/role")
async def update_user_role(user_id: int, role: str, admin: dict = Depends(require_admin)):
    if role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    with get_db() as db:
        db.execute("UPDATE users SET role = ? WHERE id = ?", (role, user_id))
        return {"message": f"User role updated to {role}"}


@router.put("/users/{user_id}/toggle")
async def toggle_user(user_id: int, admin: dict = Depends(require_admin)):
    with get_db() as db:
        user = db.execute("SELECT is_active FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        new_status = 0 if user["is_active"] else 1
        db.execute("UPDATE users SET is_active = ? WHERE id = ?", (new_status, user_id))
        return {"message": "User status toggled", "is_active": bool(new_status)}
