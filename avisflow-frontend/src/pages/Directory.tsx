import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Search, MapPin, Store, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LangSwitcher } from "@/lib/i18n";
import api from "@/lib/api";
import SEO from "@/components/SEO";

interface DirectoryBusiness {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  address: string | null;
  logo_url: string | null;
  avg_rating: number;
  review_count: number;
}

export default function Directory() {
  const { t } = useI18n();
  const [businesses, setBusinesses] = useState<DirectoryBusiness[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/directory/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (search) params.set("search", search);
    api.get(`/api/directory?${params.toString()}`)
      .then((res) => setBusinesses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <SEO title={t("directory.title") + " - AvisFlow"} description={t("directory.subtitle")} />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">AvisFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600">{t("nav.login")}</Link>
            <Link to="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{t("nav.signup")}</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("directory.title")}</h1>
          <p className="text-gray-500">{t("directory.subtitle")}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t("directory.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${!selectedCategory ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {t("directory.all_categories")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t("directory.no_results")}</h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((biz) => (
              <Card key={biz.id} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {biz.logo_url ? (
                        <img src={biz.logo_url} alt={biz.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <Store className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{biz.name}</h3>
                      {biz.category && <Badge variant="secondary" className="text-xs mt-1">{biz.category}</Badge>}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {renderStars(biz.avg_rating)}
                      <span className="text-sm font-medium text-gray-700 ml-1">{biz.avg_rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">{biz.review_count} {t("directory.reviews")}</span>
                  </div>
                  {biz.address && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {biz.address}
                    </p>
                  )}
                  <Link to={`/r/${biz.slug}`} className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                    {t("directory.see_reviews")} &rarr;
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/50 mt-12 py-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} AvisFlow. {t("footer.rights")}
      </footer>
    </div>
  );
}
