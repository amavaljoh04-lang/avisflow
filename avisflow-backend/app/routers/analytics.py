from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from app.database import get_db
from app.models.schemas import (
    AnalyticsResponse, AutoResponseCreate, AutoResponseResponse, AlertResponse,
)
from app.utils.auth import get_current_user
import json
from datetime import datetime

router = APIRouter(prefix="/api/businesses/{business_id}", tags=["analytics"])


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(business_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute("SELECT * FROM businesses WHERE id = ? AND user_id = ?", (business_id, user["id"])).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")
        total = db.execute("SELECT COUNT(*) as c FROM reviews WHERE business_id = ?", (business_id,)).fetchone()["c"]
        avg = db.execute("SELECT COALESCE(AVG(rating), 0) as a FROM reviews WHERE business_id = ?", (business_id,)).fetchone()["a"]
        positive = db.execute("SELECT COUNT(*) as c FROM reviews WHERE business_id = ? AND rating >= ?", (business_id, biz["positive_threshold"])).fetchone()["c"]
        negative = total - positive
        redirected = db.execute("SELECT COUNT(*) as c FROM reviews WHERE business_id = ? AND redirected_to_google = 1", (business_id,)).fetchone()["c"]
        scans = db.execute("SELECT COALESCE(SUM(scan_count), 0) as s FROM qr_codes WHERE business_id = ?", (business_id,)).fetchone()["s"]
        by_day = db.execute("SELECT DATE(created_at) as day, COUNT(*) as count, ROUND(AVG(rating), 1) as avg_rating FROM reviews WHERE business_id = ? GROUP BY DATE(created_at) ORDER BY day DESC LIMIT 30", (business_id,)).fetchall()
        dist_rows = db.execute("SELECT rating, COUNT(*) as count FROM reviews WHERE business_id = ? GROUP BY rating", (business_id,)).fetchall()
        distribution = {str(i): 0 for i in range(1, 6)}
        for r in dist_rows:
            distribution[str(r["rating"])] = r["count"]
        return AnalyticsResponse(
            total_reviews=total, average_rating=round(avg, 2), positive_reviews=positive,
            negative_reviews=negative, redirected_to_google=redirected, total_scans=scans,
            reviews_by_day=[{"day": r["day"], "count": r["count"], "avg_rating": r["avg_rating"]} for r in by_day],
            rating_distribution=distribution,
        )


@router.get("/insights")
async def get_insights(business_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute("SELECT * FROM businesses WHERE id = ? AND user_id = ?", (business_id, user["id"])).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")
        tag_rows = db.execute(
            "SELECT rt.tag, COUNT(*) as count FROM review_tags rt JOIN reviews r ON r.id = rt.review_id WHERE r.business_id = ? GROUP BY rt.tag ORDER BY count DESC",
            (business_id,),
        ).fetchall()
        tag_distribution = {r["tag"]: r["count"] for r in tag_rows}
        score_rows = db.execute(
            "SELECT rs.category, ROUND(AVG(rs.score), 1) as avg_score FROM review_scores rs JOIN reviews r ON r.id = rs.review_id WHERE r.business_id = ? GROUP BY rs.category",
            (business_id,),
        ).fetchall()
        category_averages = {r["category"]: r["avg_score"] for r in score_rows}
        avg_7d = db.execute("SELECT COALESCE(AVG(rating), 0) as a FROM reviews WHERE business_id = ? AND created_at >= datetime('now', '-7 days')", (business_id,)).fetchone()["a"]
        avg_prev_7d = db.execute("SELECT COALESCE(AVG(rating), 0) as a FROM reviews WHERE business_id = ? AND created_at >= datetime('now', '-14 days') AND created_at < datetime('now', '-7 days')", (business_id,)).fetchone()["a"]
        weekly_change = round(avg_7d - avg_prev_7d, 2) if avg_prev_7d > 0 else 0.0
        trend = "up" if weekly_change > 0.1 else ("down" if weekly_change < -0.1 else "stable")
        issue_rows = db.execute(
            "SELECT rt.tag, COUNT(*) as count FROM review_tags rt JOIN reviews r ON r.id = rt.review_id WHERE r.business_id = ? AND r.rating <= 3 GROUP BY rt.tag ORDER BY count DESC LIMIT 5",
            (business_id,),
        ).fetchall()
        top_issues = [{"tag": r["tag"], "count": r["count"]} for r in issue_rows]
        feedback_rows = db.execute("SELECT feedback FROM reviews WHERE business_id = ? AND feedback IS NOT NULL AND feedback != ''", (business_id,)).fetchall()
        word_counts: dict[str, int] = {}
        stop_words = {"le", "la", "les", "de", "du", "des", "un", "une", "et", "en", "est", "a", "au", "aux", "ce", "que", "qui", "dans", "pour", "pas", "sur", "avec", "plus", "son", "par", "se", "the", "is", "and", "to", "of", "in", "it", "was", "for", "but", "not", "very", "tres", "bien", "bon", "mais", "tout"}
        for row in feedback_rows:
            for w in row["feedback"].lower().split():
                w = w.strip(".,!?;:'\"()-")
                if len(w) > 2 and w not in stop_words:
                    word_counts[w] = word_counts.get(w, 0) + 1
        keyword_insights = [{"word": w, "count": c} for w, c in sorted(word_counts.items(), key=lambda x: x[1], reverse=True)[:10]]
        all_avgs = db.execute("SELECT business_id, COALESCE(AVG(rating), 0) as avg_r FROM reviews GROUP BY business_id").fetchall()
        my_avg = db.execute("SELECT COALESCE(AVG(rating), 0) as a FROM reviews WHERE business_id = ?", (business_id,)).fetchone()["a"]
        if len(all_avgs) > 1:
            better_count = sum(1 for r in all_avgs if r["avg_r"] <= my_avg)
            percentile = int((better_count / len(all_avgs)) * 100)
        else:
            percentile = 50
        return {
            "tag_distribution": tag_distribution, "category_averages": category_averages,
            "trend": trend, "weekly_change": weekly_change, "top_issues": top_issues,
            "keyword_insights": keyword_insights, "comparison_percentile": percentile,
            "total_businesses_compared": len(all_avgs),
        }


@router.get("/auto-responses", response_model=list[AutoResponseResponse])
async def list_auto_responses(business_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute("SELECT * FROM businesses WHERE id = ? AND user_id = ?", (business_id, user["id"])).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")
        rows = db.execute("SELECT * FROM auto_responses WHERE business_id = ? ORDER BY created_at DESC", (business_id,)).fetchall()
        return [AutoResponseResponse(id=r["id"], business_id=r["business_id"], trigger_type=r["trigger_type"], message=r["message"], is_active=bool(r["is_active"]), created_at=str(r["created_at"])) for r in rows]


@router.post("/auto-responses", response_model=AutoResponseResponse)
async def create_auto_response(business_id: int, data: AutoResponseCreate, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute("SELECT * FROM businesses WHERE id = ? AND user_id = ?", (business_id, user["id"])).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")
        cursor = db.execute("INSERT INTO auto_responses (business_id, trigger_type, message, is_active) VALUES (?, ?, ?, ?)", (business_id, data.trigger_type, data.message, int(data.is_active)))
        row = db.execute("SELECT * FROM auto_responses WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return AutoResponseResponse(id=row["id"], business_id=row["business_id"], trigger_type=row["trigger_type"], message=row["message"], is_active=bool(row["is_active"]), created_at=str(row["created_at"]))


@router.delete("/auto-responses/{response_id}")
async def delete_auto_response(business_id: int, response_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute("SELECT * FROM businesses WHERE id = ? AND user_id = ?", (business_id, user["id"])).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")
        db.execute("DELETE FROM auto_responses WHERE id = ? AND business_id = ?", (response_id, business_id))
        return {"message": "Auto-response deleted"}


@router.get("/alerts", response_model=list[AlertResponse])
async def list_alerts(business_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute("SELECT * FROM businesses WHERE id = ? AND user_id = ?", (business_id, user["id"])).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")
        rows = db.execute("SELECT * FROM alerts WHERE business_id = ? ORDER BY created_at DESC LIMIT 20", (business_id,)).fetchall()
        return [AlertResponse(id=r["id"], business_id=r["business_id"], alert_type=r["alert_type"], message=r["message"], is_read=bool(r["is_read"]), created_at=str(r["created_at"])) for r in rows]


@router.put("/alerts/{alert_id}/read")
async def mark_alert_read(business_id: int, alert_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute("SELECT * FROM businesses WHERE id = ? AND user_id = ?", (business_id, user["id"])).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")
        db.execute("UPDATE alerts SET is_read = 1 WHERE id = ? AND business_id = ?", (alert_id, business_id))
        return {"message": "Alert marked as read"}


@router.get("/export")
async def export_data(business_id: int, user: dict = Depends(get_current_user)):
    with get_db() as db:
        biz = db.execute("SELECT * FROM businesses WHERE id = ? AND user_id = ?", (business_id, user["id"])).fetchone()
        if not biz:
            raise HTTPException(status_code=404, detail="Business not found")
        reviews = db.execute("SELECT * FROM reviews WHERE business_id = ? ORDER BY created_at DESC", (business_id,)).fetchall()
        export_reviews = []
        for r in reviews:
            tags = db.execute("SELECT tag FROM review_tags WHERE review_id = ?", (r["id"],)).fetchall()
            scores = db.execute("SELECT category, score FROM review_scores WHERE review_id = ?", (r["id"],)).fetchall()
            export_reviews.append({
                "id": r["id"], "rating": r["rating"], "feedback": r["feedback"],
                "customer_name": r["customer_name"], "created_at": str(r["created_at"]),
                "tags": [t["tag"] for t in tags],
                "scores": {s["category"]: s["score"] for s in scores},
            })
        total = len(export_reviews)
        avg_rating = sum(r["rating"] for r in export_reviews) / total if total > 0 else 0
        export = {
            "business": {"name": biz["name"], "slug": biz["slug"], "category": biz["category"]},
            "summary": {"total_reviews": total, "average_rating": round(avg_rating, 2), "exported_at": datetime.now().isoformat()},
            "reviews": export_reviews,
        }
        return Response(
            content=json.dumps(export, indent=2, ensure_ascii=False),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="avisflow-export-{biz["slug"]}.json"'},
        )
