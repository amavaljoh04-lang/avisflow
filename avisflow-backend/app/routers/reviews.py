from fastapi import APIRouter, HTTPException, Depends
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
        return [_review_with_details(db, r) for r in rows]


@router.post("/api/r/{slug}")
async def submit_review(slug: str, data: ReviewSubmit):
    """Public endpoint - customers submit reviews here."""
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE slug = ? AND is_active = 1", (slug,),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        cursor = db.execute(
            """INSERT INTO reviews (business_id, rating, feedback, customer_name, customer_email, source, redirected_to_google)
            VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (biz["id"], data.rating, data.feedback, data.customer_name,
             data.customer_email, "qrcode", 0),
        )
        review_id = cursor.lastrowid

        # Save structured feedback tags
        if data.tags:
            for tag in data.tags:
                db.execute("INSERT INTO review_tags (review_id, tag) VALUES (?, ?)", (review_id, tag))

        # Save category scores
        if data.scores:
            for cat, sc in data.scores.items():
                if 1 <= sc <= 5:
                    db.execute("INSERT INTO review_scores (review_id, category, score) VALUES (?, ?, ?)", (review_id, cat, sc))

        # Check for auto-response
        auto_msg = None
        trigger = "positive" if data.rating >= 4 else "negative"
        ar = db.execute(
            "SELECT message FROM auto_responses WHERE business_id = ? AND trigger_type IN (?, 'all') AND is_active = 1 ORDER BY id DESC LIMIT 1",
            (biz["id"], trigger),
        ).fetchone()
        if ar:
            auto_msg = ar["message"]

        # Check alerts
        _check_alerts(db, biz["id"])

        return {
            "message": "Thank you for your feedback!",
            "google_review_url": biz["google_review_url"] or None,
            "business_name": biz["name"],
            "auto_response": auto_msg,
        }


def _check_alerts(db, business_id: int):
    recent_neg = db.execute(
        "SELECT COUNT(*) as c FROM reviews WHERE business_id = ? AND rating <= 2 AND created_at >= datetime('now', '-7 days')",
        (business_id,),
    ).fetchone()["c"]
    if recent_neg >= 3:
        existing = db.execute(
            "SELECT id FROM alerts WHERE business_id = ? AND alert_type = 'negative_spike' AND created_at >= datetime('now', '-1 day')",
            (business_id,),
        ).fetchone()
        if not existing:
            db.execute(
                "INSERT INTO alerts (business_id, alert_type, message) VALUES (?, ?, ?)",
                (business_id, "negative_spike", f"Alerte : {recent_neg} avis negatifs cette semaine"),
            )
    avg_30d = db.execute(
        "SELECT COALESCE(AVG(rating), 0) as a FROM reviews WHERE business_id = ? AND created_at >= datetime('now', '-30 days')",
        (business_id,),
    ).fetchone()["a"]
    avg_7d = db.execute(
        "SELECT COALESCE(AVG(rating), 0) as a FROM reviews WHERE business_id = ? AND created_at >= datetime('now', '-7 days')",
        (business_id,),
    ).fetchone()["a"]
    if avg_30d > 0 and avg_7d > 0 and (avg_30d - avg_7d) >= 0.5:
        existing = db.execute(
            "SELECT id FROM alerts WHERE business_id = ? AND alert_type = 'rating_drop' AND created_at >= datetime('now', '-1 day')",
            (business_id,),
        ).fetchone()
        if not existing:
            db.execute(
                "INSERT INTO alerts (business_id, alert_type, message) VALUES (?, ?, ?)",
                (business_id, "rating_drop", f"Alerte : note moyenne en baisse (30j: {avg_30d:.1f} -> 7j: {avg_7d:.1f})"),
            )


@router.get("/api/r/{slug}/info")
async def get_business_public_info(slug: str):
    """Public endpoint - get business info for the review page."""
    with get_db() as db:
        biz = db.execute(
            "SELECT id, name, slug, category, primary_color, logo_url, positive_threshold FROM businesses WHERE slug = ? AND is_active = 1",
            (slug,),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")
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


def _review_with_details(db, row) -> ReviewResponse:
    tags_rows = db.execute("SELECT tag FROM review_tags WHERE review_id = ?", (row["id"],)).fetchall()
    tags = [t["tag"] for t in tags_rows] if tags_rows else None
    scores_rows = db.execute("SELECT category, score FROM review_scores WHERE review_id = ?", (row["id"],)).fetchall()
    scores = {s["category"]: s["score"] for s in scores_rows} if scores_rows else None
    return ReviewResponse(
        id=row["id"], business_id=row["business_id"], rating=row["rating"],
        feedback=row["feedback"], customer_name=row["customer_name"],
        customer_email=row["customer_email"], source=row["source"],
        redirected_to_google=bool(row["redirected_to_google"]),
        created_at=str(row["created_at"]), tags=tags, scores=scores,
    )
