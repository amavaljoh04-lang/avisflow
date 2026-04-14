import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.getenv("DATABASE_PATH", "/data/app.db")

def get_db_path():
    db_dir = os.path.dirname(DB_PATH)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    return DB_PATH

def get_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1,
            is_verified INTEGER DEFAULT 0,
            verification_token TEXT
        );

        CREATE TABLE IF NOT EXISTS businesses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            category TEXT,
            address TEXT,
            phone TEXT,
            google_review_url TEXT,
            logo_url TEXT,
            primary_color TEXT DEFAULT '#2563eb',
            positive_threshold INTEGER DEFAULT 4,
            sms_enabled INTEGER DEFAULT 0,
            email_enabled INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            feedback TEXT,
            customer_name TEXT,
            customer_email TEXT,
            source TEXT DEFAULT 'qrcode',
            redirected_to_google INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (business_id) REFERENCES businesses(id)
        );

        CREATE TABLE IF NOT EXISTS qr_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_id INTEGER NOT NULL,
            label TEXT,
            scan_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1,
            FOREIGN KEY (business_id) REFERENCES businesses(id)
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS blog_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            content TEXT NOT NULL,
            excerpt TEXT,
            cover_image_url TEXT,
            lang TEXT NOT NULL DEFAULT 'fr',
            is_published INTEGER DEFAULT 1,
            author_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS ads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            image_url TEXT,
            link_url TEXT,
            position TEXT NOT NULL DEFAULT 'home_banner',
            is_active INTEGER DEFAULT 0,
            click_count INTEGER DEFAULT 0,
            view_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
        CREATE INDEX IF NOT EXISTS idx_blog_lang ON blog_posts(lang);
        CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);
        CREATE INDEX IF NOT EXISTS idx_businesses_user ON businesses(user_id);
        CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);

        -- Structured feedback tags (attente, accueil, produit, autre)
        CREATE TABLE IF NOT EXISTS review_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            review_id INTEGER NOT NULL,
            tag TEXT NOT NULL,
            FOREIGN KEY (review_id) REFERENCES reviews(id)
        );

        -- Category scores per review (satisfaction, service, rapidite, qualite_prix)
        CREATE TABLE IF NOT EXISTS review_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            review_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            score INTEGER NOT NULL,
            FOREIGN KEY (review_id) REFERENCES reviews(id)
        );

        -- Auto-response templates per business
        CREATE TABLE IF NOT EXISTS auto_responses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_id INTEGER NOT NULL,
            trigger_type TEXT NOT NULL DEFAULT 'positive',
            message TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (business_id) REFERENCES businesses(id)
        );

        -- Alert history
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_id INTEGER NOT NULL,
            alert_type TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (business_id) REFERENCES businesses(id)
        );

        CREATE INDEX IF NOT EXISTS idx_review_tags_review ON review_tags(review_id);
        CREATE INDEX IF NOT EXISTS idx_review_scores_review ON review_scores(review_id);
        CREATE INDEX IF NOT EXISTS idx_alerts_business ON alerts(business_id);
        CREATE INDEX IF NOT EXISTS idx_auto_responses_business ON auto_responses(business_id);
        """)
        # Migration: add is_verified and verification_token columns to existing users table
        try:
            db.execute("ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0")
        except Exception:
            pass  # column already exists
        try:
            db.execute("ALTER TABLE users ADD COLUMN verification_token TEXT")
        except Exception:
            pass  # column already exists
        # Mark all existing users as verified (they registered before this feature)
        db.execute("UPDATE users SET is_verified = 1 WHERE is_verified IS NULL OR (is_verified = 0 AND verification_token IS NULL)")
