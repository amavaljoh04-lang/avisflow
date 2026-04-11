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
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface Analytics {
  total_reviews: number;
  average_rating: number;
  positive_reviews: number;
  negative_reviews: number;
  redirected_to_google: number;
  total_scans: number;
  rating_distribution: Record<string, number>;
  reviews_by_day: Array<{ date: string; count: number }>;
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

  const fetchAll = async () => {
    try {
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
    } catch {
      toast.error("Erreur lors du chargement");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const createQR = async () => {
    setCreatingQR(true);
    try {
      await api.post(`/api/businesses/${id}/qrcodes`, { label: qrLabel || "QR Code principal" });
      toast.success("QR Code créé !");
      setQrLabel("");
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur");
    } finally {
      setCreatingQR(false);
    }
  };

  const downloadQR = async (qrId: number, label: string) => {
    try {
      const res = await api.get(`/api/businesses/${id}/qrcodes/${qrId}/image`, { responseType: "blob" });
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
      fetchAll();
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
                <div className="space-y-2">
                  <Label htmlFor="edit-google-url">URL de la page Google Avis</Label>
                  <Input id="edit-google-url" value={editGoogleUrl} onChange={(e) => setEditGoogleUrl(e.target.value)} placeholder="https://search.google.com/local/writereview?placeid=..." />
                  <p className="text-xs text-gray-500">Trouvez cette URL en cherchant votre commerce sur Google Maps → cliquez "Écrire un avis" → copiez l'URL</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-threshold">Seuil de redirection Google (note minimum)</Label>
                  <div className="flex items-center gap-4">
                    <Input id="edit-threshold" type="number" min={1} max={5} value={editThreshold} onChange={(e) => setEditThreshold(Number(e.target.value))} className="w-24" />
                    <p className="text-sm text-gray-500">Les avis avec une note ≥ {editThreshold} étoile{editThreshold > 1 ? "s" : ""} seront redirigés vers Google</p>
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

            <div className="flex justify-end gap-3">
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
