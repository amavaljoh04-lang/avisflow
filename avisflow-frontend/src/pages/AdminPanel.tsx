import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star, ArrowLeft, Users, Building2, MessageSquare,
  Loader2, Shield, ShieldOff, UserCog, TrendingUp,
  Trash2, Mail, Send, Settings, Save, TestTube, Lock, KeyRound,
  FileText, Plus, Pencil, Megaphone, ToggleLeft, ToggleRight,
  Download, Upload, Database, AlertTriangle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface AdminStats {
  total_users: number;
  total_businesses: number;
  total_reviews: number;
  total_scans: number;
  avg_rating: number;
}

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  business_count: number;
}

interface AdminBusiness {
  id: number;
  name: string;
  slug: string;
  category: string;
  owner_email: string;
  review_count: number;
  avg_rating: number;
  created_at: string;
  is_active: boolean;
}

interface AdminReview {
  id: number;
  business_name: string;
  rating: number;
  feedback: string;
  customer_name: string;
  redirected_to_google: boolean;
  created_at: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  lang: string;
  is_published: number;
  created_at: string;
  updated_at: string;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "businesses" | "reviews" | "email" | "security" | "blog" | "ads" | "migration">("users");

  // Migration
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{message: string; imported?: Record<string, number>} | null>(null);

  // Blog management
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [blogForm, setBlogForm] = useState({ title: "", content: "", excerpt: "", cover_image_url: "", lang: "fr", is_published: 1 });
  const [savingBlog, setSavingBlog] = useState(false);

  // Ads management
  const [ads, setAds] = useState<any[]>([]);
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [adForm, setAdForm] = useState({ title: "", image_url: "", link_url: "", position: "home_banner", is_active: 0 });
  const [savingAd, setSavingAd] = useState(false);

  // PIN security
  const [pinVerified, setPinVerified] = useState(false);
  const [hasPin, setHasPin] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [checkingPin, setCheckingPin] = useState(true);
  const [newPin, setNewPin] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  // Email settings
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [senderName, setSenderName] = useState("AvisFlow");
  const [senderEmail, setSenderEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  // Promo email
  const [promoSubject, setPromoSubject] = useState("");
  const [promoBody, setPromoBody] = useState("");
  const [promoTarget, setPromoTarget] = useState("all");
  const [sendingPromo, setSendingPromo] = useState(false);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, bizRes, revRes] = await Promise.all([
        api.get("/api/admin/stats"),
        api.get("/api/admin/users"),
        api.get("/api/admin/businesses"),
        api.get("/api/admin/reviews"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setBusinesses(bizRes.data);
      setReviews(revRes.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error("Accès interdit — vous n'êtes pas administrateur");
        navigate("/dashboard");
      } else {
        toast.error("Erreur lors du chargement");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailSettings = async () => {
    try {
      const res = await api.get("/api/admin/settings/email");
      setSmtpHost(res.data.smtp_host || "");
      setSmtpPort(res.data.smtp_port || "587");
      setSmtpUser(res.data.smtp_user || "");
      setSmtpPassword(res.data.smtp_password || "");
      setSenderName(res.data.sender_name || "AvisFlow");
      setSenderEmail(res.data.sender_email || "");
    } catch {
      // Email not configured yet
    }
  };

  useEffect(() => {
    // Check if PIN is configured
    api.get("/api/admin/pin-status").then((res) => {
      setHasPin(res.data.has_pin);
      if (!res.data.has_pin) {
        // No PIN set yet, allow access but prompt to set one
        setPinVerified(true);
        fetchAll();
        fetchEmailSettings();
        fetchBlogPosts();
        fetchAds();
      }
      setCheckingPin(false);
    }).catch((err) => {
      if (err.response?.status === 403) {
        toast.error("Acces interdit");
        navigate("/dashboard");
      }
      setCheckingPin(false);
    });
  }, []);

  const verifyPin = async () => {
    setPinError("");
    try {
      await api.post("/api/admin/verify-pin", { pin: pinInput });
      setPinVerified(true);
      fetchAll();
      fetchEmailSettings();
      fetchBlogPosts();
      fetchAds();
    } catch (err: any) {
      setPinError(err.response?.data?.detail || "PIN incorrect");
    }
  };

  const saveNewPin = async () => {
    if (newPin.length < 4) {
      toast.error("Le PIN doit contenir au moins 4 caracteres");
      return;
    }
    setSavingPin(true);
    try {
      await api.put("/api/admin/set-pin", { pin: newPin });
      toast.success("PIN admin configure !");
      setHasPin(true);
      setNewPin("");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur");
    } finally {
      setSavingPin(false);
    }
  };

  const toggleUserRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Changer le rôle en "${newRole}" ?`)) return;
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      toast.success("Rôle mis à jour");
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur");
    }
  };

  const toggleUserActive = async (userId: number) => {
    try {
      await api.put(`/api/admin/users/${userId}/toggle`);
      toast.success("Statut mis a jour");
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur");
    }
  };

  const deleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Supprimer definitivement "${userName}" et toutes ses donnees ? Cette action est irreversible.`)) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      toast.success("Utilisateur supprime");
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur");
    }
  };

  const saveEmailSettings = async () => {
    setSavingEmail(true);
    try {
      await api.put("/api/admin/settings/email", {
        smtp_host: smtpHost,
        smtp_port: parseInt(smtpPort),
        smtp_user: smtpUser,
        smtp_password: smtpPassword,
        sender_name: senderName,
        sender_email: senderEmail,
      });
      toast.success("Configuration email sauvegardee !");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur");
    } finally {
      setSavingEmail(false);
    }
  };

  const sendTestEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await api.post("/api/admin/email/test");
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur");
    } finally {
      setTestingEmail(false);
    }
  };

  const sendPromoEmail = async () => {
    if (!promoSubject.trim() || !promoBody.trim()) {
      toast.error("Sujet et contenu requis");
      return;
    }
    if (!confirm(`Envoyer cet email a ${promoTarget === "all" ? "tous les utilisateurs" : "les utilisateurs actifs"} ?`)) return;
    setSendingPromo(true);
    try {
      const res = await api.post("/api/admin/email/promo", {
        subject: promoSubject,
        body: promoBody,
        target: promoTarget,
      });
      toast.success(res.data.message);
      setPromoSubject("");
      setPromoBody("");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur");
    } finally {
      setSendingPromo(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
    ));
  };

  // Ads CRUD
  const fetchAds = async () => {
    try {
      const res = await api.get("/api/admin/ads");
      setAds(res.data);
    } catch { /* ignore */ }
  };

  const saveAd = async () => {
    if (!adForm.title.trim()) {
      toast.error(t("admin.ads.error"));
      return;
    }
    setSavingAd(true);
    try {
      if (editingAd) {
        await api.put(`/api/admin/ads/${editingAd.id}`, adForm);
        toast.success(t("admin.ads.updated"));
      } else {
        await api.post("/api/admin/ads", adForm);
        toast.success(t("admin.ads.created"));
      }
      setShowAdForm(false);
      setEditingAd(null);
      setAdForm({ title: "", image_url: "", link_url: "", position: "home_banner", is_active: 0 });
      fetchAds();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("admin.ads.error"));
    } finally {
      setSavingAd(false);
    }
  };

  const deleteAd = async (id: number, title: string) => {
    if (!confirm(`Supprimer "${title}" ?`)) return;
    try {
      await api.delete(`/api/admin/ads/${id}`);
      toast.success(t("admin.ads.deleted"));
      fetchAds();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("admin.ads.error"));
    }
  };

  const toggleAdActive = async (ad: any) => {
    try {
      await api.put(`/api/admin/ads/${ad.id}`, { is_active: ad.is_active ? 0 : 1 });
      toast.success(ad.is_active ? t("admin.ads.deactivated") : t("admin.ads.activated"));
      fetchAds();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("admin.ads.error"));
    }
  };

  const startEditAd = (ad: any) => {
    setEditingAd(ad);
    setAdForm({
      title: ad.title,
      image_url: ad.image_url || "",
      link_url: ad.link_url || "",
      position: ad.position,
      is_active: ad.is_active,
    });
    setShowAdForm(true);
  };

  // Blog CRUD
  const fetchBlogPosts = async () => {
    try {
      const res = await api.get("/api/blog/admin/posts");
      setBlogPosts(res.data);
    } catch { /* ignore */ }
  };

  const saveBlogPost = async () => {
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      toast.error(t("admin.blog.error"));
      return;
    }
    setSavingBlog(true);
    try {
      if (editingBlog) {
        await api.put(`/api/blog/admin/posts/${editingBlog.id}`, blogForm);
        toast.success(t("admin.blog.updated"));
      } else {
        await api.post("/api/blog/admin/posts", blogForm);
        toast.success(t("admin.blog.created"));
      }
      setShowBlogForm(false);
      setEditingBlog(null);
      setBlogForm({ title: "", content: "", excerpt: "", cover_image_url: "", lang: "fr", is_published: 1 });
      fetchBlogPosts();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("admin.blog.error"));
    } finally {
      setSavingBlog(false);
    }
  };

  const deleteBlogPost = async (id: number, title: string) => {
    if (!confirm(`Supprimer "${title}" ?`)) return;
    try {
      await api.delete(`/api/blog/admin/posts/${id}`);
      toast.success(t("admin.blog.deleted"));
      fetchBlogPosts();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("admin.blog.error"));
    }
  };

  const startEditBlog = (post: BlogPost) => {
    setEditingBlog(post);
    setBlogForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      cover_image_url: post.cover_image_url || "",
      lang: post.lang,
      is_published: post.is_published,
    });
    setShowBlogForm(true);
  };

  if (checkingPin || (hasPin && !pinVerified)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {checkingPin ? (
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        ) : (
          <Card className="w-full max-w-sm mx-4">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Administration</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Entrez le code PIN pour acceder au panel admin</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Code PIN"
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value); setPinError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && verifyPin()}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
                {pinError && <p className="text-sm text-red-500 text-center">{pinError}</p>}
              </div>
              <Button onClick={verifyPin} disabled={!pinInput} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                <KeyRound className="w-4 h-4 mr-2" /> Verifier
              </Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Retour au dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

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
              <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Administration</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { icon: Users, label: "Utilisateurs", value: stats?.total_users || 0, color: "blue" },
            { icon: Building2, label: "Établissements", value: stats?.total_businesses || 0, color: "indigo" },
            { icon: MessageSquare, label: "Avis collectés", value: stats?.total_reviews || 0, color: "green" },
            { icon: TrendingUp, label: "Scans QR", value: stats?.total_scans || 0, color: "purple" },
            { icon: Star, label: "Note moyenne", value: stats?.avg_rating?.toFixed(1) || "0.0", color: "yellow" },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  s.color === "blue" ? "bg-blue-50" :
                  s.color === "indigo" ? "bg-indigo-50" :
                  s.color === "green" ? "bg-green-50" :
                  s.color === "purple" ? "bg-purple-50" : "bg-yellow-50"
                }`}>
                  <s.icon className={`w-5 h-5 ${
                    s.color === "blue" ? "text-blue-600" :
                    s.color === "indigo" ? "text-indigo-600" :
                    s.color === "green" ? "text-green-600" :
                    s.color === "purple" ? "text-purple-600" : "text-yellow-600"
                  }`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* PIN Warning Banner */}
        {!hasPin && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Securite : aucun code PIN configure</p>
              <p className="text-sm text-yellow-600">Configurez un code PIN pour proteger l'acces a ce panel admin.</p>
            </div>
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700" onClick={() => setTab("security")}>
              Configurer
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg p-1 border mb-6 overflow-x-auto">
          {[
            { key: "users", label: "Utilisateurs", icon: Users },
            { key: "businesses", label: "Etablissements", icon: Building2 },
            { key: "reviews", label: "Avis", icon: MessageSquare },
            { key: "email", label: "Email", icon: Mail },
            { key: "blog", label: "Blog", icon: FileText },
            { key: "ads", label: t("admin.ads.title"), icon: Megaphone },
            { key: "migration", label: "Migration", icon: Database },
            { key: "security", label: "Securite", icon: Lock },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
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

        {/* Users Tab */}
        {tab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> Utilisateurs ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">Utilisateur</th>
                      <th className="pb-3 font-medium text-gray-500">Rôle</th>
                      <th className="pb-3 font-medium text-gray-500">Établissements</th>
                      <th className="pb-3 font-medium text-gray-500">Statut</th>
                      <th className="pb-3 font-medium text-gray-500">Inscription</th>
                      <th className="pb-3 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-gray-900">{u.full_name || "—"}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge className={u.role === "admin" ? "bg-purple-100 text-purple-700 hover:bg-purple-100" : "bg-gray-100 text-gray-700 hover:bg-gray-100"}>
                            {u.role === "admin" ? "Admin" : "Utilisateur"}
                          </Badge>
                        </td>
                        <td className="py-3 text-gray-600">{u.business_count}</td>
                        <td className="py-3">
                          <Badge className={u.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                            {u.is_active ? "Actif" : "Désactivé"}
                          </Badge>
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => toggleUserRole(u.id, u.role)} title="Changer le rôle">
                              <UserCog className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => toggleUserActive(u.id)} title={u.is_active ? "Desactiver" : "Activer"}>
                              {u.is_active ? <ShieldOff className="w-4 h-4 text-red-500" /> : <Shield className="w-4 h-4 text-green-500" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteUser(u.id, u.full_name || u.email)} title="Supprimer definitivement">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Businesses Tab */}
        {tab === "businesses" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> Établissements ({businesses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-500">Établissement</th>
                      <th className="pb-3 font-medium text-gray-500">Propriétaire</th>
                      <th className="pb-3 font-medium text-gray-500">Avis</th>
                      <th className="pb-3 font-medium text-gray-500">Note</th>
                      <th className="pb-3 font-medium text-gray-500">Créé le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((b) => (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-gray-900">{b.name}</p>
                            <p className="text-xs text-gray-400">{b.category || "—"}</p>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600 text-xs">{b.owner_email}</td>
                        <td className="py-3 text-gray-600">{b.review_count}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            {renderStars(b.avg_rating)}
                            <span className="text-xs text-gray-500 ml-1">{b.avg_rating?.toFixed(1) || "—"}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{new Date(b.created_at).toLocaleDateString("fr-FR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Tab */}
        {tab === "reviews" && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Aucun avis</h3>
                </CardContent>
              </Card>
            ) : (
              reviews.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">{renderStars(r.rating)}</div>
                          <span className="text-xs text-gray-400">{r.business_name}</span>
                          {r.redirected_to_google && (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Google</Badge>
                          )}
                        </div>
                        {r.feedback && <p className="text-sm text-gray-700 mt-1">{r.feedback}</p>}
                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                          {r.customer_name && <span>{r.customer_name}</span>}
                          <span>{new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Email Tab */}
        {tab === "email" && (
          <div className="space-y-6">
            {/* SMTP Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" /> Configuration SMTP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">Serveur SMTP</Label>
                    <Input id="smtp-host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Port</Label>
                    <Input id="smtp-port" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-user">Identifiant SMTP</Label>
                    <Input id="smtp-user" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="votre@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Mot de passe SMTP</Label>
                    <Input id="smtp-password" type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} placeholder="Mot de passe ou cle d'application" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sender-name">Nom expediteur</Label>
                    <Input id="sender-name" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="AvisFlow" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sender-email">Email expediteur</Label>
                    <Input id="sender-email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="noreply@avisflow.online" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Pour Gmail: utilisez smtp.gmail.com, port 587, et un mot de passe d'application.
                  Allez dans Compte Google, Securite, Mots de passe des applications.
                </p>
                <div className="flex gap-3">
                  <Button onClick={saveEmailSettings} disabled={savingEmail} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    {savingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Sauvegarder
                  </Button>
                  <Button variant="outline" onClick={sendTestEmail} disabled={testingEmail || !smtpHost}>
                    {testingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TestTube className="w-4 h-4 mr-2" />}
                    Envoyer un test
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Send Promo Email */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" /> Envoyer un email promotionnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promo-subject">Sujet</Label>
                  <Input id="promo-subject" value={promoSubject} onChange={(e) => setPromoSubject(e.target.value)} placeholder="Decouvrez les nouvelles fonctionnalites !" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-body">Contenu (HTML)</Label>
                  <textarea
                    id="promo-body"
                    className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    value={promoBody}
                    onChange={(e) => setPromoBody(e.target.value)}
                    placeholder={"<h1>Bonjour {{name}},</h1>\n<p>Decouvrez les nouvelles fonctionnalites...</p>"}
                  />
                  <p className="text-xs text-gray-500">{"Utilisez {{name}} pour inserer le nom du destinataire. Contenu en HTML."}</p>
                </div>
                <div className="space-y-2">
                  <Label>Destinataires</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="target" value="all" checked={promoTarget === "all"} onChange={(e) => setPromoTarget(e.target.value)} className="accent-blue-600" />
                      <span className="text-sm">Tous les utilisateurs ({users.length})</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="target" value="active" checked={promoTarget === "active"} onChange={(e) => setPromoTarget(e.target.value)} className="accent-blue-600" />
                      <span className="text-sm">Actifs uniquement ({users.filter(u => u.is_active).length})</span>
                    </label>
                  </div>
                </div>
                <Button
                  onClick={sendPromoEmail}
                  disabled={sendingPromo || !promoSubject.trim() || !promoBody.trim() || !smtpHost}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {sendingPromo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Envoyer
                </Button>
                {!smtpHost && (
                  <p className="text-xs text-amber-600">Configurez d'abord les parametres SMTP ci-dessus.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blog Tab */}
        {tab === "blog" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" /> {t("admin.blog.title")} ({blogPosts.length})
                  </CardTitle>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    onClick={() => {
                      setEditingBlog(null);
                      setBlogForm({ title: "", content: "", excerpt: "", cover_image_url: "", lang: "fr", is_published: 1 });
                      setShowBlogForm(!showBlogForm);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> {t("admin.blog.new")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Blog Form */}
                {showBlogForm && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("admin.blog.form.title")} *</Label>
                        <Input value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} placeholder="Mon article SEO" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("admin.blog.form.cover")}</Label>
                        <Input value={blogForm.cover_image_url} onChange={(e) => setBlogForm({ ...blogForm, cover_image_url: e.target.value })} placeholder="https://..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.blog.form.excerpt")}</Label>
                      <Input value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} placeholder="Resume court de l'article" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.blog.form.content")} *</Label>
                      <textarea
                        className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        placeholder="<h2>Titre</h2><p>Contenu...</p>"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>{t("admin.blog.form.lang")}</Label>
                        <select
                          value={blogForm.lang}
                          onChange={(e) => setBlogForm({ ...blogForm, lang: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="fr">Francais</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Statut</Label>
                        <select
                          value={blogForm.is_published}
                          onChange={(e) => setBlogForm({ ...blogForm, is_published: parseInt(e.target.value) })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value={1}>{t("admin.blog.form.published")}</option>
                          <option value={0}>{t("admin.blog.form.draft")}</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={saveBlogPost} disabled={savingBlog} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        {savingBlog ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {t("admin.blog.save")}
                      </Button>
                      <Button variant="outline" onClick={() => { setShowBlogForm(false); setEditingBlog(null); }}>
                        {t("admin.blog.cancel")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Blog posts list */}
                {blogPosts.length === 0 && !showBlogForm ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">{t("admin.blog.empty")}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t("admin.blog.empty.desc")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 truncate">{post.title}</h4>
                            <Badge className={post.is_published ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}>
                              {post.is_published ? t("admin.blog.form.published") : t("admin.blog.form.draft")}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{post.lang.toUpperCase()}</Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {post.slug} — {new Date(post.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => startEditBlog(post)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteBlogPost(post.id, post.title)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ads Tab */}
        {tab === "ads" && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-blue-600" /> {t("admin.ads.title")} ({ads.length})
                </CardTitle>
                <Button size="sm" onClick={() => { setEditingAd(null); setAdForm({ title: "", image_url: "", link_url: "", position: "home_banner", is_active: 0 }); setShowAdForm(!showAdForm); }}>
                  <Plus className="w-4 h-4 mr-1" /> {t("admin.ads.new")}
                </Button>
              </CardHeader>
              <CardContent>
                {showAdForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl border space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("admin.ads.form.title")}</Label>
                        <Input value={adForm.title} onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} placeholder="Titre de la publicite" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("admin.ads.form.position")}</Label>
                        <select
                          value={adForm.position}
                          onChange={(e) => setAdForm({ ...adForm, position: e.target.value })}
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                        >
                          <option value="home_banner">{t("admin.ads.positions.home_banner")}</option>
                          <option value="home_middle">{t("admin.ads.positions.home_middle")}</option>
                          <option value="home_bottom">{t("admin.ads.positions.home_bottom")}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("admin.ads.form.image")}</Label>
                        <Input value={adForm.image_url} onChange={(e) => setAdForm({ ...adForm, image_url: e.target.value })} placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("admin.ads.form.link")}</Label>
                        <Input value={adForm.link_url} onChange={(e) => setAdForm({ ...adForm, link_url: e.target.value })} placeholder="https://..." />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={adForm.is_active === 1} onChange={(e) => setAdForm({ ...adForm, is_active: e.target.checked ? 1 : 0 })} className="rounded" />
                        {t("admin.ads.form.active")}
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveAd} disabled={savingAd} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        {savingAd ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {editingAd ? t("admin.blog.save") : t("admin.ads.new")}
                      </Button>
                      <Button variant="outline" onClick={() => { setShowAdForm(false); setEditingAd(null); }}>
                        {t("admin.blog.cancel")}
                      </Button>
                    </div>
                  </div>
                )}

                {ads.length === 0 && !showAdForm ? (
                  <div className="text-center py-12">
                    <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">{t("admin.ads.empty")}</p>
                    <p className="text-sm text-gray-400 mt-1">{t("admin.ads.empty.desc")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ads.map((ad) => (
                      <div key={ad.id} className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:border-blue-200 transition">
                        {ad.image_url ? (
                          <img src={ad.image_url} alt={ad.title} className="w-16 h-16 object-cover rounded-lg border" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Megaphone className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{ad.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={ad.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-100"}>
                              {ad.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {ad.position === "home_banner" ? t("admin.ads.positions.home_banner") : ad.position === "home_middle" ? t("admin.ads.positions.home_middle") : t("admin.ads.positions.home_bottom")}
                            </span>
                          </div>
                          {ad.link_url && <p className="text-xs text-blue-500 truncate mt-1">{ad.link_url}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => toggleAdActive(ad)} title={ad.is_active ? "Desactiver" : "Activer"}>
                            {ad.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => startEditAd(ad)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteAd(ad.id, ad.title)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Migration Tab */}
        {tab === "migration" && (
          <div className="space-y-6">
            {/* Export */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600" /> Exporter les donn\u00e9es
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  T\u00e9l\u00e9chargez toutes les donn\u00e9es de la plateforme (utilisateurs, \u00e9tablissements, avis, QR codes, blog, publicit\u00e9s, param\u00e8tres) dans un fichier JSON.
                  Les mots de passe sont export\u00e9s hach\u00e9s : les utilisateurs n'auront pas besoin de recr\u00e9er leur compte.
                  Les QR codes d\u00e9j\u00e0 imprim\u00e9s continueront de fonctionner car les slugs sont pr\u00e9serv\u00e9s.
                </p>
                <Button
                  onClick={async () => {
                    setExporting(true);
                    try {
                      const res = await api.get("/api/admin/export");
                      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `avisflow-export-${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Export t\u00e9l\u00e9charg\u00e9 !");
                    } catch (err: any) {
                      toast.error(err.response?.data?.detail || "Erreur lors de l'export");
                    } finally {
                      setExporting(false);
                    }
                  }}
                  disabled={exporting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                  T\u00e9l\u00e9charger l'export JSON
                </Button>
              </CardContent>
            </Card>

            {/* Import */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600" /> Importer les donn\u00e9es
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Attention : cette op\u00e9ration remplace toutes les donn\u00e9es existantes.</p>
                    <p className="text-sm text-yellow-600 mt-1">Utilisez cette fonction uniquement pour migrer vers un nouveau serveur. Faites un export avant d'importer.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fichier d'export JSON</Label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!confirm("\u26a0\ufe0f ATTENTION : Cela va REMPLACER toutes les donn\u00e9es actuelles par celles du fichier. Continuer ?")) {
                        e.target.value = "";
                        return;
                      }
                      setImporting(true);
                      setImportResult(null);
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        const res = await api.post("/api/admin/import", formData, {
                          headers: { "Content-Type": "multipart/form-data" },
                        });
                        setImportResult(res.data);
                        toast.success("Import termin\u00e9 !");
                        fetchAll();
                      } catch (err: any) {
                        toast.error(err.response?.data?.detail || "Erreur lors de l'import");
                      } finally {
                        setImporting(false);
                        e.target.value = "";
                      }
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer"
                    disabled={importing}
                  />
                  {importing && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" /> Import en cours...
                    </div>
                  )}
                </div>
                {importResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-green-800">{importResult.message}</p>
                    {importResult.imported && (
                      <div className="grid grid-cols-3 gap-2 text-sm text-green-700">
                        <span>\ud83d\udc64 {importResult.imported.users} utilisateurs</span>
                        <span>\ud83c\udfe2 {importResult.imported.businesses} \u00e9tablissements</span>
                        <span>\u2b50 {importResult.imported.reviews} avis</span>
                        <span>\ud83d\udcf1 {importResult.imported.qr_codes} QR codes</span>
                        <span>\ud83d\udcdd {importResult.imported.blog_posts} articles</span>
                        <span>\ud83d\udce2 {importResult.imported.ads} publicit\u00e9s</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CLI Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="w-5 h-5 text-gray-600" /> Migration par ligne de commande
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">Vous pouvez aussi migrer via la ligne de commande depuis votre serveur :</p>
                <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm font-mono space-y-2">
                  <p className="text-gray-500"># Sur l'ancien serveur : exporter</p>
                  <p>curl -H "Authorization: Bearer $TOKEN" https://avisflow.online/api/admin/export &gt; backup.json</p>
                  <p className="text-gray-500 mt-3"># Sur le nouveau serveur : importer</p>
                  <p>curl -X POST -H "Authorization: Bearer $TOKEN" -F "file=@backup.json" https://nouveau-serveur/api/admin/import</p>
                </div>
                <p className="text-xs text-gray-500">Remplacez $TOKEN par votre token JWT (visible dans le localStorage du navigateur sous la cl\u00e9 \"token\").</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {tab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" /> Code PIN d'acces
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Le code PIN protege l'acces au panel d'administration. Chaque fois que vous accedez a cette page, vous devrez entrer ce code.
                </p>
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="new-pin">{hasPin ? "Changer le code PIN" : "Definir un code PIN"}</Label>
                    <Input
                      id="new-pin"
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Minimum 4 caracteres"
                      className="max-w-xs"
                    />
                  </div>
                  <Button
                    onClick={saveNewPin}
                    disabled={savingPin || newPin.length < 4}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    {savingPin ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {hasPin ? "Modifier" : "Activer"}
                  </Button>
                </div>
                {hasPin && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Shield className="w-4 h-4" /> Code PIN actif — le panel est protege
                  </div>
                )}
                {!hasPin && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600">
                    <ShieldOff className="w-4 h-4" /> Aucun code PIN — le panel n'est pas protege
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" /> Securite du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Authentification JWT active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Role admin requis pour acceder a ce panel</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasPin ? <Shield className="w-4 h-4 text-green-500" /> : <ShieldOff className="w-4 h-4 text-yellow-500" />}
                  <span>{hasPin ? "Code PIN actif" : "Code PIN non configure"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Mots de passe haches (bcrypt)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
