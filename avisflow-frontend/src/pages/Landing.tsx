import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, QrCode, Shield, TrendingUp, ArrowRight, CheckCircle2, BarChart3, MessageSquare, Utensils, Scissors, Car, ShoppingBag, Stethoscope, Hotel, Zap, Clock, AlertTriangle } from "lucide-react";
import { useI18n, LangSwitcher } from "@/lib/i18n";
import api from "@/lib/api";
import SEO from "@/components/SEO";

interface Ad {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  position: string;
}

export default function Landing() {
  const { t } = useI18n();
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    api.get("/api/public/ads").then((res) => setAds(res.data)).catch(() => {});
  }, []);

  const homeBannerAds = ads.filter((a) => a.position === "home_banner");
  const homeMiddleAds = ads.filter((a) => a.position === "home_middle");
  const homeBottomAds = ads.filter((a) => a.position === "home_bottom");

  return (
    <div className="min-h-screen bg-white">
      <SEO title={undefined} description="AvisFlow aide les commerces locaux \u00e0 collecter plus d\u0027avis Google positifs gr\u00e2ce aux QR codes. Gratuit, simple et efficace." />
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

      {/* Hero - Ultra aggressive */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-sm text-green-700 mb-6 animate-bounce">
              <Zap className="w-4 h-4" />
              <span>{t("hero.badge")}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {t("hero.title1")}
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t("hero.title2")}
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-10 py-7 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105">
                  {t("hero.generate_qr")} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#how">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-2">
                  {t("hero.demo")}
                </Button>
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t("hero.nocard")}</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t("hero.quick")}</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t("hero.free")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats - Always visible */}
      <section className="py-16 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-indigo-900/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">{t("proof.title")}</h2>
            <p className="mt-2 text-gray-400">{t("proof.subtitle")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: t("proof.stat1"), label: t("proof.stat1_label"), color: "from-blue-400 to-cyan-400" },
              { value: t("proof.stat2"), label: t("proof.stat2_label"), color: "from-yellow-400 to-orange-400" },
              { value: t("proof.stat3"), label: t("proof.stat3_label"), color: "from-green-400 to-emerald-400" },
              { value: t("proof.stat4"), label: t("proof.stat4_label"), color: "from-purple-400 to-pink-400" },
            ].map((s, i) => (
              <div key={i} className="p-4">
                <div className={`text-4xl md:text-5xl font-extrabold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                <div className="mt-2 text-gray-300 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-8">{t("proof.disclaimer")}</p>
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

      {/* Visual Demo - Enhanced */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("demo.title")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("demo.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Step 1: QR Scan */}
            <div className="text-center group">
              <div className="relative">
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">1</div>
                <div className="w-52 h-52 mx-auto bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-lg flex items-center justify-center group-hover:border-blue-300 group-hover:shadow-xl transition-all duration-300">
                  <img src="/demo-qr.png" alt="QR Code AvisFlow" className="w-40 h-40 object-contain" />
                </div>
              </div>
              <p className="mt-5 font-bold text-gray-900 text-lg">{t("demo.step1")}</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{t("demo.step1_desc")}</p>
            </div>
            {/* Step 2: Rating */}
            <div className="text-center group">
              <div className="relative">
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">2</div>
                <div className="hidden md:flex absolute top-1/2 -left-8 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-blue-400" />
                </div>
                <div className="w-52 mx-auto bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg group-hover:border-blue-300 group-hover:shadow-xl transition-all duration-300">
                  <p className="text-sm font-semibold text-gray-700 mb-4">{t("demo.phone_title")}</p>
                  <div className="flex justify-center gap-1.5 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-9 h-9 ${s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} transition-transform hover:scale-110`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{t("demo.phone_desc")}</p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-600 font-medium">
                    <Clock className="w-3 h-3" /> 30s
                  </div>
                </div>
              </div>
              <p className="mt-5 font-bold text-gray-900 text-lg">{t("demo.step3")}</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{t("demo.step3_desc")}</p>
            </div>
            {/* Step 3: Google Review */}
            <div className="text-center group">
              <div className="relative">
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10">3</div>
                <div className="hidden md:flex absolute top-1/2 -left-8 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-blue-400" />
                </div>
                <div className="w-52 h-52 mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center gap-3 group-hover:border-green-300 group-hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">G</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs text-green-700 font-semibold">{t("demo.google_review")}</p>
                </div>
              </div>
              <p className="mt-5 font-bold text-green-700 text-lg flex items-center justify-center gap-1">
                <CheckCircle2 className="w-5 h-5" /> {t("demo.google_review")}
              </p>
            </div>
          </div>
          {/* CTA after demo */}
          <div className="text-center mt-14">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-10 py-7 shadow-xl shadow-blue-500/30 hover:scale-105 transition-all duration-300">
                {t("hero.generate_qr")} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-16 bg-gradient-to-r from-red-50 to-orange-50 border-y border-red-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 rounded-full px-4 py-1.5 text-sm text-red-700 mb-6">
            <AlertTriangle className="w-4 h-4" />
            <span>{t("urgency.title")}</span>
          </div>
          <div className="space-y-4 max-w-xl mx-auto">
            {[
              t("urgency.line1"),
              t("urgency.line2"),
              t("urgency.line3"),
            ].map((line, i) => (
              <div key={i} className="flex items-center gap-3 text-left bg-white rounded-xl p-4 shadow-sm border border-red-100">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-gray-800 font-medium">{line}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-lg px-8 py-6 shadow-lg shadow-red-500/25 hover:scale-105 transition-all duration-300">
                {t("urgency.cta")} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works - SALES oriented: sell the RESULT */}
      <section id="how" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">{t("how.title")}</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t("how.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                step: "1",
                title: t("how.step1.title"),
                desc: t("how.step1.desc"),
                result: t("how.step1.result"),
                color: "from-blue-500 to-indigo-500",
                bgColor: "bg-blue-50",
                borderColor: "border-blue-200",
                resultBg: "bg-blue-50 text-blue-700",
              },
              {
                icon: Star,
                step: "2",
                title: t("how.step2.title"),
                desc: t("how.step2.desc"),
                result: t("how.step2.result"),
                color: "from-yellow-500 to-orange-500",
                bgColor: "bg-yellow-50",
                borderColor: "border-yellow-200",
                resultBg: "bg-yellow-50 text-yellow-700",
              },
              {
                icon: TrendingUp,
                step: "3",
                title: t("how.step3.title"),
                desc: t("how.step3.desc"),
                result: t("how.step3.result"),
                color: "from-green-500 to-emerald-500",
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
                resultBg: "bg-green-50 text-green-700",
              },
            ].map((item, i) => (
              <div key={i} className={`relative bg-white rounded-2xl p-8 border-2 ${item.borderColor} hover:shadow-xl transition-all duration-300 group`}>
                <div className={`absolute -top-5 left-8 w-10 h-10 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  {item.step}
                </div>
                <div className={`w-14 h-14 ${item.bgColor} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-7 h-7 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{item.desc}</p>
                <div className={`inline-flex items-center gap-2 text-sm font-semibold ${item.resultBg} px-4 py-2 rounded-full`}>
                  <CheckCircle2 className="w-4 h-4" /> {item.result}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-10 py-7 shadow-xl shadow-blue-500/30 hover:scale-105 transition-all duration-300">
                {t("hero.generate_qr")} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Before / After Results */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">{t("results.title")}</h2>
            <p className="mt-4 text-lg text-gray-300">{t("results.subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                label: t("results.reviews_label"),
                before: t("results.reviews_before"),
                after: t("results.reviews_after"),
                icon: MessageSquare,
                afterColor: "text-green-400",
              },
              {
                label: t("results.rating_label"),
                before: t("results.rating_before"),
                after: t("results.rating_after"),
                icon: Star,
                afterColor: "text-yellow-400",
                showStars: true,
              },
              {
                label: t("results.visibility_label"),
                before: t("results.visibility_before"),
                after: t("results.visibility_after"),
                icon: TrendingUp,
                afterColor: "text-blue-400",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">{item.label}</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">{t("results.before")}</span>
                    <span className="text-2xl font-bold text-red-400/80 line-through decoration-red-500/50">{item.before}</span>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-red-500/30 via-transparent to-green-500/30" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">{t("results.after")}</span>
                    <span className={`text-3xl font-extrabold ${item.afterColor}`}>{item.after}</span>
                  </div>
                  {item.showStars && (
                    <div className="flex justify-end gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= 4 ? "text-yellow-400 fill-yellow-400" : s <= 4.7 ? "text-yellow-400 fill-yellow-400 opacity-70" : "text-gray-600"}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-8">{t("results.disclaimer")}</p>
          <div className="text-center mt-10">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg px-10 py-7 shadow-xl shadow-green-500/30 hover:scale-105 transition-all duration-300 text-white">
                {t("results.cta")} <ArrowRight className="w-5 h-5 ml-2" />
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
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-10 text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="text-6xl font-extrabold mb-2">{t("pricing.price")}</div>
              <div className="text-blue-200 text-lg font-medium mb-8">{t("pricing.forever")}</div>
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
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 w-full max-w-sm shadow-lg hover:scale-105 transition-all duration-300">
                  {t("pricing.cta")} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
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

      {/* Final CTA - Dark & Urgent */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            {t("cta.title")}
          </h2>
          <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-lg sm:text-xl px-10 py-7 shadow-xl shadow-blue-500/30 hover:scale-105 transition-all duration-300">
              {t("hero.generate_qr")} <QrCode className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="mt-6 text-gray-500 text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {t("hero.nocard")} &bull; {t("hero.quick")}
          </p>
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
