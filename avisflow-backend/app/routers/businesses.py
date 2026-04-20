import re
import os
import uuid
import base64
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from app.database import get_db
from app.models.schemas import BusinessCreate, BusinessUpdate, BusinessResponse
from app.utils.auth import get_current_user

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/data/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/api/businesses", tags=["businesses"])


def make_slug(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return f"{slug}-{uuid.uuid4().hex[:6]}"


@router.post("", response_model=BusinessResponse)
async def create_business(data: BusinessCreate, user: dict = Depends(get_current_user)):
    slug = make_slug(data.name)
    with get_db() as db:
        cursor = db.execute(
            """INSERT INTO businesses (user_id, name, slug, category, address, phone, google_review_url, primary_color, positive_threshold)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (user["id"], data.name, slug, data.category, data.address, data.phone,
             data.google_review_url, data.primary_color, data.positive_threshold),
        )
        biz = db.execute("SELECT * FROM businesses WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return _biz_response(biz)


@router.get("", response_model=list[BusinessResponse])
async def list_businesses(user: dict = Depends(get_current_user)):
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM businesses WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC",
            (user["id"],),
        ).fetchall()
        return [_biz_response(r) for r in rows]


@router.get("/{business_id}", response_model=BusinessResponse)
async def get_business(business_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ? AND user_id = ?",
            (business_id, user["id"]),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")
        return _biz_response(biz)


@router.put("/{business_id}", response_model=BusinessResponse)
async def update_business(business_id: int, data: BusinessUpdate, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ? AND user_id = ?",
            (business_id, user["id"]),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        updates = {k: v for k, v in data.model_dump().items() if v is not None}
        if updates:
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            values = list(updates.values()) + [business_id]
            db.execute(f"UPDATE businesses SET {set_clause} WHERE id = ?", values)

        biz = db.execute("SELECT * FROM businesses WHERE id = ?", (business_id,)).fetchone()
        return _biz_response(biz)


@router.delete("/{business_id}")
async def delete_business(business_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ? AND user_id = ?",
            (business_id, user["id"]),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")
        db.execute("UPDATE businesses SET is_active = 0 WHERE id = ?", (business_id,))
        return {"message": "Business deleted"}


@router.post("/{business_id}/logo")
async def upload_logo(business_id: int, file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """Upload a logo for a business. Used for personalized QR codes."""
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ? AND user_id = ?",
            (business_id, user["id"]),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        content = await file.read()
        if len(content) > 2 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Logo trop volumineux (max 2 Mo)")

        ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "png"
        if ext not in ("png", "jpg", "jpeg", "webp", "svg"):
            raise HTTPException(status_code=400, detail="Format non supporté (PNG, JPG, WEBP)")

        filename = f"logo_{business_id}_{uuid.uuid4().hex[:8]}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(content)

        logo_url = f"/uploads/{filename}"
        db.execute("UPDATE businesses SET logo_url = ? WHERE id = ?", (logo_url, business_id))

        return {"logo_url": logo_url}


@router.get("/{business_id}/logo-data")
async def get_logo_base64(business_id: int, user: dict = Depends(get_current_user)):
    """Get business logo as base64 data URI."""
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ? AND user_id = ?",
            (business_id, user["id"]),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        if not biz["logo_url"]:
            return {"logo_base64": None}

        filepath = os.path.join(UPLOAD_DIR, os.path.basename(biz["logo_url"]))
        if not os.path.exists(filepath):
            return {"logo_base64": None}

        with open(filepath, "rb") as f:
            data = f.read()
        ext = filepath.rsplit(".", 1)[-1].lower()
        mime = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}.get(ext, "image/png")
        b64 = base64.b64encode(data).decode()
        return {"logo_base64": f"data:{mime};base64,{b64}"}


def _biz_response(row) -> BusinessResponse:
    return BusinessResponse(
        id=row["id"],
        user_id=row["user_id"],
        name=row["name"],
        slug=row["slug"],
        category=row["category"],
        address=row["address"],
        phone=row["phone"],
        google_review_url=row["google_review_url"],
        logo_url=row["logo_url"],
        primary_color=row["primary_color"],
        positive_threshold=row["positive_threshold"],
        created_at=str(row["created_at"]),
        is_active=bool(row["is_active"]),
    )
