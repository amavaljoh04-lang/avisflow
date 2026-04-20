import io
import os
import base64
import qrcode
from PIL import Image, ImageDraw
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import Response
from app.database import get_db
from app.models.schemas import QRCodeCreate, QRCodeResponse
from app.utils.auth import get_current_user

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/data/uploads")


def _generate_qr_image(
    url: str,
    fill_color: str = "#1e293b",
    back_color: str = "white",
    logo_path: str | None = None,
    box_size: int = 10,
    border: int = 4,
    style: str = "square",
) -> Image.Image:
    """Generate a QR code image with optional logo overlay and custom colors."""
    error_correction = qrcode.constants.ERROR_CORRECT_H if logo_path else qrcode.constants.ERROR_CORRECT_M
    qr = qrcode.QRCode(version=None, error_correction=error_correction, box_size=box_size, border=border)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color=fill_color, back_color=back_color).convert("RGBA")

    # Round corners if style is "rounded"
    if style == "rounded":
        mask = Image.new("L", img.size, 0)
        draw = ImageDraw.Draw(mask)
        radius = min(img.size) // 30
        draw.rounded_rectangle([(0, 0), img.size], radius=radius, fill=255)
        result = Image.new("RGBA", img.size, (255, 255, 255, 0))
        result.paste(img, mask=mask)
        img = result

    # Overlay logo in the center
    if logo_path and os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert("RGBA")
            # Logo should be ~20% of QR code size
            logo_max = int(img.size[0] * 0.22)
            logo.thumbnail((logo_max, logo_max), Image.LANCZOS)

            # Create white rounded background for logo
            bg_size = int(logo_max * 1.2)
            bg = Image.new("RGBA", (bg_size, bg_size), (255, 255, 255, 0))
            bg_draw = ImageDraw.Draw(bg)
            bg_draw.rounded_rectangle([(0, 0), (bg_size - 1, bg_size - 1)], radius=bg_size // 8, fill=(255, 255, 255, 255))

            # Center logo on background
            logo_x = (bg_size - logo.size[0]) // 2
            logo_y = (bg_size - logo.size[1]) // 2
            bg.paste(logo, (logo_x, logo_y), logo)

            # Center background on QR code
            pos_x = (img.size[0] - bg_size) // 2
            pos_y = (img.size[1] - bg_size) // 2
            img.paste(bg, (pos_x, pos_y), bg)
        except Exception:
            pass  # If logo fails, just return QR without logo

    return img

BASE_URL = os.environ.get("BASE_URL", "https://avisflow.online").rstrip("/")

router = APIRouter(prefix="/api/businesses/{business_id}/qrcodes", tags=["qrcodes"])


@router.post("", response_model=QRCodeResponse)
async def create_qrcode(business_id: int, data: QRCodeCreate, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ? AND user_id = ?",
            (business_id, user["id"]),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        cursor = db.execute(
            "INSERT INTO qr_codes (business_id, label) VALUES (?, ?)",
            (business_id, data.label),
        )
        qr = db.execute("SELECT * FROM qr_codes WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return _qr_response(qr)


@router.get("", response_model=list[QRCodeResponse])
async def list_qrcodes(business_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ? AND user_id = ?",
            (business_id, user["id"]),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        rows = db.execute(
            "SELECT * FROM qr_codes WHERE business_id = ? AND is_active = 1 ORDER BY created_at DESC",
            (business_id,),
        ).fetchall()
        return [_qr_response(r) for r in rows]


@router.get("/{qr_id}/image")
async def get_qrcode_image(
    business_id: int,
    qr_id: int,
    color: str = Query(default=None, description="QR fill color hex"),
    bg: str = Query(default=None, description="QR background color"),
    style: str = Query(default="square", description="square or rounded"),
    logo: int = Query(default=1, description="Include logo if available (1=yes, 0=no)"),
):
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ?",
            (business_id,),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        qr_record = db.execute(
            "SELECT * FROM qr_codes WHERE id = ? AND business_id = ?",
            (qr_id, business_id),
        ).fetchone()
        if not qr_record:
            raise HTTPException(status_code=404, detail="QR code not found")

        review_url = f"{BASE_URL}/review/{biz['slug']}"
        fill = color or biz["primary_color"] or "#1e293b"
        back = bg or "white"

        logo_path = None
        if logo and biz["logo_url"]:
            logo_path = os.path.join(UPLOAD_DIR, os.path.basename(biz["logo_url"]))

        img = _generate_qr_image(review_url, fill_color=fill, back_color=back, logo_path=logo_path, style=style)

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        return Response(content=buf.getvalue(), media_type="image/png")


@router.get("/{qr_id}/data")
async def get_qrcode_data(
    business_id: int,
    qr_id: int,
    user: dict = Depends(get_current_user),
    color: str = Query(default=None, description="QR fill color hex"),
    bg: str = Query(default=None, description="QR background color"),
    style: str = Query(default="square", description="square or rounded"),
    with_logo: int = Query(default=1, description="Include logo if available"),
):
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ? AND user_id = ?",
            (business_id, user["id"]),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        qr_record = db.execute(
            "SELECT * FROM qr_codes WHERE id = ? AND business_id = ?",
            (qr_id, business_id),
        ).fetchone()
        if not qr_record:
            raise HTTPException(status_code=404, detail="QR code not found")

        review_url = f"{BASE_URL}/review/{biz['slug']}"
        fill = color or biz["primary_color"] or "#1e293b"
        back = bg or "white"

        logo_path = None
        if with_logo and biz["logo_url"]:
            logo_path = os.path.join(UPLOAD_DIR, os.path.basename(biz["logo_url"]))

        img = _generate_qr_image(review_url, fill_color=fill, back_color=back, logo_path=logo_path, style=style)

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        b64 = base64.b64encode(buf.getvalue()).decode()

        return {
            "url": review_url,
            "image_base64": f"data:image/png;base64,{b64}",
            "label": qr_record["label"],
            "scan_count": qr_record["scan_count"],
            "has_logo": bool(biz["logo_url"]),
        }


@router.delete("/{qr_id}")
async def delete_qrcode(business_id: int, qr_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ? AND user_id = ?",
            (business_id, user["id"]),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        db.execute("UPDATE qr_codes SET is_active = 0 WHERE id = ? AND business_id = ?", (qr_id, business_id))
        return {"message": "QR code deleted"}


def _qr_response(row) -> QRCodeResponse:
    return QRCodeResponse(
        id=row["id"],
        business_id=row["business_id"],
        label=row["label"],
        scan_count=row["scan_count"],
        created_at=str(row["created_at"]),
        is_active=bool(row["is_active"]),
    )
