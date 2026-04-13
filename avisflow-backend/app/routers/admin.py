import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
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


class AdCreate(BaseModel):
    title: str
    image_url: Optional[str] = ""
    link_url: Optional[str] = ""
    position: str = "home_banner"
    is_active: int = 0


class AdUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    position: Optional[str] = None
    is_active: Optional[int] = None


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
    # Get admin email from database (JWT only has id and role)
    with get_db() as db:
        admin_user = db.execute("SELECT email FROM users WHERE id = ?", (admin["id"],)).fetchone()
        if not admin_user:
            raise HTTPException(status_code=404, detail="Utilisateur non trouve")
        admin_email = admin_user["email"]
    try:
        _send_email(
            settings,
            to_email=admin_email,
            subject="AvisFlow - Test Email",
            body="<h1>Ca marche !</h1><p>Votre configuration email AvisFlow fonctionne correctement.</p>",
        )
        return {"message": f"Email de test envoye a {admin_email}"}
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


# --- Mass Email to All Users ---

@router.post("/email/mass")
async def send_mass_email(data: PromoEmail, admin: dict = Depends(require_admin)):
    """Send an email to all users at once. Same as promo but with a clearer name."""
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
    error_details: list[str] = []
    for user in users:
        try:
            personalized_body = data.body.replace("{{name}}", user["full_name"] or "")
            _send_email(settings, to_email=user["email"], subject=data.subject, body=personalized_body)
            sent += 1
        except Exception as e:
            errors += 1
            error_details.append(f"{user['email']}: {str(e)}")

    return {
        "message": f"{sent} email(s) envoye(s), {errors} erreur(s)",
        "sent": sent,
        "errors": errors,
        "error_details": error_details[:10],  # Limit to 10 errors
    }


# --- Server Migration (Export / Import) ---

@router.get("/export")
async def export_all_data(admin: dict = Depends(require_admin)):
    """Export all platform data as JSON for server migration.
    Includes users, businesses, reviews, qr_codes, blog_posts, ads, settings.
    Passwords are exported hashed — users won't need to re-register.
    QR codes stay valid because slugs are preserved."""
    with get_db() as db:
        data = {
            "version": "1.0",
            "exported_at": db.execute("SELECT datetime('now') as t").fetchone()["t"],
            "users": [dict(r) for r in db.execute("SELECT * FROM users").fetchall()],
            "businesses": [dict(r) for r in db.execute("SELECT * FROM businesses").fetchall()],
            "reviews": [dict(r) for r in db.execute("SELECT * FROM reviews").fetchall()],
            "qr_codes": [dict(r) for r in db.execute("SELECT * FROM qr_codes").fetchall()],
            "blog_posts": [dict(r) for r in db.execute("SELECT * FROM blog_posts").fetchall()],
            "ads": [dict(r) for r in db.execute("SELECT * FROM ads").fetchall()],
            "settings": [dict(r) for r in db.execute("SELECT * FROM settings").fetchall()],
        }
    return JSONResponse(content=data)


@router.post("/import")
async def import_all_data(file: UploadFile = File(...), admin: dict = Depends(require_admin)):
    """Import platform data from a JSON export file.
    This replaces ALL existing data. Use for server migration only.
    QR codes will continue to work because business slugs are preserved."""
    try:
        content = await file.read()
        data = json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fichier JSON invalide: {str(e)}")

    if "version" not in data or "users" not in data:
        raise HTTPException(status_code=400, detail="Format d'export invalide")

    with get_db() as db:
        # Clear existing data in reverse dependency order
        db.execute("DELETE FROM reviews")
        db.execute("DELETE FROM qr_codes")
        db.execute("DELETE FROM blog_posts")
        db.execute("DELETE FROM ads")
        db.execute("DELETE FROM businesses")
        db.execute("DELETE FROM users")
        # Keep settings (SMTP config etc.) unless included in import
        if data.get("settings"):
            db.execute("DELETE FROM settings")
            for s in data["settings"]:
                db.execute(
                    "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
                    (s["key"], s["value"], s.get("updated_at", "")),
                )

        # Import users
        for u in data.get("users", []):
            db.execute(
                """INSERT INTO users (id, email, password_hash, full_name, role, created_at, is_active, is_verified, verification_token)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (u["id"], u["email"], u["password_hash"], u["full_name"], u["role"],
                 u["created_at"], u.get("is_active", 1), u.get("is_verified", 1), u.get("verification_token")),
            )

        # Import businesses
        for b in data.get("businesses", []):
            db.execute(
                """INSERT INTO businesses (id, user_id, name, slug, category, address, phone, google_review_url,
                logo_url, primary_color, positive_threshold, sms_enabled, email_enabled, created_at, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (b["id"], b["user_id"], b["name"], b["slug"], b.get("category"), b.get("address"),
                 b.get("phone"), b.get("google_review_url"), b.get("logo_url"), b.get("primary_color", "#2563eb"),
                 b.get("positive_threshold", 4), b.get("sms_enabled", 0), b.get("email_enabled", 0),
                 b["created_at"], b.get("is_active", 1)),
            )

        # Import reviews
        for r in data.get("reviews", []):
            db.execute(
                """INSERT INTO reviews (id, business_id, rating, feedback, customer_name, customer_email,
                source, redirected_to_google, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (r["id"], r["business_id"], r["rating"], r.get("feedback"), r.get("customer_name"),
                 r.get("customer_email"), r.get("source", "qrcode"), r.get("redirected_to_google", 0),
                 r["created_at"]),
            )

        # Import QR codes
        for q in data.get("qr_codes", []):
            db.execute(
                """INSERT INTO qr_codes (id, business_id, label, scan_count, created_at, is_active)
                VALUES (?, ?, ?, ?, ?, ?)""",
                (q["id"], q["business_id"], q.get("label"), q.get("scan_count", 0),
                 q["created_at"], q.get("is_active", 1)),
            )

        # Import blog posts
        for p in data.get("blog_posts", []):
            db.execute(
                """INSERT INTO blog_posts (id, title, slug, content, excerpt, cover_image_url,
                lang, is_published, author_id, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (p["id"], p["title"], p["slug"], p["content"], p.get("excerpt"),
                 p.get("cover_image_url"), p.get("lang", "fr"), p.get("is_published", 1),
                 p.get("author_id"), p["created_at"], p.get("updated_at")),
            )

        # Import ads
        for a in data.get("ads", []):
            db.execute(
                """INSERT INTO ads (id, title, image_url, link_url, position, is_active,
                click_count, view_count, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (a["id"], a["title"], a.get("image_url"), a.get("link_url"),
                 a.get("position", "home_banner"), a.get("is_active", 0),
                 a.get("click_count", 0), a.get("view_count", 0),
                 a["created_at"], a.get("updated_at")),
            )

    counts = {
        "users": len(data.get("users", [])),
        "businesses": len(data.get("businesses", [])),
        "reviews": len(data.get("reviews", [])),
        "qr_codes": len(data.get("qr_codes", [])),
        "blog_posts": len(data.get("blog_posts", [])),
        "ads": len(data.get("ads", [])),
    }
    return {
        "message": "Import termine avec succes",
        "imported": counts,
    }


# --- Ads Management ---

@router.get("/ads")
async def list_ads(admin: dict = Depends(require_admin)):
    """List all ads."""
    with get_db() as db:
        rows = db.execute("SELECT * FROM ads ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]


@router.post("/ads")
async def create_ad(data: AdCreate, admin: dict = Depends(require_admin)):
    """Create a new ad."""
    with get_db() as db:
        db.execute(
            """INSERT INTO ads (title, image_url, link_url, position, is_active)
            VALUES (?, ?, ?, ?, ?)""",
            (data.title, data.image_url, data.link_url, data.position, data.is_active),
        )
        return {"message": "Publicite creee"}


@router.put("/ads/{ad_id}")
async def update_ad(ad_id: int, data: AdUpdate, admin: dict = Depends(require_admin)):
    """Update an ad."""
    with get_db() as db:
        ad = db.execute("SELECT * FROM ads WHERE id = ?", (ad_id,)).fetchone()
        if not ad:
            raise HTTPException(status_code=404, detail="Publicite introuvable")
        updates = []
        values = []
        for field in ["title", "image_url", "link_url", "position", "is_active"]:
            val = getattr(data, field)
            if val is not None:
                updates.append(f"{field} = ?")
                values.append(val)
        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            values.append(ad_id)
            db.execute(f"UPDATE ads SET {', '.join(updates)} WHERE id = ?", values)
        return {"message": "Publicite mise a jour"}


@router.delete("/ads/{ad_id}")
async def delete_ad(ad_id: int, admin: dict = Depends(require_admin)):
    """Delete an ad."""
    with get_db() as db:
        ad = db.execute("SELECT id FROM ads WHERE id = ?", (ad_id,)).fetchone()
        if not ad:
            raise HTTPException(status_code=404, detail="Publicite introuvable")
        db.execute("DELETE FROM ads WHERE id = ?", (ad_id,))
        return {"message": "Publicite supprimee"}
