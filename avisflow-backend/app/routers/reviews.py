from fastapi import APIRouter, HTTPException, Depends, Request
from app.database import get_db
from app.models.schemas import ReviewSubmit, ReviewResponse
from app.utils.auth import get_current_user

router = APIRouter(tags=["reviews"])


@router.get("/api/businesses/{business_id}/reviews", response_model=list[ReviewResponse])
async def list_reviews(business_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ? AND user_id = ?",
            (business_id, user["id"]),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        rows = db.execute(
            "SELECT * FROM reviews WHERE business_id = ? ORDER BY created_at DESC",
            (business_id,),
        ).fetchall()
        return [_review_response(r) for r in rows]


@router.post("/api/r/{slug}")
async def submit_review(slug: str, data: ReviewSubmit):
    """Public endpoint - customers submit reviews here.
    No review gating: Google URL is always returned so the customer can choose freely."""
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE slug = ? AND is_active = 1",
            (slug,),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        db.execute(
            """INSERT INTO reviews (business_id, rating, feedback, customer_name, customer_email, source, redirected_to_google)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (biz["id"], data.rating, data.feedback, data.customer_name,
             data.customer_email, "qrcode", 0),
        )

        return {
            "message": "Thank you for your feedback!",
            "google_review_url": biz["google_review_url"] or None,
            "business_name": biz["name"],
        }


@router.get("/api/r/{slug}/info")
async def get_business_public_info(slug: str):
    """Public endpoint - get business info for the review page.
    Also increments scan_count on the business's QR codes."""
    with get_db() as db:
        biz = db.execute(
            "SELECT id, name, slug, category, primary_color, logo_url, positive_threshold FROM businesses WHERE slug = ? AND is_active = 1",
            (slug,),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        # Increment scan count on all active QR codes for this business
        db.execute(
            "UPDATE qr_codes SET scan_count = scan_count + 1 WHERE business_id = ? AND is_active = 1",
            (biz["id"],),
        )

        return {
            "name": biz["name"],
            "slug": biz["slug"],
            "category": biz["category"],
            "primary_color": biz["primary_color"],
            "logo_url": biz["logo_url"],
            "positive_threshold": biz["positive_threshold"],
            "google_review_url": db.execute(
                "SELECT google_review_url FROM businesses WHERE id = ?", (biz["id"],)
            ).fetchone()["google_review_url"],
        }


def _review_response(row) -> ReviewResponse:
    return ReviewResponse(
        id=row["id"],
        business_id=row["business_id"],
        rating=row["rating"],
        feedback=row["feedback"],
        customer_name=row["customer_name"],
        customer_email=row["customer_email"],
        source=row["source"],
        redirected_to_google=bool(row["redirected_to_google"]),
        created_at=str(row["created_at"]),
    )
