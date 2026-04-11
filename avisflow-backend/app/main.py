from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import auth, businesses, reviews, qrcodes, analytics, admin

app = FastAPI(title="AvisFlow API", version="1.0.0")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router)
app.include_router(businesses.router)
app.include_router(reviews.router)
app.include_router(qrcodes.router)
app.include_router(analytics.router)
app.include_router(admin.router)


@app.on_event("startup")
async def startup():
    init_db()


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/api/public/stats")
async def public_stats():
    """Public stats for landing page - no auth required."""
    from app.database import get_db
    with get_db() as db:
        total_businesses = db.execute("SELECT COUNT(*) as c FROM businesses WHERE is_active = 1").fetchone()["c"]
        total_reviews = db.execute("SELECT COUNT(*) as c FROM reviews").fetchone()["c"]
        total_users = db.execute("SELECT COUNT(*) as c FROM users WHERE is_active = 1").fetchone()["c"]
        avg_rating = db.execute("SELECT COALESCE(AVG(rating), 0) as a FROM reviews").fetchone()["a"]
        redirected = db.execute("SELECT COUNT(*) as c FROM reviews WHERE redirected_to_google = 1").fetchone()["c"]
        return {
            "total_businesses": total_businesses,
            "total_reviews": total_reviews,
            "total_users": total_users,
            "average_rating": round(avg_rating, 1),
            "redirected_to_google": redirected,
        }
