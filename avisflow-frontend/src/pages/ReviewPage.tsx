import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Send, Loader2, CheckCircle2, MessageSquare, ExternalLink, Share2 } from "lucide-react";
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
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

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

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  // Submit rating + optional feedback — NO review gating, customer chooses freely
  const handleSubmit = async (action: "google" | "private") => {
    if (rating === 0) {
      toast.error(t("review.select"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/api/r/${slug}`, {
        rating,
        feedback: feedback || null,
        customer_name: customerName || null,
        customer_email: customerEmail || null,
      });
      setGoogleUrl(res.data.google_review_url);

      if (action === "google" && res.data.google_review_url) {
        toast.success(t("review.thanks_google"));
        setSubmitted(true);
        window.open(res.data.google_review_url, "_blank");
      } else {
        setSubmitted(true);
        toast.success(t("review.thanks"));
      }
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

  // Thank you screen after submission
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
            <p className="text-gray-500 mb-4">
              {t("review.recorded")} {business?.name} {t("review.improves")}
            </p>
            {googleUrl && (
              <a href={googleUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-2">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t("review.also_google")}
                </Button>
              </a>
            )}
            {/* Social sharing */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-gray-400 mb-2">{t("review.share")}</p>
              <div className="flex justify-center gap-3">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition">
                  <span className="text-blue-600 text-sm font-bold">f</span>
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Je viens de donner mon avis sur ${business?.name} !`)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center hover:bg-sky-200 transition">
                  <span className="text-sky-500 text-sm font-bold">X</span>
                </a>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Lien copi\u00e9 !"); }} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-gray-400 mt-4">
          <a href="https://avisflow.online" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition">
            {t("review.powered")} <span className="font-medium text-gray-500">AvisFlow</span>
          </a>
        </p>
      </div>
    );
  }

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
            <div className="flex justify-center gap-2 mb-6">
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

            {/* After selecting a rating: show options for ALL customers */}
            {rating > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Optional feedback form (toggle) */}
                {!showFeedbackForm ? (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline w-full text-center"
                  >
                    {t("review.add_comment")}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="feedback" className="text-sm">
                        {t("review.feedback")}
                      </Label>
                      <textarea
                        id="feedback"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
                  </div>
                )}

                {/* Two action buttons — customer chooses freely (no gating) */}
                <div className="space-y-3 pt-2">
                  {business?.google_review_url && (
                    <Button
                      onClick={() => handleSubmit("google")}
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-base"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ExternalLink className="w-5 h-5 mr-2" />}
                      {t("review.leave_google")}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleSubmit("private")}
                    disabled={submitting}
                    variant="outline"
                    className="w-full py-6 text-base border-gray-300"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                    {t("review.send_private")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          <a href="https://avisflow.online" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition">
            {t("review.powered")} <span className="font-medium text-gray-500">AvisFlow</span>
          </a>
        </p>
      </div>
    </div>
  );
}
