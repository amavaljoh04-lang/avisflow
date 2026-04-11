import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.schemas import AdminStats
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


class EmailSettings(BaseModel):
    smtp_host: str
    smtp_port: int = 587
    smtp_user: str
    smtp_password: str
    sender_name: str = "AvisFlow"
    sender_email: str


class PromoEmail(BaseModel):
    subject: str
    body: str
    target: str = "all"  # "all" or "active"


class AdminPinCheck(BaseModel):
    pin: str


class AdminPinSet(BaseModel):
    pin: str


@router.post("/verify-pin")
async def verify_admin_pin(data: AdminPinCheck, admin: dict = Depends(require_admin)):
    """Verify admin PIN to access admin panel."""
    import hashlib
    with get_db() as db:
        row = db.execute("SELECT value FROM settings WHERE key = 'admin_pin'").fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="PIN admin non configure")
        stored_hash = row["value"]
        input_hash = hashlib.sha256(data.pin.encode()).hexdigest()
        if input_hash != stored_hash:
            raise HTTPException(status_code=403, detail="PIN incorrect")
        return {"verified": True}


@router.get("/pin-status")
async def admin_pin_status(admin: dict = Depends(require_admin)):
    """Check if admin PIN is configured."""
    with get_db() as db:
        row = db.execute("SELECT value FROM settings WHERE key = 'admin_pin'").fetchone()
        return {"has_pin": row is not None}


@router.put("/set-pin")
async def set_admin_pin(data: AdminPinSet, admin: dict = Depends(require_admin)):
    """Set or update admin PIN."""
    import hashlib
    if len(data.pin) < 4:
        raise HTTPException(status_code=400, detail="Le PIN doit contenir au moins 4 caracteres")
    pin_hash = hashlib.sha256(data.pin.encode()).hexdigest()
    with get_db() as db:
        db.execute(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('admin_pin', ?, CURRENT_TIMESTAMP)",
            (pin_hash,),
        )
        return {"message": "PIN admin configure"}


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


class RoleUpdate(BaseModel):
    role: str


@router.put("/users/{user_id}/role")
async def update_user_role(user_id: int, data: RoleUpdate, admin: dict = Depends(require_admin)):
    if data.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    with get_db() as db:
        db.execute("UPDATE users SET role = ? WHERE id = ?", (data.role, user_id))
        return {"message": f"User role updated to {data.role}"}


@router.put("/users/{user_id}/toggle")
async def toggle_user(user_id: int, admin: dict = Depends(require_admin)):
    with get_db() as db:
        user = db.execute("SELECT is_active FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        new_status = 0 if user["is_active"] else 1
        db.execute("UPDATE users SET is_active = ? WHERE id = ?", (new_status, user_id))
        return {"message": "User status toggled", "is_active": bool(new_status)}


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, admin: dict = Depends(require_admin)):
    with get_db() as db:
        user = db.execute("SELECT id, role FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user["id"] == admin["id"]:
            raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
        # Delete user's reviews, qr_codes, businesses, then user
        biz_ids = db.execute("SELECT id FROM businesses WHERE user_id = ?", (user_id,)).fetchall()
        for biz in biz_ids:
            db.execute("DELETE FROM reviews WHERE business_id = ?", (biz["id"],))
            db.execute("DELETE FROM qr_codes WHERE business_id = ?", (biz["id"],))
        db.execute("DELETE FROM businesses WHERE user_id = ?", (user_id,))
        db.execute("DELETE FROM users WHERE id = ?", (user_id,))
        return {"message": "Utilisateur et toutes ses donnees supprimes"}


# --- Email Settings ---

@router.get("/settings/email")
async def get_email_settings(admin: dict = Depends(require_admin)):
    with get_db() as db:
        keys = ["smtp_host", "smtp_port", "smtp_user", "smtp_password", "sender_name", "sender_email"]
        settings = {}
        for key in keys:
            row = db.execute("SELECT value FROM settings WHERE key = ?", (f"email_{key}",)).fetchone()
            settings[key] = row["value"] if row else ""
        return settings


@router.put("/settings/email")
async def update_email_settings(data: EmailSettings, admin: dict = Depends(require_admin)):
    with get_db() as db:
        fields = {
            "smtp_host": data.smtp_host,
            "smtp_port": str(data.smtp_port),
            "smtp_user": data.smtp_user,
            "smtp_password": data.smtp_password,
            "sender_name": data.sender_name,
            "sender_email": data.sender_email,
        }
        for key, value in fields.items():
            db.execute(
                "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
                (f"email_{key}", value),
            )
        return {"message": "Configuration email sauvegardee"}


@router.post("/email/test")
async def test_email(admin: dict = Depends(require_admin)):
    """Send a test email to verify SMTP settings."""
    settings = _get_email_settings()
    if not settings:
        raise HTTPException(status_code=400, detail="Configurez d'abord les parametres email")
    try:
        _send_email(
            settings,
            to_email=admin["email"],
            subject="AvisFlow - Test Email",
            body="<h1>Ca marche !</h1><p>Votre configuration email AvisFlow fonctionne correctement.</p>",
        )
        return {"message": f"Email de test envoye a {admin['email']}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'envoi: {str(e)}")


@router.post("/email/promo")
async def send_promo_email(data: PromoEmail, admin: dict = Depends(require_admin)):
    """Send a promotional email to all users."""
    settings = _get_email_settings()
    if not settings:
        raise HTTPException(status_code=400, detail="Configurez d'abord les parametres email")

    with get_db() as db:
        if data.target == "active":
            users = db.execute("SELECT email, full_name FROM users WHERE is_active = 1").fetchall()
        else:
            users = db.execute("SELECT email, full_name FROM users").fetchall()

    sent = 0
    errors = 0
    for user in users:
        try:
            personalized_body = data.body.replace("{{name}}", user["full_name"] or "")
            _send_email(settings, to_email=user["email"], subject=data.subject, body=personalized_body)
            sent += 1
        except Exception:
            errors += 1

    return {"message": f"{sent} email(s) envoye(s), {errors} erreur(s)"}


def _get_email_settings() -> dict | None:
    with get_db() as db:
        keys = ["smtp_host", "smtp_port", "smtp_user", "smtp_password", "sender_name", "sender_email"]
        settings = {}
        for key in keys:
            row = db.execute("SELECT value FROM settings WHERE key = ?", (f"email_{key}",)).fetchone()
            if row:
                settings[key] = row["value"]
        if not settings.get("smtp_host") or not settings.get("smtp_user"):
            return None
        return settings


def _send_email(settings: dict, to_email: str, subject: str, body: str):
    msg = MIMEMultipart("alternative")
    msg["From"] = f"{settings.get('sender_name', 'AvisFlow')} <{settings['sender_email']}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html", "utf-8"))

    port = int(settings.get("smtp_port", 587))
    with smtplib.SMTP(settings["smtp_host"], port) as server:
        server.starttls()
        server.login(settings["smtp_user"], settings["smtp_password"])
        server.send_message(msg)
