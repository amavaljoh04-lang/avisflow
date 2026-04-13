import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, QrCode, Shield, TrendingUp, ArrowRight, CheckCircle2, BarChart3, MessageSquare, Utensils, Scissors, Car, ShoppingBag, Stethoscope, Hotel, Zap, Clock, AlertTriangle, ChevronRight, Users, Eye } from "lucide-react";
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
    <div className="min-h-screen bg-white antialiased">
      <SEO title={undefined} description="AvisFlow aide les commerces locaux \u00e0 collecter plus d\u0027avis Google positifs gr\u00e2ce aux QR codes. Gratuit, simple et efficace." />

      {/* ===== NAV - Clean & Professional ===== */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-600/20">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">AvisFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{t("nav.how")}</a>
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{t("nav.features")}</a>
            <a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{t("nav.pricing")}</a>
            <Link to="/blog" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{t("nav.blog")}</Link>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-gray-600 font-medium">{t("nav.login")}</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 font-medium">
                {t("nav.signup")}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO - Professional with Phone Mockup ===== */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/80 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-medium text-blue-700 mb-6">
                <Zap className="w-3.5 h-3.5" />
                <span>{t("hero.badge")}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                {t("hero.title1")}
                <span className="text-blue-600">{t("hero.title2")}</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                {t("hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start gap-3">
                <Link to="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base font-semibold px-8 py-6 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all duration-200">
                    {t("hero.generate_qr")} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="#how">
                  <Button variant="ghost" size="lg" className="text-base font-medium text-gray-600 hover:text-gray-900 px-6 py-6">
                    {t("hero.demo")} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t("hero.nocard")}</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t("hero.quick")}</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> {t("hero.free")}</span>
              </div>
            </div>

            {/* Right: Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone frame */}
                <div className="w-[280px] sm:w-[320px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-gray-900/20">
                  <div className="bg-white rounded-[2.2rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-3.5 h-2 bg-gray-300 rounded-sm" />
                        <div className="w-1.5 h-2 bg-gray-300 rounded-sm" />
                      </div>
                    </div>
                    {/* App content */}
                    <div className="px-6 py-8">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                          <Star className="w-6 h-6 text-white fill-white" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">{t("demo.phone_title")}</p>
                        <p className="text-xs text-gray-400 mb-6">Restaurant Le Petit Bistrot</p>
                        <div className="flex justify-center gap-2 mb-6">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-10 h-10 ${s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} cursor-pointer`} />
                          ))}
                        </div>
                        <div className="space-y-2.5">
                          <button className="w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-xl shadow-sm">
                            {t("review.leave_google")}
                          </button>
                          <button className="w-full bg-gray-100 text-gray-700 text-sm font-medium py-3 rounded-xl">
                            {t("review.send_private")}
                          </button>
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-300">
                          <span>{t("review.powered")}</span>
                          <span className="font-semibold text-blue-500">AvisFlow</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t("results.reviews_label")}</p>
                    <p className="text-sm font-bold text-gray-900">{t("hero.badge_reviews")} <span className="text-green-600 text-xs font-medium">{t("hero.badge_reviews_label")}</span></p>
                  </div>
                </div>
                <div className="absolute -bottom-2 -left-6 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{t("hero.badge_rating")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF STRIP - Compact & Professional ===== */}
      <section className="py-10 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: t("proof.stat1"), label: t("proof.stat1_label"), icon: MessageSquare },
              { value: t("proof.stat2"), label: t("proof.stat2_label"), icon: Star },
              { value: t("proof.stat3"), label: t("proof.stat3_label"), icon: Users },
              { value: t("proof.stat4"), label: t("proof.stat4_label"), icon: Clock },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-white">{s.value}</div>
                <div className="mt-1 text-sm text-gray-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">{t("proof.disclaimer")}</p>
        </div>
      </section>

      {/* Ad Banner */}
      {homeBannerAds.length > 0 && (
        <section className="py-3 bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {homeBannerAds.map((ad) => (
              <a key={ad.id} href={ad.link_url || "#"} target="_blank" rel="noopener noreferrer" className="block">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} className="w-full max-h-20 object-contain rounded-lg" />
                ) : (
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm font-medium text-blue-700">{ad.title}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ===== HOW IT WORKS - Result-Oriented with Visuals ===== */}
      <section id="how" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">{t("nav.how")}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t("how.title")}</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">{t("how.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
            {[
              {
                icon: QrCode,
                step: "01",
                title: t("how.step1.title"),
                desc: t("how.step1.desc"),
                result: t("how.step1.result"),
                accent: "blue",
              },
              {
                icon: Star,
                step: "02",
                title: t("how.step2.title"),
                desc: t("how.step2.desc"),
                result: t("how.step2.result"),
                accent: "amber",
              },
              {
                icon: TrendingUp,
                step: "03",
                title: t("how.step3.title"),
                desc: t("how.step3.desc"),
                result: t("how.step3.result"),
                accent: "green",
              },
            ].map((item, i) => {
              const colors: Record<string, { bg: string; icon: string; badge: string; step: string }> = {
                blue: { bg: "bg-blue-50", icon: "text-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-100", step: "text-blue-600" },
                amber: { bg: "bg-amber-50", icon: "text-amber-600", badge: "bg-amber-50 text-amber-700 border-amber-100", step: "text-amber-600" },
                green: { bg: "bg-green-50", icon: "text-green-600", badge: "bg-green-50 text-green-700 border-green-100", step: "text-green-600" },
              };
              const c = colors[item.accent];
              return (
                <div key={i} className="relative group">
                  {i < 2 && (
                    <div className="hidden lg:block absolute top-12 -right-5 lg:-right-7">
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all duration-300 h-full">
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center`}>
                        <item.icon className={`w-6 h-6 ${c.icon}`} />
                      </div>
                      <span className={`text-sm font-bold ${c.step} tracking-wider`}>{item.step}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-500 leading-relaxed mb-5">{item.desc}</p>
                    <div className={`inline-flex items-center gap-2 text-sm font-semibold ${c.badge} border px-4 py-2 rounded-full`}>
                      <CheckCircle2 className="w-4 h-4" /> {item.result}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-14">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base font-semibold px-8 py-6 shadow-lg shadow-blue-600/25 transition-all duration-200">
                {t("hero.generate_qr")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== BEFORE / AFTER - Clean Impact ===== */}
      <section className="py-20 sm:py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">{t("results.title")}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t("results.subtitle")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: t("results.reviews_label"),
                before: t("results.reviews_before"),
                after: t("results.reviews_after"),
                icon: MessageSquare,
                color: "green",
              },
              {
                label: t("results.rating_label"),
                before: t("results.rating_before"),
                after: t("results.rating_after"),
                icon: Star,
                color: "amber",
                showStars: true,
              },
              {
                label: t("results.visibility_label"),
                before: t("results.visibility_before"),
                after: t("results.visibility_after"),
                icon: Eye,
                color: "blue",
              },
            ].map((item, i) => {
              const afterColors: Record<string, string> = { green: "text-green-600", amber: "text-amber-600", blue: "text-blue-600" };
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-8">
                    <item.icon className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">{item.label}</h3>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{t("results.before")}</p>
                      <p className="text-2xl font-bold text-gray-300 line-through">{item.before}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 mb-2" />
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{t("results.after")}</p>
                      <p className={`text-3xl font-extrabold ${afterColors[item.color]}`}>{item.after}</p>
                      {item.showStars && (
                        <div className="flex justify-end gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= 5 ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-gray-400 mt-8">{t("results.disclaimer")}</p>
          <div className="text-center mt-10">
            <Link to="/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-base font-semibold px-8 py-6 shadow-lg shadow-green-600/25 transition-all duration-200">
                {t("results.cta")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ad Middle */}
      {homeMiddleAds.length > 0 && (
        <section className="py-3 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {homeMiddleAds.map((ad) => (
              <a key={ad.id} href={ad.link_url || "#"} target="_blank" rel="noopener noreferrer" className="block">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} className="w-full max-h-20 object-contain rounded-lg" />
                ) : (
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm font-medium text-blue-700">{ad.title}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ===== FEATURES - Professional Grid ===== */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">{t("nav.features")}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t("features.title")}</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">{t("features.subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: QrCode, title: t("features.qr.title"), desc: t("features.qr.desc"), color: "bg-blue-50 text-blue-600" },
              { icon: Shield, title: t("features.shield.title"), desc: t("features.shield.desc"), color: "bg-purple-50 text-purple-600" },
              { icon: TrendingUp, title: t("features.redirect.title"), desc: t("features.redirect.desc"), color: "bg-green-50 text-green-600" },
              { icon: BarChart3, title: t("features.analytics.title"), desc: t("features.analytics.desc"), color: "bg-amber-50 text-amber-600" },
              { icon: MessageSquare, title: t("features.feedback.title"), desc: t("features.feedback.desc"), color: "bg-rose-50 text-rose-600" },
              { icon: Star, title: t("features.multi.title"), desc: t("features.multi.desc"), color: "bg-cyan-50 text-cyan-600" },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-md hover:border-gray-200 transition-all duration-300">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BUSINESS TYPES - Clean Strip ===== */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">{t("types.title")}</h2>
            <p className="mt-2 text-gray-500">{t("types.subtitle")}</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[
              { icon: Utensils, label: t("types.restaurant") },
              { icon: Scissors, label: t("types.salon") },
              { icon: Car, label: t("types.garage") },
              { icon: ShoppingBag, label: t("types.shop") },
              { icon: Stethoscope, label: t("types.health") },
              { icon: Hotel, label: t("types.hotel") },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 text-center hover:shadow-sm transition-shadow duration-200">
                <item.icon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== URGENCY - Subtle but Effective ===== */}
      <section className="py-16 bg-amber-50/50 border-y border-amber-100/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-4 py-1.5 text-sm font-medium text-amber-800 mb-6">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t("urgency.title")}</span>
          </div>
          <div className="space-y-3 max-w-lg mx-auto">
            {[t("urgency.line1"), t("urgency.line2"), t("urgency.line3")].map((line, i) => (
              <div key={i} className="flex items-center gap-3 text-left bg-white rounded-xl px-5 py-4 border border-amber-100/60 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-gray-700 text-sm font-medium">{line}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/register">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-base font-semibold px-8 py-6 shadow-lg shadow-amber-600/20 transition-all duration-200">
                {t("urgency.cta")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PRICING - Clean & Simple ===== */}
      <section id="pricing" className="py-20 sm:py-28 bg-white">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">{t("nav.pricing")}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t("pricing.title")}</h2>
          <p className="mt-4 text-gray-500 mb-10">{t("pricing.subtitle")}</p>

          <div className="bg-white rounded-3xl border-2 border-blue-600 p-8 sm:p-10 shadow-lg shadow-blue-600/10 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
              {t("hero.free")}
            </div>
            <div className="text-6xl font-extrabold text-gray-900 mb-1">{t("pricing.price")}</div>
            <div className="text-gray-500 font-medium mb-8">{t("pricing.forever")}</div>
            <ul className="space-y-3 text-left max-w-xs mx-auto mb-8">
              {[
                t("pricing.f1"), t("pricing.f2"), t("pricing.f3"),
                t("pricing.f4"), t("pricing.f5"), t("pricing.f6"), t("pricing.f7"),
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-base font-semibold py-6 shadow-lg shadow-blue-600/25 transition-all duration-200">
                {t("pricing.cta")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ad Bottom */}
      {homeBottomAds.length > 0 && (
        <section className="py-3 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {homeBottomAds.map((ad) => (
              <a key={ad.id} href={ad.link_url || "#"} target="_blank" rel="noopener noreferrer" className="block">
                {ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} className="w-full max-h-20 object-contain rounded-lg" />
                ) : (
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm font-medium text-blue-700">{ad.title}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 sm:py-24 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            {t("cta.subtitle")}
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-base font-semibold px-10 py-7 shadow-xl shadow-blue-600/30 transition-all duration-200">
              {t("hero.generate_qr")} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="mt-6 text-gray-500 text-sm flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {t("hero.nocard")} &bull; {t("hero.quick")}
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-950 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white fill-white" />
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
