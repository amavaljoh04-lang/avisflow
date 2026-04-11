import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, QrCode, Shield, TrendingUp, ArrowRight, CheckCircle2, BarChart3, MessageSquare } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
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
            <a href="#features" className="hover:text-gray-900 transition">Fonctionnalités</a>
            <a href="#how" className="hover:text-gray-900 transition">Comment ça marche</a>
            <a href="#pricing" className="hover:text-gray-900 transition">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Commencer gratuitement
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
              <span>100% Gratuit — Boostez vos avis Google dès maintenant</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
              Transformez vos clients en{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                avis 5 étoiles
              </span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              AvisFlow collecte automatiquement les avis positifs sur Google et garde les retours négatifs privés. 
              Un simple QR code suffit.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6 shadow-lg shadow-blue-500/25">
                  Créer mon compte gratuit <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#how">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  Voir la démo
                </Button>
              </a>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Aucune carte requise</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Installation en 2 min</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> 100% gratuit</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "93%", label: "des clients lisent les avis" },
              { value: "4.5★", label: "note moyenne obtenue" },
              { value: "+200%", label: "d'avis en plus" },
              { value: "2 min", label: "pour s'installer" },
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Comment ça marche ?</h2>
            <p className="mt-4 text-lg text-gray-600">3 étapes simples pour booster votre réputation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                step: "1",
                title: "Affichez votre QR Code",
                desc: "Imprimez le QR code généré et placez-le sur vos tables, comptoir ou vitrine. Vos clients le scannent avec leur téléphone.",
              },
              {
                icon: Star,
                step: "2",
                title: "Le client note son expérience",
                desc: "Une page élégante s'ouvre. Le client choisit de 1 à 5 étoiles. Simple, rapide, sans application à télécharger.",
              },
              {
                icon: TrendingUp,
                step: "3",
                title: "Les avis positifs vont sur Google",
                desc: "4-5 étoiles → redirigé vers Google. 1-3 étoiles → feedback privé pour vous. Votre note Google monte naturellement.",
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
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Tout ce dont vous avez besoin</h2>
            <p className="mt-4 text-lg text-gray-600">Des outils puissants pour gérer votre e-réputation</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: QrCode, title: "QR Codes personnalisés", desc: "Générez des QR codes avec votre branding. Imprimez-les ou affichez-les sur écran." },
              { icon: Shield, title: "Protection des avis négatifs", desc: "Les avis 1-3 étoiles restent privés. Recevez le feedback pour vous améliorer." },
              { icon: TrendingUp, title: "Redirection Google intelligente", desc: "Les clients satisfaits sont redirigés vers votre page Google pour laisser un avis." },
              { icon: BarChart3, title: "Analytics en temps réel", desc: "Suivez l'évolution de vos avis, taux de satisfaction et scans de QR codes." },
              { icon: MessageSquare, title: "Feedback privé", desc: "Recevez les retours négatifs en privé et répondez directement à vos clients." },
              { icon: Star, title: "Multi-établissements", desc: "Gérez plusieurs établissements depuis un seul tableau de bord." },
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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">100% Gratuit</h2>
          <p className="mt-4 text-lg text-gray-600 mb-12">Pas de piège, pas de carte bancaire. Tous les outils pour booster vos avis Google.</p>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-blue-500/20">
            <div className="text-5xl font-bold mb-2">0€</div>
            <div className="text-blue-200 mb-8">pour toujours</div>
            <ul className="space-y-3 text-left max-w-sm mx-auto mb-8">
              {[
                "Établissements illimités",
                "QR codes illimités",
                "Collecte d'avis illimitée",
                "Dashboard analytics complet",
                "Redirection Google automatique",
                "Feedback privé",
                "Support par email",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-200 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 w-full max-w-sm">
                Commencer maintenant <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à booster vos avis Google ?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Rejoignez les milliers de commerces qui utilisent AvisFlow pour améliorer leur réputation en ligne.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-lg px-8 py-6">
              Créer mon compte gratuit <ArrowRight className="w-5 h-5 ml-2" />
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
            <p className="text-sm">&copy; {new Date().getFullYear()} AvisFlow. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
