import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, QrCode, Shield, TrendingUp, ArrowRight, CheckCircle2, BarChart3, MessageSquare, Utensils, Scissors, Car, ShoppingBag, Stethoscope, Hotel } from "lucide-react";
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

interface Ad {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  position: string;
}

export default function Landing() {
  const { t } = useI18n();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    api.get("/api/public/stats").then((res) => setStats(res.data)).catch(() => {});
    api.get("/api/public/ads").then((res) => setAds(res.data)).catch(() => {});
  }, []);

  const homeBannerAds = ads.filter((a) => a.position === "home_banner");
  const homeMiddleAds = ads.filter((a) => a.position === "home_middle");
  const homeBottomAds = ads.filter((a) => a.position === "home_bottom");

  return (
    <div className="min-h-screen bg-white">
      <SEO title={undefined} description="AvisFlow aide les commerces locaux \u00e0 collecter plus d'avis Google positifs gr\u00e2ce aux QR codes. Gratuit, simple et efficace." />
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
            <a href="#how" className="hover:text-gray-900 transition">{t("nav.how")}</a>
            <a href="#features" className="hover:text-gray-900 transition">{t("nav.features")}</a>
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
                  {t("hero.generate_qr")} <QrCode className="w-5 h-5 ml-2" />
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

      {/* Ad Banner (top) */}
      {homeBannerAds.length > 0 && (
        <section className="py-4 bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {homeBannerAds.map((ad) => (
              <a key={ad.id} href={ad.link_url || "#"} target="_blank" rel="noopener noreferrer" className="block">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} className="w-full max-h-24 object-contain rounded-lg" />
                ) : (
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 text-center">
                    <p className="text-sm font-medium text-blue-800">{ad.title}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Visual Demo */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("demo.title")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("demo.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="text-center">
              <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-lg flex items-center justify-center relative">
                <img src="/demo-qr.png" alt="QR Code AvisFlow" className="w-36 h-36 object-contain" />
                <div className="absolute -bottom-3 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">QR Code</div>
              </div>
              <p className="mt-6 font-semibold text-gray-900">{t("demo.step1")}</p>
              <p className="text-sm text-gray-500 mt-1">{t("demo.step1_desc")}</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <ArrowRight className="w-8 h-8 text-blue-400 hidden md:block" />
                <div className="w-64 bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3">{t("demo.phone_title")}</p>
                  <div className="flex justify-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-8 h-8 ${s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{t("demo.phone_desc")}</p>
                </div>
                <ArrowRight className="w-8 h-8 text-blue-400 hidden md:block" />
              </div>
            </div>
            <div className="text-center">
              <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center gap-2">
                <div className="text-4xl font-bold text-blue-600">G</div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 font-medium">{t("demo.google_review")}</p>
              </div>
              <p className="mt-6 font-semibold text-gray-900">{t("demo.step3")}</p>
              <p className="text-sm text-gray-500 mt-1">{t("demo.step3_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — only show if meaningful data exists (hide until >= 50 businesses) */}
      {stats && stats.total_businesses >= 50 && (
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
              {[
                { value: stats.total_users, label: t("stats.users") },
                { value: stats.total_businesses, label: t("stats.pages") },
                { value: stats.total_reviews, label: t("stats.reviews") },
                { value: `${stats.average_rating}\u2605`, label: t("stats.avg") },
                { value: stats.redirected_to_google, label: t("stats.google") },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{s.value}</div>
                  <div className="mt-2 text-gray-400 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
                time: "30s",
              },
              {
                icon: Star,
                step: "2",
                title: t("how.step2.title"),
                desc: t("how.step2.desc"),
                time: "10s",
              },
              {
                icon: TrendingUp,
                step: "3",
                title: t("how.step3.title"),
                desc: t("how.step3.desc"),
                time: "1 clic",
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
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {item.time}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6 shadow-lg shadow-blue-500/25">
                {t("hero.generate_qr")} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ad Middle */}
      {homeMiddleAds.length > 0 && (
        <section className="py-4 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {homeMiddleAds.map((ad) => (
              <a key={ad.id} href={ad.link_url || "#"} target="_blank" rel="noopener noreferrer" className="block">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} className="w-full max-h-24 object-contain rounded-lg" />
                ) : (
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 text-center">
                    <p className="text-sm font-medium text-blue-800">{ad.title}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Business types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("types.title")}</h2>
            <p className="mt-3 text-gray-600">{t("types.subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { icon: Utensils, label: t("types.restaurant") },
              { icon: Scissors, label: t("types.salon") },
              { icon: Car, label: t("types.garage") },
              { icon: ShoppingBag, label: t("types.shop") },
              { icon: Stethoscope, label: t("types.health") },
              { icon: Hotel, label: t("types.hotel") },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
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
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
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
      <section id="pricing" className="py-24 bg-gray-50">
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

      {/* Ad Bottom */}
      {homeBottomAds.length > 0 && (
        <section className="py-4 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {homeBottomAds.map((ad) => (
              <a key={ad.id} href={ad.link_url || "#"} target="_blank" rel="noopener noreferrer" className="block">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} className="w-full max-h-24 object-contain rounded-lg" />
                ) : (
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 text-center">
                    <p className="text-sm font-medium text-blue-800">{ad.title}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

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
              {t("hero.generate_qr")} <QrCode className="w-5 h-5 ml-2" />
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
