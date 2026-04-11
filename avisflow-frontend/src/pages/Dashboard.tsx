import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Building2, QrCode, BarChart3, LogOut, Settings, Loader2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface Business {
  id: number;
  name: string;
  slug: string;
  category: string;
  address: string;
  phone: string;
  google_review_url: string;
  positive_threshold: number;
  created_at: string;
  is_active: boolean;
}

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "", address: "", phone: "", google_review_url: "", positive_threshold: 4,
  });
  const navigate = useNavigate();

  const fetchBusinesses = async () => {
    try {
      const res = await api.get("/api/businesses");
      setBusinesses(res.data);
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBusinesses(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/api/businesses", form);
      toast.success("Établissement créé !");
      setShowCreate(false);
      setForm({ name: "", category: "", address: "", phone: "", google_review_url: "", positive_threshold: 4 });
      fetchBusinesses();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AvisFlow</span>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === "admin" && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" /> Admin
                </Button>
              </Link>
            )}
            <span className="text-sm text-gray-600 hidden sm:inline">{user?.full_name || user?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => { onLogout(); navigate("/"); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes établissements</h1>
            <p className="text-gray-500 mt-1">Gérez vos établissements et collectez des avis</p>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Ajouter
          </Button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <Card className="mb-8 border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Nouvel établissement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de l'établissement *</Label>
                  <Input placeholder="Mon Restaurant" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Input placeholder="Restaurant, Coiffeur, etc." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input placeholder="12 Rue de la Paix, Paris" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="01 23 45 67 89" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Lien avis Google *</Label>
                  <Input placeholder="https://g.page/r/..." value={form.google_review_url} onChange={(e) => setForm({ ...form, google_review_url: e.target.value })} required />
                  <p className="text-xs text-gray-400">Trouvez ce lien dans Google My Business &rarr; Demander des avis</p>
                </div>
                <div className="space-y-2">
                  <Label>Seuil positif (étoiles)</Label>
                  <Input type="number" min={1} max={5} value={form.positive_threshold} onChange={(e) => setForm({ ...form, positive_threshold: parseInt(e.target.value) || 4 })} />
                  <p className="text-xs text-gray-400">Les notes &ge; ce seuil seront redirigées vers Google</p>
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600" disabled={creating}>
                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Créer l'établissement
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Business List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun établissement</h3>
            <p className="text-gray-500 mb-6">Créez votre premier établissement pour commencer à collecter des avis</p>
            <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" /> Ajouter un établissement
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((biz) => (
              <Card key={biz.id} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/business/${biz.id}`)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge variant={biz.is_active ? "default" : "secondary"} className={biz.is_active ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                      {biz.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{biz.name}</h3>
                  {biz.category && <p className="text-sm text-gray-500 mt-1">{biz.category}</p>}
                  {biz.address && <p className="text-xs text-gray-400 mt-1">{biz.address}</p>}
                  <div className="mt-4 pt-4 border-t flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <QrCode className="w-4 h-4" /> QR Codes
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <BarChart3 className="w-4 h-4" /> Analytics
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-300 ml-auto group-hover:text-blue-400 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
