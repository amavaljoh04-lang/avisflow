import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Send, Loader2, CheckCircle2, MessageSquare } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import toast, { Toaster } from "react-hot-toast";
import api from "@/lib/api";
import SEO from "@/components/SEO";

interface BusinessInfo {
  name: string;
  slug: string;
  category: string | null;
  primary_color: string | null;
  logo_url: string | null;
  positive_threshold: number;
  google_review_url: string | null;
}

export default function ReviewPage() {
  const { slug } = useParams();
  const { t } = useI18n();
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await api.get(`/api/r/${slug}/info`);
        setBusiness(res.data);
      } catch {
        setError(t("review.not_found"));
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [slug]);

  const isPositive = (r: number) => {
    return business ? r >= business.positive_threshold : r >= 4;
  };

  const handleStarClick = async (star: number) => {
    setRating(star);

    // If positive rating and Google URL exists, redirect immediately
    if (isPositive(star) && business?.google_review_url) {
      setSubmitting(true);
      try {
        // Save the rating in the backend (no form needed)
        await api.post(`/api/r/${slug}`, {
          rating: star,
          feedback: null,
          customer_name: null,
          customer_email: null,
        });
        // Redirect to Google immediately
        toast.success(t("review.redirect"));
        setTimeout(() => {
          window.location.href = business.google_review_url!;
        }, 800);
      } catch {
        toast.error(t("review.error"));
        setSubmitting(false);
      }
    }
    // If negative rating, the feedback form will appear via render
  };

  const handleSubmitNegative = async () => {
    if (rating === 0) {
      toast.error(t("review.select"));
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/r/${slug}`, {
        rating,
        feedback: feedback || null,
        customer_name: customerName || null,
        customer_email: customerEmail || null,
      });
      setSubmitted(true);
      toast.success(t("review.thanks"));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("review.send_error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops !</h2>
            <p className="text-gray-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Submitted state (only for negative reviews)
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Toaster position="top-center" />
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("review.thanks")}</h2>
            <p className="text-gray-500">
              {t("review.recorded")} {business?.name} {t("review.improves")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showNegativeForm = rating > 0 && !isPositive(rating);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <SEO title={`${t("review.experience")} - ${business?.name || ""}`} description={`Donnez votre avis sur ${business?.name || "cet etablissement"}`} />
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{business?.name}</h1>
          {business?.category && <p className="text-gray-500 text-sm mt-1">{business.category}</p>}
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-center text-gray-900 mb-6">
              {t("review.experience")}
            </h2>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={submitting}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => handleStarClick(star)}
                  className="transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                >
                  <Star
                    className={`w-12 h-12 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Loading indicator when redirecting to Google */}
            {submitting && isPositive(rating) && (
              <div className="text-center py-4 animate-in fade-in duration-300">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">
                  {t("review.redirect")}
                </p>
              </div>
            )}

            {/* Rating text for negative */}
            {rating > 0 && !isPositive(rating) && !submitting && (
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-gray-600">
                  {rating === 3 && t("review.sorry3")}
                  {rating === 2 && t("review.sorry2")}
                  {rating === 1 && t("review.sorry1")}
                </p>
              </div>
            )}

            {/* Negative Feedback Form - only for low ratings */}
            {showNegativeForm && !submitting && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="feedback" className="text-sm">
                    {t("review.feedback")}
                  </Label>
                  <textarea
                    id="feedback"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder={t("review.comment")}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">{t("review.name")}</Label>
                    <Input id="name" placeholder="Jean" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">{t("review.email_opt")}</Label>
                    <Input id="email" type="email" placeholder="jean@..." value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                  </div>
                </div>
                <Button
                  onClick={handleSubmitNegative}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-base"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                  {t("review.send")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          {t("review.powered")} <span className="font-medium text-gray-500">AvisFlow</span>
        </p>
      </div>
    </div>
  );
}
