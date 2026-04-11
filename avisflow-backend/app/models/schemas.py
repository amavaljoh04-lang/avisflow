from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    created_at: str
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class BusinessCreate(BaseModel):
    name: str
    category: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    google_review_url: Optional[str] = None
    primary_color: Optional[str] = "#2563eb"
    positive_threshold: Optional[int] = 4


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    google_review_url: Optional[str] = None
    primary_color: Optional[str] = None
    positive_threshold: Optional[int] = None
    logo_url: Optional[str] = None


class BusinessResponse(BaseModel):
    id: int
    user_id: int
    name: str
    slug: str
    category: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    google_review_url: Optional[str]
    logo_url: Optional[str]
    primary_color: str
    positive_threshold: int
    created_at: str
    is_active: bool


class ReviewSubmit(BaseModel):
    rating: int
    feedback: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    business_id: int
    rating: int
    feedback: Optional[str]
    customer_name: Optional[str]
    customer_email: Optional[str]
    source: str
    redirected_to_google: bool
    created_at: str


class QRCodeResponse(BaseModel):
    id: int
    business_id: int
    label: Optional[str]
    scan_count: int
    created_at: str
    is_active: bool


class QRCodeCreate(BaseModel):
    label: Optional[str] = None


class AnalyticsResponse(BaseModel):
    total_reviews: int
    average_rating: float
    positive_reviews: int
    negative_reviews: int
    redirected_to_google: int
    total_scans: int
    reviews_by_day: list
    rating_distribution: dict


class AdminStats(BaseModel):
    total_users: int
    total_businesses: int
    total_reviews: int
    total_scans: int
    recent_users: list
    recent_reviews: list
