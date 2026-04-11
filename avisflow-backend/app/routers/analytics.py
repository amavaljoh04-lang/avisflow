from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.models.schemas import AnalyticsResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/businesses/{business_id}/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(business_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE id = ? AND user_id = ?",
            (business_id, user["id"]),
        ).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")

        total = db.execute("SELECT COUNT(*) as c FROM reviews WHERE business_id = ?", (business_id,)).fetchone()["c"]
        avg = db.execute("SELECT COALESCE(AVG(rating), 0) as a FROM reviews WHERE business_id = ?", (business_id,)).fetchone()["a"]
        positive = db.execute(
            "SELECT COUNT(*) as c FROM reviews WHERE business_id = ? AND rating >= ?",
            (business_id, biz["positive_threshold"]),
        ).fetchone()["c"]
        negative = total - positive
        redirected = db.execute(
            "SELECT COUNT(*) as c FROM reviews WHERE business_id = ? AND redirected_to_google = 1",
            (business_id,),
        ).fetchone()["c"]
        scans = db.execute(
            "SELECT COALESCE(SUM(scan_count), 0) as s FROM qr_codes WHERE business_id = ?",
            (business_id,),
        ).fetchone()["s"]

        by_day = db.execute(
            """SELECT DATE(created_at) as day, COUNT(*) as count, ROUND(AVG(rating), 1) as avg_rating
            FROM reviews WHERE business_id = ?
            GROUP BY DATE(created_at) ORDER BY day DESC LIMIT 30""",
            (business_id,),
        ).fetchall()

        dist_rows = db.execute(
            "SELECT rating, COUNT(*) as count FROM reviews WHERE business_id = ? GROUP BY rating",
            (business_id,),
        ).fetchall()
        distribution = {str(i): 0 for i in range(1, 6)}
        for r in dist_rows:
            distribution[str(r["rating"])] = r["count"]

        return AnalyticsResponse(
            total_reviews=total,
            average_rating=round(avg, 2),
            positive_reviews=positive,
            negative_reviews=negative,
            redirected_to_google=redirected,
            total_scans=scans,
            reviews_by_day=[{"day": r["day"], "count": r["count"], "avg_rating": r["avg_rating"]} for r in by_day],
            rating_distribution=distribution,
        )
