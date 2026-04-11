import io
import base64
import qrcode
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from app.database import get_db
from app.models.schemas import QRCodeCreate, QRCodeResponse
from app.utils.auth import get_current_user

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
async def get_qrcode_image(business_id: int, qr_id: int, user: dict = Depends(get_current_user)):
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

        review_url = f"https://avisflow.online/review/{biz['slug']}"

        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(review_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#1e293b", back_color="white")

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        return Response(content=buf.getvalue(), media_type="image/png")


@router.get("/{qr_id}/data")
async def get_qrcode_data(business_id: int, qr_id: int, user: dict = Depends(get_current_user)):
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

        review_url = f"https://avisflow.online/review/{biz['slug']}"

        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(review_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#1e293b", back_color="white")

        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        b64 = base64.b64encode(buf.getvalue()).decode()

        return {
            "url": review_url,
            "image_base64": f"data:image/png;base64,{b64}",
            "label": qr_record["label"],
            "scan_count": qr_record["scan_count"],
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
