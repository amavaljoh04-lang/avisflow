import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Send, Loader2, CheckCircle2, MessageSquare, ExternalLink, Share2, ThumbsUp, ThumbsDown } from "lucide-react";
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

const FEEDBACK_TAGS = ["attente", "accueil", "produit", "proprete", "prix", "autre"];
const SCORE_CATEGORIES = ["satisfaction", "rapidite", "service", "qualite_prix"];

export default function ReviewPage() {
  const { slug } = useParams();
  const { t } = useI18n();
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<"satisfaction" | "rating">("satisfaction");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [autoResponse, setAutoResponse] = useState<string | null>(null);

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

  const handleSatisfaction = (isSatisfied: boolean) => {
    setRating(isSatisfied ? 5 : 2);
    setStep("rating");
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const setScore = (category: string, value: number) => {
    setScores((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (action: "google" | "private") => {
    if (rating === 0) { toast.error(t("review.select")); return; }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        rating, feedback: feedback || null,
        customer_name: customerName || null, customer_email: customerEmail || null,
      };
      if (selectedTags.length > 0) payload.tags = selectedTags;
      if (Object.keys(scores).length > 0) payload.scores = scores;
      const res = await api.post(`/api/r/${slug}`, payload);
      setGoogleUrl(res.data.google_review_url);
      setAutoResponse(res.data.auto_response || null);
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
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (error) return (
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

  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t("review.thanks")}</h2>
            <p className="text-gray-500 mb-4">{t("review.recorded")} {business?.name} {t("review.improves")}</p>
            {autoResponse && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                <p className="text-xs font-semibold text-blue-700 mb-1">{t("review.auto_response")}</p>
                <p className="text-sm text-blue-900">{autoResponse}</p>
              </div>
            )}
            {googleUrl && (
              <a href={googleUrl} target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-2">
                  <ExternalLink className="w-4 h-4 mr-2" />{t("review.also_google")}
                </Button>
              </a>
            )}
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-gray-400 mb-2">{t("review.share")}</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Lien copie !"); }} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <SEO title={`${t("review.experience")} - ${business?.name || ""}`} description={`Donnez votre avis sur ${business?.name || "cet etablissement"}`} />
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{business?.name}</h1>
          {business?.category && <p className="text-gray-500 text-sm mt-1">{business.category}</p>}
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            {step === "satisfaction" && (
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">{t("review.experience")}</h2>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => handleSatisfaction(true)} className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all group">
                    <ThumbsUp className="w-12 h-12 text-gray-400 group-hover:text-green-500 transition-colors" />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-green-700">{t("review.satisfied")}</span>
                  </button>
                  <button onClick={() => handleSatisfaction(false)} className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 transition-all group">
                    <ThumbsDown className="w-12 h-12 text-gray-400 group-hover:text-red-500 transition-colors" />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-red-700">{t("review.not_satisfied")}</span>
                  </button>
                </div>
              </div>
            )}

            {step === "rating" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-center text-gray-900">{t("review.experience")}</h2>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" disabled={submitting}
                      onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)} className="transition-transform hover:scale-110 active:scale-95 disabled:opacity-50">
                      <Star className={`w-12 h-12 transition-colors ${star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-700 text-center">{t("review.quick_feedback")}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {FEEDBACK_TAGS.map((tag) => (
                        <button key={tag} onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTags.includes(tag) ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {t(`review.tag.${tag}`)}
                        </button>
                      ))}
                    </div>

                    {!showDetails ? (
                      <button onClick={() => setShowDetails(true)} className="text-sm text-blue-600 hover:text-blue-800 underline w-full text-center">
                        {t("review.rate_details")}
                      </button>
                    ) : (
                      <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                        {SCORE_CATEGORIES.map((cat) => (
                          <div key={cat} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{t(`review.score.${cat}`)}</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button key={s} onClick={() => setScore(cat, s)} className="transition-transform hover:scale-110">
                                  <Star className={`w-5 h-5 ${s <= (scores[cat] || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div className="space-y-2 pt-2">
                          <Label htmlFor="feedback" className="text-sm">{t("review.feedback")}</Label>
                          <textarea id="feedback" className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" placeholder={t("review.comment")} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
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

                    <div className="space-y-3 pt-2">
                      {business?.google_review_url && (
                        <Button onClick={() => handleSubmit("google")} disabled={submitting} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-base">
                          {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ExternalLink className="w-5 h-5 mr-2" />}
                          {t("review.leave_google")}
                        </Button>
                      )}
                      <Button onClick={() => handleSubmit("private")} disabled={submitting} variant="outline" className="w-full py-6 text-base border-gray-300">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                        {t("review.send_private")}
                      </Button>
                    </div>
                  </div>
                )}
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
