import os
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException
from app.database import get_db
from app.models.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

BASE_URL = os.environ.get("BASE_URL", "https://avisflow.online").rstrip("/")


def _get_smtp_settings() -> dict | None:
    """Get SMTP settings from database (same as admin email settings)."""
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


def _send_verification_email(to_email: str, full_name: str, token: str):
    """Send verification email using configured SMTP settings."""
    settings = _get_smtp_settings()
    if not settings:
        return False

    verify_url = f"{BASE_URL}/verify?token={token}"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">AvisFlow</h1>
            <p style="color: #64748b; margin-top: 5px;">Plateforme d'avis Google</p>
        </div>
        <h2 style="color: #1e293b;">Bienvenue {full_name} !</h2>
        <p style="color: #475569; line-height: 1.6;">
            Merci de vous etre inscrit sur AvisFlow. Pour activer votre compte,
            veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{verify_url}" style="background: linear-gradient(135deg, #2563eb, #4f46e5);
                color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none;
                font-weight: bold; font-size: 16px; display: inline-block;">
                Confirmer mon email
            </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; text-align: center;">
            Ou copiez ce lien dans votre navigateur :<br>
            <a href="{verify_url}" style="color: #2563eb;">{verify_url}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Si vous n'avez pas cree de compte sur AvisFlow, ignorez cet email.
        </p>
    </div>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{settings.get('sender_name', 'AvisFlow')} <{settings['sender_email']}>"
        msg["To"] = to_email
        msg["Subject"] = "AvisFlow - Confirmez votre adresse email"
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        port = int(settings.get("smtp_port", 587))
        with smtplib.SMTP(settings["smtp_host"], port) as server:
            server.starttls()
            server.login(settings["smtp_user"], settings["smtp_password"])
            server.send_message(msg)
        return True
    except Exception:
        return False


@router.post("/register")
async def register(data: UserRegister):
    with get_db() as db:
        existing = db.execute("SELECT id FROM users WHERE email = ?", (data.email,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        verification_token = uuid.uuid4().hex
        cursor = db.execute(
            "INSERT INTO users (email, password_hash, full_name, role, is_verified, verification_token) VALUES (?, ?, ?, ?, ?, ?)",
            (data.email, hash_password(data.password), data.full_name, "user", 0, verification_token),
        )
        user_id = cursor.lastrowid

    # Try to send verification email
    email_sent = _send_verification_email(data.email, data.full_name, verification_token)

    if email_sent:
        return {
            "status": "verification_pending",
            "message": "Un email de verification a ete envoye. Verifiez votre boite de reception.",
        }
    else:
        # If SMTP not configured, auto-verify and return token (fallback)
        with get_db() as db:
            db.execute("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?", (user_id,))
            user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        token = create_access_token(user_id, "user")
        return {
            "status": "auto_verified",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"],
                "created_at": str(user["created_at"]),
                "is_active": bool(user["is_active"]),
            },
        }


@router.get("/verify")
async def verify_email(token: str):
    """Verify user email with token."""
    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE verification_token = ?", (token,)).fetchone()
        if not user:
            raise HTTPException(status_code=400, detail="Token de verification invalide ou expire")
        if user["is_verified"]:
            return {"message": "Email deja verifie", "already_verified": True}

        db.execute("UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?", (user["id"],))
        return {"message": "Email verifie avec succes ! Vous pouvez maintenant vous connecter.", "already_verified": False}


@router.post("/resend-verification")
async def resend_verification(data: UserLogin):
    """Resend verification email."""
    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE email = ?", (data.email,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="Aucun compte avec cet email")
        if not verify_password(data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Mot de passe incorrect")
        if user["is_verified"]:
            raise HTTPException(status_code=400, detail="Email deja verifie")

        verification_token = uuid.uuid4().hex
        db.execute("UPDATE users SET verification_token = ? WHERE id = ?", (verification_token, user["id"]))

    email_sent = _send_verification_email(user["email"], user["full_name"], verification_token)
    if not email_sent:
        raise HTTPException(status_code=500, detail="Impossible d'envoyer l'email. SMTP non configure.")

    return {"message": "Email de verification renvoye"}


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE email = ?", (data.email,)).fetchone()
        if not user or not verify_password(data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if not user["is_active"]:
            raise HTTPException(status_code=403, detail="Account deactivated")
        # Check email verification - default to verified for old accounts without the column
        is_verified = True
        try:
            is_verified = bool(user["is_verified"])
        except (IndexError, KeyError):
            pass
        if not is_verified:
            raise HTTPException(status_code=403, detail="EMAIL_NOT_VERIFIED")

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
