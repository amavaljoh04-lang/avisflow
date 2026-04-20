import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star, ArrowLeft, QrCode, BarChart3, MessageSquare, TrendingUp, Download,
  Plus, Loader2, Trash2, ExternalLink, ThumbsUp, ThumbsDown, Eye, Settings, Save,
  Upload, Code, Copy, Palette, Bell, Zap, Trophy, FileDown, AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useI18n } from "@/lib/i18n";

interface Analytics {
  total_reviews: number;
  average_rating: number;
  positive_reviews: number;
  negative_reviews: number;
  redirected_to_google: number;
  total_scans: number;
  rating_distribution: Record<string, number>;
  reviews_by_day: Array<{ day: string; count: number }>;
}

interface Review {
  id: number;
  rating: number;
  feedback: string;
  customer_name: string;
  customer_email: string;
  redirected_to_google: boolean;
  created_at: string;
}

interface QRCode {
  id: number;
  label: string;
  scan_count: number;
  created_at: string;
  is_active: boolean;
}

interface QRImageData {
  [qrId: number]: string;
}

interface Insights {
  tag_distribution: Record<string, number>;
  category_averages: Record<string, number>;
  trend: string;
  weekly_change: number;
  top_issues: string[];
  keyword_insights: Array<{ word: string; count: number }>;
  comparison_percentile: number;
}

interface AutoResponse {
  id: number;
  business_id: number;
  trigger_type: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

interface Alert {
  id: number;
  business_id: number;
  alert_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<any>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qrcodes, setQrcodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"analytics" | "reviews" | "qrcodes" | "settings">("analytics");
  const [qrLabel, setQrLabel] = useState("");
  const [creatingQR, setCreatingQR] = useState(false);
  const [qrImages, setQrImages] = useState<QRImageData>({});
  // Settings form state
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGoogleUrl, setEditGoogleUrl] = useState("");
  const [editColor, setEditColor] = useState("#2563eb");
  const [editThreshold, setEditThreshold] = useState(4);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  // QR customization state
  const [qrColor, setQrColor] = useState("#2563eb");
  const [qrStyle, setQrStyle] = useState<"square" | "rounded">("square");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [hasLogo, setHasLogo] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  // New analytics state
  const [insights, setInsights] = useState<Insights | null>(null);
  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newAutoTrigger, setNewAutoTrigger] = useState("positive");
  const [newAutoMessage, setNewAutoMessage] = useState("");
  const { t } = useI18n();
  // Google URL resolution state
  const [googleResolving, setGoogleResolving] = useState(false);

  // Client-side smart URL parser
  const parseGoogleUrl = (url: string): string | null => {
    try {
      const t = url.trim();
      if (t.includes("writereview")) return t;
      const pid = t.match(/ChIJ[A-Za-z0-9_-]{20,}/);
      if (pid) return `https://search.google.com/local/writereview?placeid=${pid[0]}`;
      const hex = t.match(/0x[0-9a-f]+:0x([0-9a-f]+)/i);
      if (hex) return `https://search.google.com/local/writereview?placecid=${BigInt("0x" + hex[1]).toString()}`;
      const ludo = t.match(/ludocid=(\d+)/);
      if (ludo) return `https://search.google.com/local/writereview?placecid=${ludo[1]}`;
      const pcid = t.match(/placecid=(\d+)/);
      if (pcid) return `https://search.google.com/local/writereview?placecid=${pcid[1]}`;
      const ppid = t.match(/placeid=([A-Za-z0-9_-]+)/);
      if (ppid) return `https://search.google.com/local/writereview?placeid=${ppid[1]}`;
      const dm = t.match(/!1s0x[0-9a-f]+:0x([0-9a-f]+)/i);
      if (dm) return `https://search.google.com/local/writereview?placecid=${BigInt("0x" + dm[1]).toString()}`;
      if (/^\d{10,}$/.test(t)) return `https://search.google.com/local/writereview?placecid=${t}`;
      return null;
    } catch { return null; }
  };

  // Handle URL paste: try client-side first, then server-side resolution
  const handleGoogleUrlPaste = async (value: string) => {
    setEditGoogleUrl(value);
    // Try client-side parsing first
    const parsed = parseGoogleUrl(value);
    if (parsed && parsed !== value) {
      setEditGoogleUrl(parsed);
      toast.success("Lien d'avis Google détecté !");
      return;
    }
    // If it looks like a Google Maps URL/short link, try server-side resolution
    if (value.length > 15 && (value.includes("google") || value.includes("goo.gl") || value.includes("maps.app"))) {
      setGoogleResolving(true);
      try {
        const res = await api.get("/api/google-resolve-url", { params: { url: value } });
        if (res.data.success && res.data.review_url) {
          setEditGoogleUrl(res.data.review_url);
          toast.success("Lien Google résolu et converti !");
        }
      } catch { /* ignore */ }
      setGoogleResolving(false);
    }
  };


  const fetchAll = async (isInitial = true) => {
    try {
      setLoadError(false);
      const [bizRes, analyticsRes, reviewsRes, qrRes] = await Promise.all([
        api.get(`/api/businesses/${id}`),
        api.get(`/api/businesses/${id}/analytics`),
        api.get(`/api/businesses/${id}/reviews`),
        api.get(`/api/businesses/${id}/qrcodes`),
      ]);
      setBusiness(bizRes.data);
      // Populate edit form with current values
      setEditName(bizRes.data.name || "");
      setEditCategory(bizRes.data.category || "");
      setEditAddress(bizRes.data.address || "");
      setEditPhone(bizRes.data.phone || "");
      setEditGoogleUrl(bizRes.data.google_review_url || "");
      setEditColor(bizRes.data.primary_color || "#2563eb");
      setEditThreshold(bizRes.data.positive_threshold || 4);
      setQrColor(bizRes.data.primary_color || "#2563eb");
      setHasLogo(!!bizRes.data.logo_url);
      setAnalytics(analyticsRes.data);
      setReviews(reviewsRes.data);
      setQrcodes(qrRes.data);
      // Load QR code images as base64
      const images: QRImageData = {};
      for (const qr of qrRes.data) {
        try {
          const dataRes = await api.get(`/api/businesses/${id}/qrcodes/${qr.id}/data`);
          images[qr.id] = dataRes.data.image_base64;
        } catch {
          // ignore individual QR image load failures
        }
      }
      setQrImages(images);
      // Fetch embed code
      try {
        const embedRes = await api.get(`/api/public/embed-code/${bizRes.data.slug}`);
        setEmbedCode(embedRes.data.html);
      } catch {
        // ignore
      }
      // Fetch insights, auto-responses, alerts
      try {
        const [insightsRes, autoRes, alertsRes] = await Promise.all([
          api.get(`/api/businesses/${id}/insights`),
          api.get(`/api/businesses/${id}/auto-responses`),
          api.get(`/api/businesses/${id}/alerts`),
        ]);
        setInsights(insightsRes.data);
        setAutoResponses(autoRes.data);
        setAlerts(alertsRes.data);
      } catch {
        // ignore - these are new features, graceful degradation
      }
    } catch {
      if (isInitial) {
        setLoadError(true);
      }
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(true); }, [id]);

  const createQR = async () => {
    setCreatingQR(true);
    try {
      await api.post(`/api/businesses/${id}/qrcodes`, { label: qrLabel || "QR Code principal" });
      toast.success("QR Code créé !");
      setQrLabel("");
      await fetchAll(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur");
    } finally {
      setCreatingQR(false);
    }
  };

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/api/businesses/${id}/logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Logo uploadé !");
      setHasLogo(true);
      await refreshQrImages();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur lors de l'upload");
    } finally {
      setUploadingLogo(false);
    }
  };

  const refreshQrImages = async () => {
    const images: QRImageData = {};
    for (const qr of qrcodes) {
      try {
        const params = new URLSearchParams();
        if (qrColor) params.set("color", qrColor);
        params.set("style", qrStyle);
        params.set("with_logo", "1");
        const dataRes = await api.get(`/api/businesses/${id}/qrcodes/${qr.id}/data?${params}`);
        images[qr.id] = dataRes.data.image_base64;
      } catch {
        // ignore
      }
    }
    setQrImages(images);
  };

  const downloadQR = async (qrId: number, label: string) => {
    try {
      const params = new URLSearchParams();
      if (qrColor) params.set("color", qrColor);
      params.set("style", qrStyle);
      params.set("logo", "1");
      const res = await api.get(`/api/businesses/${id}/qrcodes/${qrId}/image?${params}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `avisflow-qr-${label.replace(/\s+/g, "-")}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("QR Code téléchargé !");
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const deleteQR = async (qrId: number) => {
    if (!confirm("Supprimer ce QR Code ?")) return;
    try {
      await api.delete(`/api/businesses/${id}/qrcodes/${qrId}`);
      toast.success("QR Code supprimé");
      await fetchAll(false);
    } catch {
      toast.error("Erreur");
    }
  };

  const saveBusiness = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/api/businesses/${id}`, {
        name: editName,
        category: editCategory || null,
        address: editAddress || null,
        phone: editPhone || null,
        google_review_url: editGoogleUrl || null,
        primary_color: editColor,
        positive_threshold: editThreshold,
      });
      setBusiness(res.data);
      toast.success("Établissement mis à jour !");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!confirm(`Supprimer définitivement "${business?.name}" ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/api/businesses/${id}`);
      toast.success("Établissement supprimé");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur lors de la suppression");
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get(`/api/businesses/${id}/export`);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `avisflow-export-${business?.slug || id}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(t("export.success"));
    } catch {
      toast.error("Erreur lors de l'export");
    }
  };

  const createAutoResponse = async () => {
    if (!newAutoMessage.trim()) return;
    try {
      await api.post(`/api/businesses/${id}/auto-responses`, {
        trigger_type: newAutoTrigger,
        message: newAutoMessage,
      });
      toast.success(t("auto.created"));
      setNewAutoMessage("");
      const res = await api.get(`/api/businesses/${id}/auto-responses`);
      setAutoResponses(res.data);
    } catch {
      toast.error("Erreur");
    }
  };

  const deleteAutoResponse = async (arId: number) => {
    try {
      await api.delete(`/api/businesses/${id}/auto-responses/${arId}`);
      toast.success(t("auto.deleted"));
      setAutoResponses((prev) => prev.filter((a) => a.id !== arId));
    } catch {
      toast.error("Erreur");
    }
  };

  const markAlertRead = async (alertId: number) => {
    try {
      await api.put(`/api/businesses/${id}/alerts/${alertId}/read`);
      setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, is_read: true } : a));
    } catch {
      toast.error("Erreur");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Erreur lors du chargement de l'établissement</p>
          <Button onClick={() => navigate("/dashboard")} variant="outline">Retour au dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-semibold text-gray-900">{business?.name}</h1>
              {business?.category && <p className="text-xs text-gray-500">{business.category}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/review/${business?.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" /> Page d'avis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: MessageSquare, label: "Total avis", value: analytics?.total_reviews || 0, color: "blue" },
            { icon: Star, label: "Note moyenne", value: analytics?.average_rating?.toFixed(1) || "0.0", color: "yellow" },
            { icon: ThumbsUp, label: "Avis positifs", value: analytics?.positive_reviews || 0, color: "green" },
            { icon: TrendingUp, label: "Redirigés Google", value: analytics?.redirected_to_google || 0, color: "indigo" },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    stat.color === "blue" ? "bg-blue-50" :
                    stat.color === "yellow" ? "bg-yellow-50" :
                    stat.color === "green" ? "bg-green-50" : "bg-indigo-50"
                  }`}>
                    <stat.icon className={`w-5 h-5 ${
                      stat.color === "blue" ? "text-blue-600" :
                      stat.color === "yellow" ? "text-yellow-600" :
                      stat.color === "green" ? "text-green-600" : "text-indigo-600"
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg p-1 border mb-6">
          {[
            { key: "analytics", label: "Analytics", icon: BarChart3 },
            { key: "reviews", label: "Avis", icon: MessageSquare },
            { key: "qrcodes", label: "QR Codes", icon: QrCode },
            { key: "settings", label: "Paramètres", icon: Settings },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribution des notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = analytics?.rating_distribution?.[String(rating)] || 0;
                    const total = analytics?.total_reviews || 1;
                    const pct = Math.round((count / total) * 100) || 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-16 flex items-center gap-1">
                          {rating} <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              rating >= 4 ? "bg-green-500" : rating === 3 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques QR Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{analytics?.total_scans || 0}</p>
                    <p className="text-sm text-gray-500">Scans totaux</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Chart */}
            {analytics?.reviews_by_day && analytics.reviews_by_day.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" /> {t("insights.timeline")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.reviews_by_day.slice(-14).map((d) => (
                      <div key={d.day} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-20">{new Date(d.day).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((d.count / Math.max(...analytics.reviews_by_day.map(x => x.count))) * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-8 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Insights: Scores + Tags + Comparison */}
            {insights && (
              <>
                {/* Detailed Scores */}
                {Object.keys(insights.category_averages).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" /> {t("insights.scores")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(insights.category_averages).map(([cat, avg]) => (
                          <div key={cat} className="text-center p-3 bg-gray-50 rounded-xl">
                            <p className="text-2xl font-bold text-gray-900">{avg.toFixed(1)}</p>
                            <p className="text-xs text-gray-500 capitalize">{t(`review.score.${cat}`)}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tag Distribution */}
                {Object.keys(insights.tag_distribution).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" /> {t("insights.tags")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(insights.tag_distribution).sort((a, b) => b[1] - a[1]).map(([tag, count]) => {
                          const total = Object.values(insights.tag_distribution).reduce((a, b) => a + b, 0);
                          const pct = Math.round((count / total) * 100);
                          return (
                            <div key={tag} className="flex items-center gap-3">
                              <span className="text-sm w-28 capitalize">{t(`review.tag.${tag}`)}</span>
                              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Trend + Comparison */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          insights.trend === "up" ? "bg-green-50" : insights.trend === "down" ? "bg-red-50" : "bg-gray-50"
                        }`}>
                          <TrendingUp className={`w-5 h-5 ${
                            insights.trend === "up" ? "text-green-600" : insights.trend === "down" ? "text-red-600 rotate-180" : "text-gray-600"
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{t("insights.trend")}</p>
                          <p className="text-lg font-bold">
                            {insights.trend === "up" ? t("insights.trend.up") : insights.trend === "down" ? t("insights.trend.down") : t("insights.trend.stable")}
                          </p>
                          <p className="text-xs text-gray-400">{t("insights.weekly_change")}: {insights.weekly_change > 0 ? "+" : ""}{insights.weekly_change.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{t("insights.comparison")}</p>
                          <p className="text-lg font-bold">
                            {t("insights.better_than").replace("{pct}", String(insights.comparison_percentile))}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Keywords */}
                {insights.keyword_insights.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="w-5 h-5 text-orange-500" /> {t("insights.keywords")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {insights.keyword_insights.map((kw) => (
                          <Badge key={kw.word} variant="secondary" className="text-sm">
                            {kw.word} <span className="ml-1 text-xs text-gray-400">({kw.count})</span>
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-red-500" /> {t("alerts.title")}
                    <Badge className="bg-red-100 text-red-700 ml-2">{alerts.filter(a => !a.is_read).length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${alert.is_read ? "bg-gray-50 border-gray-200" : "bg-red-50 border-red-200"}`}>
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`w-4 h-4 ${alert.is_read ? "text-gray-400" : "text-red-500"}`} />
                          <div>
                            <p className="text-sm font-medium">{alert.message}</p>
                            <p className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleDateString("fr-FR")}</p>
                          </div>
                        </div>
                        {!alert.is_read && (
                          <Button variant="ghost" size="sm" onClick={() => markAlertRead(alert.id)}>
                            {t("alerts.mark_read")}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Auto-Responses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" /> {t("auto.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {autoResponses.length === 0 && (
                  <p className="text-sm text-gray-500">{t("auto.empty.desc")}</p>
                )}
                {autoResponses.map((ar) => (
                  <div key={ar.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Badge variant="secondary" className="text-xs mb-1">
                        {ar.trigger_type === "positive" ? t("auto.trigger.positive") : ar.trigger_type === "negative" ? t("auto.trigger.negative") : t("auto.trigger.all")}
                      </Badge>
                      <p className="text-sm">{ar.message}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteAutoResponse(ar.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Separator />
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select value={newAutoTrigger} onChange={(e) => setNewAutoTrigger(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="positive">{t("auto.trigger.positive")}</option>
                      <option value="negative">{t("auto.trigger.negative")}</option>
                      <option value="all">{t("auto.trigger.all")}</option>
                    </select>
                    <Input placeholder={t("auto.message")} value={newAutoMessage} onChange={(e) => setNewAutoMessage(e.target.value)} className="flex-1" />
                    <Button onClick={createAutoResponse} disabled={!newAutoMessage.trim()} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-1" /> {t("auto.add")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                      <FileDown className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{t("export.title")}</p>
                      <p className="text-xs text-gray-500">JSON - avis, tags, scores, analytics</p>
                    </div>
                  </div>
                  <Button onClick={handleExport} variant="outline">
                    <Download className="w-4 h-4 mr-2" /> {t("export.button")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Tab */}
        {tab === "reviews" && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis pour le moment</h3>
                  <p className="text-gray-500">Partagez votre QR Code pour commencer à recevoir des avis</p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          {review.redirected_to_google ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" /> Google
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <ThumbsDown className="w-3 h-3 mr-1" /> Privé
                            </Badge>
                          )}
                        </div>
                        {review.feedback && <p className="text-gray-700 mb-2">{review.feedback}</p>}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {review.customer_name && <span>{review.customer_name}</span>}
                          {review.customer_email && <span>{review.customer_email}</span>}
                          <span>{new Date(review.created_at).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* QR Codes Tab */}
        {tab === "qrcodes" && (
          <div className="space-y-6">
            {/* QR Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-600" /> Personnalisation du QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Couleur du QR Code</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                      <Input value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="w-28" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Style</Label>
                    <div className="flex gap-2">
                      <Button variant={qrStyle === "square" ? "default" : "outline"} size="sm" onClick={() => setQrStyle("square")} className={qrStyle === "square" ? "bg-blue-600" : ""}>
                        Carré
                      </Button>
                      <Button variant={qrStyle === "rounded" ? "default" : "outline"} size="sm" onClick={() => setQrStyle("rounded")} className={qrStyle === "rounded" ? "bg-blue-600" : ""}>
                        Arrondi
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Logo au centre</Label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]); }} />
                        <div className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-gray-50">
                          {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {hasLogo ? "Changer le logo" : "Ajouter un logo"}
                        </div>
                      </label>
                      {hasLogo && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Logo actif</Badge>}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={refreshQrImages}>
                  <QrCode className="w-4 h-4 mr-1" /> Appliquer aux QR Codes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Nouveau QR Code</Label>
                    <Input
                      placeholder="Label (ex: Comptoir, Table 1...)"
                      value={qrLabel}
                      onChange={(e) => setQrLabel(e.target.value)}
                    />
                  </div>
                  <Button onClick={createQR} disabled={creatingQR} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    {creatingQR ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Créer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {qrcodes.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun QR Code</h3>
                  <p className="text-gray-500">Créez votre premier QR Code ci-dessus</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qrcodes.map((qr) => (
                  <Card key={qr.id} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{qr.label}</h3>
                          <p className="text-xs text-gray-400">{new Date(qr.created_at).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                          <Eye className="w-3 h-3 mr-1" /> {qr.scan_count} scans
                        </Badge>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center mb-4">
                        {qrImages[qr.id] ? (
                          <img
                            src={qrImages[qr.id]}
                            alt={`QR Code - ${qr.label}`}
                            className="w-48 h-48"
                          />
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => downloadQR(qr.id, qr.label)}>
                          <Download className="w-4 h-4 mr-1" /> Télécharger
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteQR(qr.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {tab === "settings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations de l'établissement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nom de l'établissement *</Label>
                    <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Mon Restaurant" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Catégorie</Label>
                    <Input id="edit-category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="Restaurant, Coiffeur, Garage..." />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Adresse</Label>
                    <Input id="edit-address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="12 rue de la Paix, Paris" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Téléphone</Label>
                    <Input id="edit-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="01 23 45 67 89" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration Google Avis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* Share from Google Maps (mobile-friendly) */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-semibold text-green-800">Trouver votre lien Google Avis</p>
                    <ol className="text-xs text-green-700 space-y-2 list-decimal list-inside">
                      <li>
                        <span className="font-medium">Ouvrir Google Maps</span> et chercher votre commerce :
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2 border-green-400 text-green-700 hover:bg-green-100"
                          onClick={() => {
                            const q = encodeURIComponent(editName || "mon commerce");
                            window.open(`https://www.google.com/maps/search/${q}`, "_blank");
                          }}
                        >
                          Ouvrir Google Maps
                        </Button>
                      </li>
                      <li>Appuyez sur votre fiche, puis sur <strong>"Partager"</strong> puis <strong>"Copier le lien"</strong></li>
                      <li>Revenez ici et <strong>collez le lien</strong> dans le champ ci-dessous</li>
                    </ol>
                  </div>

                  {/* URL input field with smart parser + server-side resolution */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-google-url">Collez ici le lien Google Maps ou un lien d'avis</Label>
                    <div className="relative">
                      <Input
                        id="edit-google-url"
                        value={editGoogleUrl}
                        onChange={(e) => handleGoogleUrlPaste(e.target.value)}
                        placeholder="Collez ici un lien Google Maps, goo.gl, ou writereview..."
                      />
                      {googleResolving && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-blue-500" />}
                    </div>
                    {editGoogleUrl && editGoogleUrl.includes("writereview") && (
                      <p className="text-xs text-green-600 font-medium">Lien d'avis direct OK — vos clients seront redirigés vers le formulaire Google.</p>
                    )}
                    {editGoogleUrl && !editGoogleUrl.includes("writereview") && editGoogleUrl.length > 10 && (
                      <p className="text-xs text-orange-600">Ce lien ne semble pas être un lien d'avis direct. Utilisez une des méthodes ci-dessus.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apparence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Couleur principale</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" id="edit-color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                    <Input value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Embed Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-600" /> Widget intégrable
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-500">Copiez ce code HTML et collez-le sur votre site web pour afficher vos avis avec un lien "Propulsé par AvisFlow".</p>
                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">{embedCode || "Chargement..."}</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={() => { navigator.clipboard.writeText(embedCode); toast.success("Code copié !"); }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <Button
                onClick={handleDeleteBusiness}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer l'établissement
              </Button>
              <Button
                onClick={saveBusiness}
                disabled={saving || !editName.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
