import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, QrCode, Shield, TrendingUp, ArrowRight, CheckCircle2, BarChart3, MessageSquare } from "lucide-react";
import { useI18n, LangSwitcher } from "@/lib/i18n";
import api from "@/lib/api";
import SEO from "@/components/SEO";

interface PublicStats {
  total_businesses: number;
  total_reviews: number;
  total_users: number;
  average_rating: number;
  redirected_to_google: number;
}

export default function Landing() {
  const { t } = useI18n();
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    api.get("/api/public/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEO title={undefined} description="AvisFlow aide les commerces locaux a collecter plus d'avis Google positifs grace aux QR codes. Gratuit, simple et efficace." />
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AvisFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition">{t("nav.features")}</a>
            <a href="#how" className="hover:text-gray-900 transition">{t("nav.how")}</a>
            <a href="#pricing" className="hover:text-gray-900 transition">{t("nav.pricing")}</a>
            <Link to="/blog" className="hover:text-gray-900 transition">{t("nav.blog")}</Link>
          </div>
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

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-700 mb-8">
              <Star className="w-4 h-4" />
              <span>{t("hero.badge")}</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
              {t("hero.title1")}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t("hero.title2")}
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6 shadow-lg shadow-blue-500/25">
                  {t("hero.cta")} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#how">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  {t("hero.demo")}
                </Button>
              </a>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t("hero.nocard")}</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t("hero.quick")}</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t("hero.free")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {[
              { value: stats ? String(stats.total_users) : "0", label: t("stats.users") },
              { value: stats ? String(stats.total_businesses) : "0", label: t("stats.pages") },
              { value: stats ? String(stats.total_reviews) : "0", label: t("stats.reviews") },
              { value: stats ? `${stats.average_rating}\u2605` : "0\u2605", label: t("stats.avg") },
              { value: stats ? String(stats.redirected_to_google) : "0", label: t("stats.google") },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{s.value}</div>
                <div className="mt-2 text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("how.title")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("how.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                step: "1",
                title: t("how.step1.title"),
                desc: t("how.step1.desc"),
              },
              {
                icon: Star,
                step: "2",
                title: t("how.step2.title"),
                desc: t("how.step2.desc"),
              },
              {
                icon: TrendingUp,
                step: "3",
                title: t("how.step3.title"),
                desc: t("how.step3.desc"),
              },
            ].map((item, i) => (
              <div key={i} className="relative bg-gradient-to-b from-gray-50 to-white rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("features.title")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("features.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: QrCode, title: t("features.qr.title"), desc: t("features.qr.desc") },
              { icon: Shield, title: t("features.shield.title"), desc: t("features.shield.desc") },
              { icon: TrendingUp, title: t("features.redirect.title"), desc: t("features.redirect.desc") },
              { icon: BarChart3, title: t("features.analytics.title"), desc: t("features.analytics.desc") },
              { icon: MessageSquare, title: t("features.feedback.title"), desc: t("features.feedback.desc") },
              { icon: Star, title: t("features.multi.title"), desc: t("features.multi.desc") },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("pricing.title")}</h2>
          <p className="mt-4 text-lg text-gray-600 mb-12">{t("pricing.subtitle")}</p>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-blue-500/20">
            <div className="text-5xl font-bold mb-2">{t("pricing.price")}</div>
            <div className="text-blue-200 mb-8">{t("pricing.forever")}</div>
            <ul className="space-y-3 text-left max-w-sm mx-auto mb-8">
              {[
                t("pricing.f1"),
                t("pricing.f2"),
                t("pricing.f3"),
                t("pricing.f4"),
                t("pricing.f5"),
                t("pricing.f6"),
                t("pricing.f7"),
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-200 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 w-full max-w-sm">
                {t("pricing.cta")} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            {t("cta.subtitle")}
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-lg px-8 py-6">
              {t("cta.button")} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
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
