import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from app.database import init_db
from app.routers import auth, businesses, reviews, qrcodes, analytics, admin, blog

app = FastAPI(title="AvisFlow API", version="1.0.0")

BASE_URL = os.getenv("BASE_URL", "https://avisflow.online")

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
app.include_router(blog.router)


@app.on_event("startup")
async def startup():
    init_db()


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/sitemap.xml")
async def sitemap():
    """Dynamic sitemap for SEO."""
    from app.database import get_db
    from datetime import datetime

    pages = [
        {"loc": "", "priority": "1.0", "changefreq": "weekly"},
        {"loc": "/register", "priority": "0.8", "changefreq": "monthly"},
        {"loc": "/login", "priority": "0.5", "changefreq": "monthly"},
        {"loc": "/blog", "priority": "0.9", "changefreq": "daily"},
    ]

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    for page in pages:
        xml += "  <url>\n"
        xml += f"    <loc>{BASE_URL}{page['loc']}</loc>\n"
        xml += f"    <changefreq>{page['changefreq']}</changefreq>\n"
        xml += f"    <priority>{page['priority']}</priority>\n"
        xml += "  </url>\n"

    # Add blog posts dynamically
    with get_db() as db:
        posts = db.execute(
            "SELECT slug, updated_at, created_at FROM blog_posts WHERE is_published = 1 ORDER BY created_at DESC"
        ).fetchall()
        for post in posts:
            lastmod = post["updated_at"] or post["created_at"]
            xml += "  <url>\n"
            xml += f"    <loc>{BASE_URL}/blog/{post['slug']}</loc>\n"
            if lastmod:
                xml += f"    <lastmod>{str(lastmod)[:10]}</lastmod>\n"
            xml += "    <changefreq>weekly</changefreq>\n"
            xml += "    <priority>0.7</priority>\n"
            xml += "  </url>\n"

        # Add public review pages
        businesses = db.execute(
            "SELECT slug, created_at FROM businesses WHERE is_active = 1 ORDER BY created_at DESC"
        ).fetchall()
        for biz in businesses:
            xml += "  <url>\n"
            xml += f"    <loc>{BASE_URL}/review/{biz['slug']}</loc>\n"
            xml += "    <changefreq>monthly</changefreq>\n"
            xml += "    <priority>0.6</priority>\n"
            xml += "  </url>\n"

    xml += "</urlset>"
    return Response(content=xml, media_type="application/xml")


@app.get("/robots.txt")
async def robots_txt():
    """robots.txt for search engine crawlers."""
    content = f"""User-agent: *
Allow: /
Allow: /blog
Allow: /review/
Disallow: /dashboard
Disallow: /admin
Disallow: /business/
Disallow: /api/

Sitemap: {BASE_URL}/sitemap.xml
"""
    return Response(content=content, media_type="text/plain")


@app.get("/api/public/ads")
async def public_ads():
    """Public active ads for landing page - no auth required."""
    from app.database import get_db
    with get_db() as db:
        rows = db.execute(
            "SELECT id, title, image_url, link_url, position FROM ads WHERE is_active = 1 ORDER BY created_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]


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
