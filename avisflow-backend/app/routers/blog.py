from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.utils.auth import require_admin
import re
import unicodedata

router = APIRouter(prefix="/api/blog", tags=["blog"])


class BlogPostCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    lang: str = "fr"
    is_published: bool = True


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    lang: Optional[str] = None
    is_published: Optional[bool] = None


def _slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text[:80]


# --- Public endpoints ---

@router.get("/posts")
async def list_blog_posts(lang: Optional[str] = None):
    """List all published blog posts (public)."""
    with get_db() as db:
        if lang:
            rows = db.execute(
                "SELECT id, title, slug, excerpt, cover_image_url, lang, created_at FROM blog_posts WHERE is_published = 1 AND lang = ? ORDER BY created_at DESC",
                (lang,),
            ).fetchall()
        else:
            rows = db.execute(
                "SELECT id, title, slug, excerpt, cover_image_url, lang, created_at FROM blog_posts WHERE is_published = 1 ORDER BY created_at DESC"
            ).fetchall()
        return [dict(r) for r in rows]


@router.get("/posts/{slug}")
async def get_blog_post(slug: str):
    """Get a single blog post by slug (public)."""
    with get_db() as db:
        row = db.execute(
            "SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1", (slug,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Article introuvable")
        return dict(row)


# --- Admin endpoints ---

@router.get("/admin/posts")
async def admin_list_posts(admin: dict = Depends(require_admin)):
    """List all blog posts including drafts (admin only)."""
    with get_db() as db:
        rows = db.execute(
            "SELECT * FROM blog_posts ORDER BY created_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]


@router.post("/admin/posts")
async def create_blog_post(data: BlogPostCreate, admin: dict = Depends(require_admin)):
    """Create a new blog post (admin only)."""
    slug = _slugify(data.title)
    with get_db() as db:
        # Ensure unique slug
        existing = db.execute("SELECT id FROM blog_posts WHERE slug = ?", (slug,)).fetchone()
        if existing:
            import time
            slug = f"{slug}-{int(time.time())}"
        db.execute(
            """INSERT INTO blog_posts (title, slug, content, excerpt, cover_image_url, lang, is_published, author_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (data.title, slug, data.content, data.excerpt, data.cover_image_url, data.lang, int(data.is_published), admin["id"]),
        )
        post_id = db.execute("SELECT last_insert_rowid()").fetchone()[0]
        return {"id": post_id, "slug": slug, "message": "Article cree"}


@router.put("/admin/posts/{post_id}")
async def update_blog_post(post_id: int, data: BlogPostUpdate, admin: dict = Depends(require_admin)):
    """Update a blog post (admin only)."""
    with get_db() as db:
        post = db.execute("SELECT * FROM blog_posts WHERE id = ?", (post_id,)).fetchone()
        if not post:
            raise HTTPException(status_code=404, detail="Article introuvable")

        updates = {}
        if data.title is not None:
            updates["title"] = data.title
            updates["slug"] = _slugify(data.title)
        if data.content is not None:
            updates["content"] = data.content
        if data.excerpt is not None:
            updates["excerpt"] = data.excerpt
        if data.cover_image_url is not None:
            updates["cover_image_url"] = data.cover_image_url
        if data.lang is not None:
            updates["lang"] = data.lang
        if data.is_published is not None:
            updates["is_published"] = int(data.is_published)

        if updates:
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            values = list(updates.values()) + [post_id]
            db.execute(f"UPDATE blog_posts SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", values)

        return {"message": "Article mis a jour"}


@router.delete("/admin/posts/{post_id}")
async def delete_blog_post(post_id: int, admin: dict = Depends(require_admin)):
    """Delete a blog post (admin only)."""
    with get_db() as db:
        post = db.execute("SELECT id FROM blog_posts WHERE id = ?", (post_id,)).fetchone()
        if not post:
            raise HTTPException(status_code=404, detail="Article introuvable")
        db.execute("DELETE FROM blog_posts WHERE id = ?", (post_id,))
        return {"message": "Article supprime"}
