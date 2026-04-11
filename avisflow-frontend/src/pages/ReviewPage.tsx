import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Send, Loader2, CheckCircle2, ExternalLink, MessageSquare } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "@/lib/api";

export default function ReviewPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
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
        setError("Établissement introuvable");
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [slug]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
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
      setSubmitted(true);
      if (res.data.redirect_to_google && res.data.google_review_url) {
        setRedirectUrl(res.data.google_review_url);
        toast.success("Merci ! Vous allez être redirigé vers Google...");
        setTimeout(() => {
          window.location.href = res.data.google_review_url;
        }, 2500);
      } else {
        toast.success("Merci pour votre retour !");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur lors de l'envoi");
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Toaster position="top-center" />
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 text-center">
            {redirectUrl ? (
              <>
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Merci pour votre avis !</h2>
                <p className="text-gray-500 mb-6">
                  Vous allez être redirigé vers Google pour partager votre expérience positive.
                </p>
                <a href={redirectUrl}>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    Laisser un avis Google <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Merci pour votre retour !</h2>
                <p className="text-gray-500">
                  Votre avis a bien été enregistré. {business?.name} prend en compte tous les retours pour s'améliorer.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
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
              Comment était votre expérience ?
            </h2>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95"
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

            {rating > 0 && (
              <div className="text-center mb-6">
                <p className="text-sm font-medium text-gray-600">
                  {rating === 5 && "Excellent ! Merci beaucoup !"}
                  {rating === 4 && "Très bien ! Merci !"}
                  {rating === 3 && "Merci pour votre retour"}
                  {rating === 2 && "Nous sommes désolés..."}
                  {rating === 1 && "Nous sommes navrés de votre expérience"}
                </p>
              </div>
            )}

            {/* Feedback Form */}
            {rating > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="feedback" className="text-sm">
                    {rating >= 4 ? "Un mot sur votre expérience ? (optionnel)" : "Dites-nous comment nous améliorer"}
                  </Label>
                  <textarea
                    id="feedback"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="Votre commentaire..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">Nom (optionnel)</Label>
                    <Input id="name" placeholder="Jean" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email (optionnel)</Label>
                    <Input id="email" type="email" placeholder="jean@..." value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-base"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                  Envoyer mon avis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          Propulsé par <span className="font-medium text-gray-500">AvisFlow</span>
        </p>
      </div>
    </div>
  );
}
