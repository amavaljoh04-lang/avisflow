import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { useI18n, LangSwitcher } from "@/lib/i18n";
import api from "@/lib/api";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  lang: string;
  created_at: string;
}

export default function BlogList() {
  const { t, lang } = useI18n();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/blog/posts?lang=${lang}`).then((res) => {
      setPosts(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [lang]);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AvisFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            <Link to="/login">
              <Button variant="ghost" size="sm">{t("nav.login")}</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                {t("nav.signup")}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">{t("blog.title")}</h1>
          <p className="mt-4 text-lg text-gray-600">{t("blog.subtitle")}</p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("blog.empty")}</h3>
              <p className="text-gray-500">{t("blog.empty.desc")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow group overflow-hidden">
                    {post.cover_image_url && (
                      <div className="h-48 bg-gray-100 overflow-hidden">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    {!post.cover_image_url && (
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-blue-400" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <p className="text-xs text-gray-400 mb-2">
                        {new Date(post.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                      )}
                      <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                        {t("blog.read")} <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">AvisFlow</span>
            </div>
            <p className="text-sm">&copy; {new Date().getFullYear()} AvisFlow. {t("footer.rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
