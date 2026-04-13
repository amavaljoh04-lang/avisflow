import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "fr" | "en";

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    // Nav
    "nav.features": "Fonctionnalites",
    "nav.how": "Comment ca marche",
    "nav.pricing": "Tarifs",
    "nav.blog": "Blog",
    "nav.login": "Connexion",
    "nav.signup": "Commencer gratuitement",
    "nav.admin": "Admin",

    // Hero
    "hero.badge": "100% Gratuit — Boostez vos avis Google des maintenant",
    "hero.title1": "Transformez vos clients en ",
    "hero.title2": "avis 5 etoiles",
    "hero.subtitle": "AvisFlow collecte automatiquement les avis positifs sur Google et garde les retours negatifs prives. Un simple QR code suffit.",
    "hero.cta": "Creer mon compte gratuit",
    "hero.generate_qr": "Generer mon QR code gratuit",
    "hero.demo": "Voir la demo",
    "hero.nocard": "Aucune carte requise",
    "hero.quick": "Installation en 2 min",
    "hero.free": "100% gratuit",

    // Stats
    "stats.users": "Utilisateurs inscrits",
    "stats.pages": "Pages creees",
    "stats.reviews": "Avis collectes",
    "stats.avg": "Note moyenne",
    "stats.google": "Rediriges vers Google",

    // How it works
    "how.title": "Comment ca marche ?",
    "how.subtitle": "3 etapes simples pour booster votre reputation",
    "how.step1.title": "Affichez votre QR Code",
    "how.step1.desc": "Imprimez le QR code genere et placez-le sur vos tables, comptoir ou vitrine. Vos clients le scannent avec leur telephone.",
    "how.step2.title": "Le client note son experience",
    "how.step2.desc": "Une page elegante s'ouvre. Le client choisit de 1 a 5 etoiles. Simple, rapide, sans application a telecharger.",
    "how.step3.title": "Les avis positifs vont sur Google",
    "how.step3.desc": "4-5 etoiles → redirige vers Google. 1-3 etoiles → feedback prive pour vous. Votre note Google monte naturellement.",

    // Features
    "features.title": "Tout ce dont vous avez besoin",
    "features.subtitle": "Des outils puissants pour gerer votre e-reputation",
    "features.qr.title": "QR Codes personnalises",
    "features.qr.desc": "Generez des QR codes avec votre branding. Imprimez-les ou affichez-les sur ecran.",
    "features.shield.title": "Protection des avis negatifs",
    "features.shield.desc": "Les avis 1-3 etoiles restent prives. Recevez le feedback pour vous ameliorer.",
    "features.redirect.title": "Redirection Google intelligente",
    "features.redirect.desc": "Les clients satisfaits sont rediriges vers votre page Google pour laisser un avis.",
    "features.analytics.title": "Analytics en temps reel",
    "features.analytics.desc": "Suivez l'evolution de vos avis, taux de satisfaction et scans de QR codes.",
    "features.feedback.title": "Feedback prive",
    "features.feedback.desc": "Recevez les retours negatifs en prive et repondez directement a vos clients.",
    "features.multi.title": "Multi-etablissements",
    "features.multi.desc": "Gerez plusieurs etablissements depuis un seul tableau de bord.",

    // Pricing
    "pricing.title": "100% Gratuit",
    "pricing.subtitle": "Pas de piege, pas de carte bancaire. Tous les outils pour booster vos avis Google.",
    "pricing.price": "0\u20ac",
    "pricing.forever": "pour toujours",
    "pricing.f1": "Etablissements illimites",
    "pricing.f2": "QR codes illimites",
    "pricing.f3": "Collecte d'avis illimitee",
    "pricing.f4": "Dashboard analytics complet",
    "pricing.f5": "Redirection Google automatique",
    "pricing.f6": "Feedback prive",
    "pricing.f7": "Support par email",
    "pricing.cta": "Commencer maintenant",

    // Visual Demo
    "demo.title": "Voyez comment ca fonctionne",
    "demo.subtitle": "Un parcours simple pour vos clients, des resultats concrets pour vous",
    "demo.step1": "Le client scanne",
    "demo.step1_desc": "Placez le QR code sur vos tables ou comptoir",
    "demo.phone_title": "Comment etait votre experience ?",
    "demo.phone_desc": "Le client note en un clic",
    "demo.google_review": "Avis Google publie",
    "demo.step3": "L'avis va sur Google",
    "demo.step3_desc": "Les clients satisfaits laissent un avis 5 etoiles",

    // Business types
    "types.title": "Pour tous les types de commerces",
    "types.subtitle": "AvisFlow s'adapte a votre activite",
    "types.restaurant": "Restaurant",
    "types.salon": "Salon de coiffure",
    "types.garage": "Garage auto",
    "types.shop": "Boutique",
    "types.health": "Sante",
    "types.hotel": "Hotel",

    // CTA
    "cta.title": "Pret a booster vos avis Google ?",
    "cta.subtitle": "Rejoignez les commerces qui utilisent AvisFlow pour ameliorer leur reputation en ligne.",
    "cta.button": "Creer mon compte gratuit",

    // Footer
    "footer.rights": "Tous droits reserves.",

    // Auth
    "auth.login": "Connexion",
    "auth.login.subtitle": "Accedez a votre tableau de bord",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.submit.login": "Se connecter",
    "auth.no_account": "Pas encore de compte ?",
    "auth.create_account": "Creer un compte",
    "auth.register": "Creer un compte",
    "auth.register.subtitle": "Commencez a collecter des avis gratuitement",
    "auth.fullname": "Nom complet",
    "auth.submit.register": "Creer mon compte",
    "auth.has_account": "Deja un compte ?",
    "auth.go_login": "Se connecter",
    "auth.password.min": "Min. 6 caracteres",
    "auth.success.login": "Connexion reussie !",
    "auth.success.register": "Compte cree avec succes !",
    "auth.error.login": "Erreur de connexion",
    "auth.error.register": "Erreur lors de l'inscription",
    "auth.error.password": "Le mot de passe doit contenir au moins 6 caracteres",

    // Email verification
    "auth.verify.title": "Verifiez votre email",
    "auth.verify.desc": "Un email de confirmation a ete envoye a :",
    "auth.verify.spam": "Verifiez aussi vos spams si vous ne trouvez pas l'email.",
    "auth.verify.resend": "Renvoyer l'email",
    "auth.verify.resent": "Email de verification renvoye !",
    "auth.verify.sent": "Email de verification envoye ! Verifiez votre boite de reception.",
    "auth.verify.required": "Email non verifie",
    "auth.verify.check_inbox": "Verifiez votre boite de reception et cliquez sur le lien de confirmation.",
    "auth.verify.success": "Email verifie ! Vous pouvez maintenant vous connecter.",
    "auth.verify.error": "Lien de verification invalide ou expire.",
    "auth.verify.already": "Cet email est deja verifie.",

    // Dashboard
    "dash.title": "Mes etablissements",
    "dash.subtitle": "Gerez vos etablissements et collectez des avis",
    "dash.add": "Ajouter",
    "dash.new": "Nouvel etablissement",
    "dash.name": "Nom de l'etablissement",
    "dash.category": "Categorie",
    "dash.category.placeholder": "Restaurant, Coiffeur, etc.",
    "dash.address": "Adresse",
    "dash.phone": "Telephone",
    "dash.google_url": "Lien avis Google",
    "dash.threshold": "Seuil positif (etoiles)",
    "dash.threshold.help": "Les notes >= ce seuil seront redirigees vers Google",
    "dash.create": "Creer l'etablissement",
    "dash.none.title": "Aucun etablissement",
    "dash.none.desc": "Creez votre premier etablissement pour commencer a collecter des avis",
    "dash.none.button": "Ajouter un etablissement",
    "dash.active": "Actif",
    "dash.inactive": "Inactif",
    "dash.qrcodes": "QR Codes",
    "dash.analytics": "Analytics",
    "dash.created": "Etablissement cree !",
    "dash.error.load": "Erreur lors du chargement",
    "dash.error.create": "Erreur lors de la creation",

    // Review page
    "review.experience": "Comment etait votre experience ?",
    "review.redirect": "Merci ! Redirection vers Google...",
    "review.error": "Erreur, veuillez reessayer",
    "review.thanks": "Merci pour votre retour !",
    "review.recorded": "Votre avis a bien ete enregistre.",
    "review.improves": "prend en compte tous les retours pour s'ameliorer.",
    "review.not_found": "Etablissement introuvable",
    "review.feedback": "Dites-nous comment nous ameliorer",
    "review.comment": "Votre commentaire...",
    "review.name": "Nom (optionnel)",
    "review.email_opt": "Email (optionnel)",
    "review.send": "Envoyer mon avis",
    "review.sorry3": "Merci pour votre retour",
    "review.sorry2": "Nous sommes desoles...",
    "review.sorry1": "Nous sommes navres de votre experience",
    "review.powered": "Propulse par",
    "review.select": "Veuillez selectionner une note",
    "review.send_error": "Erreur lors de l'envoi",

    // Blog
    "blog.title": "Blog",
    "blog.subtitle": "Conseils et astuces pour booster vos avis Google",
    "blog.read": "Lire l'article",
    "blog.back": "Retour au blog",
    "blog.empty": "Aucun article pour le moment",
    "blog.empty.desc": "Revenez bientot pour decouvrir nos conseils !",
    "blog.share": "Partager",
    "blog.cta": "Commencez a collecter des avis",
    "blog.cta.button": "Creer mon compte gratuit",

    // Admin Blog
    "admin.blog.title": "Articles de blog",
    "admin.blog.new": "Nouvel article",
    "admin.blog.form.title": "Titre",
    "admin.blog.form.content": "Contenu (HTML)",
    "admin.blog.form.excerpt": "Extrait",
    "admin.blog.form.cover": "URL image de couverture",
    "admin.blog.form.lang": "Langue",
    "admin.blog.form.published": "Publie",
    "admin.blog.form.draft": "Brouillon",
    "admin.blog.save": "Enregistrer",
    "admin.blog.cancel": "Annuler",
    "admin.blog.edit": "Modifier",
    "admin.blog.delete": "Supprimer",
    "admin.blog.empty": "Aucun article",
    "admin.blog.empty.desc": "Creez votre premier article de blog pour le SEO",
    "admin.blog.created": "Article cree !",
    "admin.blog.updated": "Article mis a jour !",
    "admin.blog.deleted": "Article supprime !",
    "admin.blog.error": "Erreur",

    // Admin Ads
    "admin.ads.title": "Publicites",
    "admin.ads.new": "Nouvelle publicite",
    "admin.ads.form.title": "Titre",
    "admin.ads.form.image": "URL de l'image",
    "admin.ads.form.link": "URL du lien",
    "admin.ads.form.position": "Emplacement",
    "admin.ads.form.active": "Active",
    "admin.ads.positions.home_banner": "Banniere accueil (haut)",
    "admin.ads.positions.home_middle": "Accueil (milieu)",
    "admin.ads.positions.home_bottom": "Accueil (bas)",
    "admin.ads.created": "Publicite creee !",
    "admin.ads.updated": "Publicite mise a jour !",
    "admin.ads.deleted": "Publicite supprimee !",
    "admin.ads.empty": "Aucune publicite",
    "admin.ads.empty.desc": "Ajoutez des publicites pour generer des revenus",
    "admin.ads.error": "Erreur",
    "admin.ads.activated": "Publicite activee",
    "admin.ads.deactivated": "Publicite desactivee",
  },
  en: {
    // Nav
    "nav.features": "Features",
    "nav.how": "How it works",
    "nav.pricing": "Pricing",
    "nav.blog": "Blog",
    "nav.login": "Login",
    "nav.signup": "Get started free",
    "nav.admin": "Admin",

    // Hero
    "hero.badge": "100% Free — Boost your Google reviews now",
    "hero.title1": "Turn your customers into ",
    "hero.title2": "5-star reviews",
    "hero.subtitle": "AvisFlow automatically collects positive reviews on Google and keeps negative feedback private. A simple QR code is all you need.",
    "hero.cta": "Create my free account",
    "hero.generate_qr": "Generate my free QR code",
    "hero.demo": "See the demo",
    "hero.nocard": "No credit card required",
    "hero.quick": "Setup in 2 min",
    "hero.free": "100% free",

    // Stats
    "stats.users": "Registered users",
    "stats.pages": "Pages created",
    "stats.reviews": "Reviews collected",
    "stats.avg": "Average rating",
    "stats.google": "Redirected to Google",

    // How it works
    "how.title": "How does it work?",
    "how.subtitle": "3 simple steps to boost your reputation",
    "how.step1.title": "Display your QR Code",
    "how.step1.desc": "Print the generated QR code and place it on your tables, counter, or window. Customers scan it with their phone.",
    "how.step2.title": "Customer rates their experience",
    "how.step2.desc": "An elegant page opens. The customer picks 1 to 5 stars. Simple, fast, no app to download.",
    "how.step3.title": "Positive reviews go to Google",
    "how.step3.desc": "4-5 stars \u2192 redirected to Google. 1-3 stars \u2192 private feedback for you. Your Google rating rises naturally.",

    // Features
    "features.title": "Everything you need",
    "features.subtitle": "Powerful tools to manage your online reputation",
    "features.qr.title": "Custom QR Codes",
    "features.qr.desc": "Generate QR codes with your branding. Print them or display on screen.",
    "features.shield.title": "Negative review protection",
    "features.shield.desc": "1-3 star reviews stay private. Receive feedback to improve.",
    "features.redirect.title": "Smart Google redirect",
    "features.redirect.desc": "Satisfied customers are redirected to your Google page to leave a review.",
    "features.analytics.title": "Real-time analytics",
    "features.analytics.desc": "Track your reviews, satisfaction rate, and QR code scans.",
    "features.feedback.title": "Private feedback",
    "features.feedback.desc": "Receive negative reviews privately and respond directly to your customers.",
    "features.multi.title": "Multi-location",
    "features.multi.desc": "Manage multiple locations from a single dashboard.",

    // Pricing
    "pricing.title": "100% Free",
    "pricing.subtitle": "No catch, no credit card. All the tools to boost your Google reviews.",
    "pricing.price": "$0",
    "pricing.forever": "forever",
    "pricing.f1": "Unlimited locations",
    "pricing.f2": "Unlimited QR codes",
    "pricing.f3": "Unlimited review collection",
    "pricing.f4": "Full analytics dashboard",
    "pricing.f5": "Automatic Google redirect",
    "pricing.f6": "Private feedback",
    "pricing.f7": "Email support",
    "pricing.cta": "Start now",

    // Visual Demo
    "demo.title": "See how it works",
    "demo.subtitle": "A simple journey for your customers, real results for you",
    "demo.step1": "Customer scans",
    "demo.step1_desc": "Place the QR code on your tables or counter",
    "demo.phone_title": "How was your experience?",
    "demo.phone_desc": "Customer rates in one click",
    "demo.google_review": "Google review posted",
    "demo.step3": "Review goes to Google",
    "demo.step3_desc": "Satisfied customers leave a 5-star review",

    // Business types
    "types.title": "For all types of businesses",
    "types.subtitle": "AvisFlow adapts to your business",
    "types.restaurant": "Restaurant",
    "types.salon": "Hair salon",
    "types.garage": "Auto shop",
    "types.shop": "Retail store",
    "types.health": "Healthcare",
    "types.hotel": "Hotel",

    // CTA
    "cta.title": "Ready to boost your Google reviews?",
    "cta.subtitle": "Join businesses using AvisFlow to improve their online reputation.",
    "cta.button": "Create my free account",

    // Footer
    "footer.rights": "All rights reserved.",

    // Auth
    "auth.login": "Login",
    "auth.login.subtitle": "Access your dashboard",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.submit.login": "Sign in",
    "auth.no_account": "Don't have an account?",
    "auth.create_account": "Create an account",
    "auth.register": "Create an account",
    "auth.register.subtitle": "Start collecting reviews for free",
    "auth.fullname": "Full name",
    "auth.submit.register": "Create my account",
    "auth.has_account": "Already have an account?",
    "auth.go_login": "Sign in",
    "auth.password.min": "Min. 6 characters",
    "auth.success.login": "Login successful!",
    "auth.success.register": "Account created successfully!",
    "auth.error.login": "Login error",
    "auth.error.register": "Registration error",
    "auth.error.password": "Password must be at least 6 characters",

    // Email verification
    "auth.verify.title": "Check your email",
    "auth.verify.desc": "A confirmation email has been sent to:",
    "auth.verify.spam": "Check your spam folder if you don't see the email.",
    "auth.verify.resend": "Resend email",
    "auth.verify.resent": "Verification email resent!",
    "auth.verify.sent": "Verification email sent! Check your inbox.",
    "auth.verify.required": "Email not verified",
    "auth.verify.check_inbox": "Check your inbox and click the confirmation link.",
    "auth.verify.success": "Email verified! You can now sign in.",
    "auth.verify.error": "Invalid or expired verification link.",
    "auth.verify.already": "This email is already verified.",

    // Dashboard
    "dash.title": "My locations",
    "dash.subtitle": "Manage your locations and collect reviews",
    "dash.add": "Add",
    "dash.new": "New location",
    "dash.name": "Location name",
    "dash.category": "Category",
    "dash.category.placeholder": "Restaurant, Hair salon, etc.",
    "dash.address": "Address",
    "dash.phone": "Phone",
    "dash.google_url": "Google review link",
    "dash.threshold": "Positive threshold (stars)",
    "dash.threshold.help": "Ratings >= this threshold will be redirected to Google",
    "dash.create": "Create location",
    "dash.none.title": "No locations",
    "dash.none.desc": "Create your first location to start collecting reviews",
    "dash.none.button": "Add a location",
    "dash.active": "Active",
    "dash.inactive": "Inactive",
    "dash.qrcodes": "QR Codes",
    "dash.analytics": "Analytics",
    "dash.created": "Location created!",
    "dash.error.load": "Loading error",
    "dash.error.create": "Creation error",

    // Review page
    "review.experience": "How was your experience?",
    "review.redirect": "Thank you! Redirecting to Google...",
    "review.error": "Error, please try again",
    "review.thanks": "Thank you for your feedback!",
    "review.recorded": "Your review has been recorded.",
    "review.improves": "takes all feedback into account to improve.",
    "review.not_found": "Business not found",
    "review.feedback": "Tell us how we can improve",
    "review.comment": "Your comment...",
    "review.name": "Name (optional)",
    "review.email_opt": "Email (optional)",
    "review.send": "Send my review",
    "review.sorry3": "Thank you for your feedback",
    "review.sorry2": "We're sorry...",
    "review.sorry1": "We're sorry about your experience",
    "review.powered": "Powered by",
    "review.select": "Please select a rating",
    "review.send_error": "Error while sending",

    // Blog
    "blog.title": "Blog",
    "blog.subtitle": "Tips and tricks to boost your Google reviews",
    "blog.read": "Read article",
    "blog.back": "Back to blog",
    "blog.empty": "No articles yet",
    "blog.empty.desc": "Come back soon to discover our tips!",
    "blog.share": "Share",
    "blog.cta": "Start collecting reviews",
    "blog.cta.button": "Create my free account",

    // Admin Blog
    "admin.blog.title": "Blog posts",
    "admin.blog.new": "New article",
    "admin.blog.form.title": "Title",
    "admin.blog.form.content": "Content (HTML)",
    "admin.blog.form.excerpt": "Excerpt",
    "admin.blog.form.cover": "Cover image URL",
    "admin.blog.form.lang": "Language",
    "admin.blog.form.published": "Published",
    "admin.blog.form.draft": "Draft",
    "admin.blog.save": "Save",
    "admin.blog.cancel": "Cancel",
    "admin.blog.edit": "Edit",
    "admin.blog.delete": "Delete",
    "admin.blog.empty": "No articles",
    "admin.blog.empty.desc": "Create your first blog post for SEO",
    "admin.blog.created": "Article created!",
    "admin.blog.updated": "Article updated!",
    "admin.blog.deleted": "Article deleted!",
    "admin.blog.error": "Error",

    // Admin Ads
    "admin.ads.title": "Ads",
    "admin.ads.new": "New ad",
    "admin.ads.form.title": "Title",
    "admin.ads.form.image": "Image URL",
    "admin.ads.form.link": "Link URL",
    "admin.ads.form.position": "Position",
    "admin.ads.form.active": "Active",
    "admin.ads.positions.home_banner": "Homepage banner (top)",
    "admin.ads.positions.home_middle": "Homepage (middle)",
    "admin.ads.positions.home_bottom": "Homepage (bottom)",
    "admin.ads.created": "Ad created!",
    "admin.ads.updated": "Ad updated!",
    "admin.ads.deleted": "Ad deleted!",
    "admin.ads.empty": "No ads",
    "admin.ads.empty.desc": "Add ads to generate revenue",
    "admin.ads.error": "Error",
    "admin.ads.activated": "Ad activated",
    "admin.ads.deactivated": "Ad deactivated",
  },
};

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "fr",
  setLang: () => {},
  t: (key: string) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("avisflow_lang");
    if (saved === "en" || saved === "fr") return saved;
    // Auto-detect browser language
    const browserLang = navigator.language.slice(0, 2);
    return browserLang === "en" ? "en" : "fr";
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("avisflow_lang", newLang);
  };

  const t = (key: string): string => {
    return translations[lang][key] || translations["fr"][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LangSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm font-medium text-gray-700"
      title={lang === "fr" ? "Switch to English" : "Passer en francais"}
    >
      <span className="text-base">{lang === "fr" ? "\uD83C\uDDEC\uD83C\uDDE7" : "\uD83C\uDDEB\uD83C\uDDF7"}</span>
      <span>{lang === "fr" ? "EN" : "FR"}</span>
    </button>
  );
}
