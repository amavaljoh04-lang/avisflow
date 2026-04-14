import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, HTMLResponse
from fastapi.staticfiles import StaticFiles
from app.database import init_db
from app.routers import auth, businesses, reviews, qrcodes, analytics, admin, blog

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/data/uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="AvisFlow API", version="1.0.0")

# Serve uploaded logos at /uploads/
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

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


@app.get("/api/public/widget/{slug}")
async def public_widget(slug: str):
    """Embeddable HTML widget showing business reviews. Includes 'Powered by AvisFlow' branding."""
    from app.database import get_db
    with get_db() as db:
        biz = db.execute(
            "SELECT * FROM businesses WHERE slug = ? AND is_active = 1", (slug,)
        ).fetchone()
        if not biz:
            return HTMLResponse("<p>Business not found</p>", status_code=404)

        reviews = db.execute(
            "SELECT rating, feedback, customer_name, created_at FROM reviews WHERE business_id = ? ORDER BY created_at DESC LIMIT 5",
            (biz["id"],),
        ).fetchall()
        avg = db.execute(
            "SELECT COALESCE(AVG(rating), 0) as a, COUNT(*) as c FROM reviews WHERE business_id = ?",
            (biz["id"],),
        ).fetchone()

        stars_html = ""
        for r in reviews:
            star_icons = "".join(
                f'<span style="color:{"#f59e0b" if i < r["rating"] else "#d1d5db"}">&#9733;</span>'
                for i in range(5)
            )
            name = r["customer_name"] or "Client"
            feedback = f'<p style="margin:4px 0;color:#374151;font-size:14px">{r["feedback"]}</p>' if r["feedback"] else ""
            stars_html += f'''<div style="border-bottom:1px solid #e5e7eb;padding:12px 0">
                <div>{star_icons} <span style="color:#6b7280;font-size:12px">{name}</span></div>
                {feedback}
            </div>'''

        if not stars_html:
            stars_html = '<p style="color:#6b7280;padding:12px 0">Aucun avis pour le moment</p>'

        avg_stars = "".join(
            f'<span style="color:{"#f59e0b" if i < round(avg["a"]) else "#d1d5db"};font-size:20px">&#9733;</span>'
            for i in range(5)
        )

        html = f'''<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
*{{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}}
</style></head><body>
<div style="max-width:400px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#fff">
  <div style="padding:16px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff">
    <h3 style="font-size:16px;font-weight:600">{biz["name"]}</h3>
    <div style="margin-top:4px">{avg_stars} <span style="font-size:14px">{avg["a"]:.1f}/5 ({avg["c"]} avis)</span></div>
  </div>
  <div style="padding:0 16px">{stars_html}</div>
  <div style="padding:12px 16px;text-align:center;border-top:1px solid #e5e7eb">
    <a href="{BASE_URL}/review/{slug}" target="_blank" style="color:#2563eb;text-decoration:none;font-size:13px;font-weight:500">
      Laisser un avis
    </a>
    <span style="color:#d1d5db;margin:0 8px">|</span>
    <a href="{BASE_URL}" target="_blank" style="color:#6b7280;text-decoration:none;font-size:11px">
      Propuls\u00e9 par <strong style="color:#2563eb">AvisFlow</strong>
    </a>
  </div>
</div>
</body></html>'''
        return HTMLResponse(html)


@app.get("/api/public/embed-code/{slug}")
async def embed_code(slug: str):
    """Return the embed code snippet for a business widget."""
    return {
        "html": f'<iframe src="{BASE_URL}/api/public/widget/{slug}" width="400" height="450" frameborder="0" style="border:none;border-radius:12px;overflow:hidden"></iframe>',
        "url": f"{BASE_URL}/api/public/widget/{slug}",
    }


PREDEFINED_CATEGORIES = [
    "Restaurant", "Coiffeur", "Barbier", "Boulangerie", "Garage", "Pharmacie",
    "Salon de beauté", "Hôtel", "Café", "Magasin", "Clinique", "Dentiste",
    "Vétérinaire", "Fleuriste", "Librairie", "Bar", "Pizzeria", "Pressing",
    "Opticien", "Épicerie", "Autre",
]


@app.get("/api/directory/categories")
async def directory_categories():
    """List all predefined business categories."""
    return PREDEFINED_CATEGORIES


@app.get("/api/directory")
async def directory(category: str = "", search: str = ""):
    """Public directory of all active businesses, with optional filters."""
    from app.database import get_db
    with get_db() as db:
        query = "SELECT b.id, b.name, b.slug, b.category, b.address, b.logo_url, COALESCE(AVG(r.rating), 0) as avg_rating, COUNT(r.id) as review_count FROM businesses b LEFT JOIN reviews r ON r.business_id = b.id WHERE b.is_active = 1"
        params: list = []
        if category:
            query += " AND b.category = ?"
            params.append(category)
        if search:
            query += " AND b.name LIKE ?"
            params.append(f"%{search}%")
        query += " GROUP BY b.id ORDER BY review_count DESC, avg_rating DESC"
        rows = db.execute(query, params).fetchall()
        return [
            {
                "id": r["id"], "name": r["name"], "slug": r["slug"],
                "category": r["category"], "address": r["address"],
                "logo_url": r["logo_url"],
                "avg_rating": round(r["avg_rating"], 1),
                "review_count": r["review_count"],
            }
            for r in rows
        ]


@app.get("/api/google-place-search")
async def google_place_search(query: str):
    """Search Google Maps for a business and return the direct write-review URL."""
    import httpx
    import re
    import urllib.parse

    if not query or len(query.strip()) < 3:
        return {"results": []}

    search_url = f"https://www.google.com/maps/search/{urllib.parse.quote(query)}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    }

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            resp = await client.get(search_url, headers=headers)
            text = resp.text

            results = []

            # Extract Place IDs (ChIJ format)
            place_ids = re.findall(r'ChIJ[A-Za-z0-9_-]{20,}', text)
            seen = set()
            for pid in place_ids:
                if pid not in seen:
                    seen.add(pid)
                    results.append({
                        "place_id": pid,
                        "review_url": f"https://search.google.com/local/writereview?placeid={pid}",
                    })

            # Also extract CIDs (numeric IDs)
            cids = re.findall(r'0x[0-9a-f]+:0x([0-9a-f]+)', text)
            for cid_hex in cids:
                cid = str(int(cid_hex, 16))
                if cid not in seen:
                    seen.add(cid)
                    results.append({
                        "place_id": cid,
                        "review_url": f"https://search.google.com/local/writereview?placecid={cid}",
                    })

            return {"results": results[:5], "search_query": query}

    except Exception as e:
        return {"results": [], "error": str(e)}


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
