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
  Trash2, Mail, Send, Settings, Save, TestTube,
} from "lucide-react";
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

export default function AdminPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "businesses" | "reviews" | "email">("users");

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

  useEffect(() => { fetchAll(); fetchEmailSettings(); }, []);

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

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-lg p-1 border mb-6 overflow-x-auto">
          {[
            { key: "users", label: "Utilisateurs", icon: Users },
            { key: "businesses", label: "Etablissements", icon: Building2 },
            { key: "reviews", label: "Avis", icon: MessageSquare },
            { key: "email", label: "Email", icon: Mail },
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
      </div>
    </div>
  );
}
