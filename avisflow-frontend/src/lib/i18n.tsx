import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "fr" | "en";

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    // Nav
    "nav.features": "Fonctionnalit\u00e9s",
    "nav.how": "Comment \u00e7a marche",
    "nav.pricing": "Tarifs",
    "nav.blog": "Blog",
    "nav.login": "Connexion",
    "nav.signup": "Commencer gratuitement",
    "nav.admin": "Administration",

    // Hero
    "hero.badge": "+35% de clients en plus pour nos utilisateurs",
    "hero.title1": "+30 avis Google en 30 jours. ",
    "hero.title2": "Plus de clients, sans effort.",
    "hero.subtitle": "Un QR code au comptoir. Votre client le scanne, laisse un avis Google en 30 secondes. Vous montez dans le classement, vous attirez de nouveaux clients. C'est aussi simple que \u00e7a.",
    "hero.cta": "Cr\u00e9er mon compte gratuit",
    "hero.generate_qr": "Obtenir mes premiers avis \u2192",
    "hero.generate_qr_short": "G\u00e9n\u00e9rer mon QR code",
    "hero.demo": "Voir comment \u00e7a marche",
    "hero.nocard": "Gratuit \u00e0 vie",
    "hero.quick": "Pr\u00eat en 2 minutes",
    "hero.free": "Aucune comp\u00e9tence technique requise",
    "hero.badge_reviews": "+30",
    "hero.badge_reviews_label": "ce mois-ci",
    "hero.badge_rating": "4.8",
    "proof.title": "Des r\u00e9sultats concrets",
    "proof.subtitle": "Les chiffres parlent d'eux-m\u00eames",
    "proof.stat1": "+120",
    "proof.stat1_label": "avis Google g\u00e9n\u00e9r\u00e9s",
    "proof.stat2": "4.8\u2b50",
    "proof.stat2_label": "note moyenne client",
    "proof.stat3": "+35%",
    "proof.stat3_label": "de clients en plus",
    "proof.stat4": "30s",
    "proof.stat4_label": "pour laisser un avis",
    "proof.disclaimer": "R\u00e9sultats observ\u00e9s aupr\u00e8s de nos premiers utilisateurs",
    "urgency.title": "Pendant que vous h\u00e9sitez...",
    "urgency.line1": "Vos concurrents collectent des avis Google",
    "urgency.line2": "Chaque avis perdu = un client en moins",
    "urgency.line3": "Les commerces avec +50 avis ont 3x plus de clics",
    "urgency.cta": "Commencer maintenant \u2014 c'est gratuit",

    // Stats
    "stats.users": "Utilisateurs inscrits",
    "stats.pages": "Pages cr\u00e9\u00e9es",
    "stats.reviews": "Avis collect\u00e9s",
    "stats.avg": "Note moyenne",
    "stats.google": "Redirig\u00e9s vers Google",

    // How it works - SALES oriented
    "how.title": "Comment obtenir +30 avis en 3 \u00e9tapes",
    "how.subtitle": "Pas besoin d'\u00eatre un expert. Collez un QR code, r\u00e9coltez les r\u00e9sultats.",
    "how.step1.title": "Collez votre QR code au comptoir",
    "how.step1.desc": "Carte de visite, sticker sur la caisse, affichette sur la table... Vos clients le scannent en 2 secondes.",
    "how.step1.result": "100% de vos clients voient le QR code",
    "how.step2.title": "Le client donne son ressenti en 5 secondes",
    "how.step2.desc": "Interface ultra simple : 5 \u00e9toiles, un clic, c'est fait. Pas d'app \u00e0 t\u00e9l\u00e9charger, pas de compte \u00e0 cr\u00e9er.",
    "how.step2.result": "Taux de participation x3 vs formulaire classique",
    "how.step3.title": "Vos avis Google explosent",
    "how.step3.desc": "Le client choisit librement : avis Google public ou retour priv\u00e9 pour vous aider \u00e0 vous am\u00e9liorer. R\u00e9sultat : plus de visibilit\u00e9, plus de clients.",
    "how.step3.result": "+30 avis Google en 30 jours en moyenne",

    // Before/After results
    "results.title": "L'impact concret sur votre commerce",
    "results.subtitle": "Voici ce qui change quand vous activez AvisFlow",
    "results.before": "AVANT AvisFlow",
    "results.after": "APR\u00c8S 30 jours",
    "results.reviews_before": "12 avis",
    "results.reviews_after": "68 avis",
    "results.reviews_label": "Avis Google",
    "results.rating_before": "3.9",
    "results.rating_after": "4.7",
    "results.rating_label": "Note moyenne",
    "results.visibility_before": "Page 3",
    "results.visibility_after": "Top 3",
    "results.visibility_label": "Position Google Maps",
    "results.disclaimer": "Exemple bas\u00e9 sur les r\u00e9sultats observ\u00e9s chez nos premiers utilisateurs",
    "results.cta": "Obtenir les m\u00eames r\u00e9sultats \u2192",

    // Features
    "features.title": "Pourquoi les pros choisissent AvisFlow",
    "features.subtitle": "Chaque fonctionnalit\u00e9 est con\u00e7ue pour un seul objectif : attirer plus de clients",
    "features.qr.title": "QR Codes personnalis\u00e9s",
    "features.qr.desc": "G\u00e9n\u00e9rez des QR codes avec votre branding. Imprimez-les ou affichez-les sur \u00e9cran.",
    "features.shield.title": "Votre arme secr\u00e8te : le feedback priv\u00e9",
    "features.shield.desc": "Les retours n\u00e9gatifs restent priv\u00e9s et vous aident \u00e0 vous am\u00e9liorer. Les retours positifs deviennent des avis Google 5\u2b50.",
    "features.redirect.title": "Lien direct vers Google",
    "features.redirect.desc": "Vos clients peuvent facilement laisser un avis sur votre page Google en un clic.",
    "features.analytics.title": "Analytics en temps r\u00e9el",
    "features.analytics.desc": "Suivez l'\u00e9volution de vos avis, taux de satisfaction et scans de QR codes.",
    "features.feedback.title": "Feedback priv\u00e9",
    "features.feedback.desc": "Recevez les retours n\u00e9gatifs en priv\u00e9 et r\u00e9pondez directement \u00e0 vos clients.",
    "features.multi.title": "Multi-\u00e9tablissements",
    "features.multi.desc": "G\u00e9rez plusieurs \u00e9tablissements depuis un seul tableau de bord.",

    // Pricing
    "pricing.title": "Combien \u00e7a co\u00fbte ?",
    "pricing.subtitle": "Pendant que vos concurrents paient 200\u20ac/mois pour la m\u00eame chose...",
    "pricing.price": "0\u20ac",
    "pricing.forever": "Gratuit. Pour toujours. Sans pi\u00e8ge.",
    "pricing.f1": "\u00c9tablissements illimit\u00e9s",
    "pricing.f2": "QR codes illimit\u00e9s",
    "pricing.f3": "Collecte d'avis illimit\u00e9e",
    "pricing.f4": "Dashboard analytics complet",
    "pricing.f5": "Lien direct vers Google Avis",
    "pricing.f6": "Feedback priv\u00e9",
    "pricing.f7": "Support par email",
    "pricing.cta": "Cr\u00e9er mon compte gratuit",

    // Visual Demo
    "demo.title": "Voyez le r\u00e9sultat concret",
    "demo.subtitle": "3 \u00e9tapes, 30 secondes, un avis Google en plus",
    "demo.step1": "Le client scanne",
    "demo.step1_desc": "Placez le QR code sur vos tables ou comptoir",
    "demo.phone_title": "Comment \u00e9tait votre exp\u00e9rience ?",
    "demo.phone_desc": "Le client note en un clic",
    "demo.google_review": "Avis Google publi\u00e9",
    "demo.step3": "Le client choisit",
    "demo.step3_desc": "Avis Google ou retour priv\u00e9 : le client d\u00e9cide",

    // Business types
    "types.title": "Pour tous les types de commerces",
    "types.subtitle": "AvisFlow s'adapte \u00e0 votre activit\u00e9",
    "types.restaurant": "Restaurant",
    "types.salon": "Salon de coiffure",
    "types.garage": "Garage auto",
    "types.shop": "Boutique",
    "types.health": "Sant\u00e9",
    "types.hotel": "H\u00f4tel",

    // CTA
    "cta.title": "Chaque jour sans AvisFlow, vous perdez des avis Google",
    "cta.subtitle": "Vos concurrents collectent d\u00e9j\u00e0 des avis. Ne restez pas \u00e0 la tra\u00eene.",
    "cta.button": "Cr\u00e9er mon compte gratuit",

    // Footer
    "footer.rights": "Tous droits r\u00e9serv\u00e9s.",

    // Auth
    "auth.login": "Connexion",
    "auth.login.subtitle": "Acc\u00e9dez \u00e0 votre tableau de bord",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.submit.login": "Se connecter",
    "auth.no_account": "Pas encore de compte ?",
    "auth.create_account": "Cr\u00e9er un compte",
    "auth.register": "Cr\u00e9er un compte",
    "auth.register.subtitle": "Commencez \u00e0 collecter des avis gratuitement",
    "auth.fullname": "Nom complet",
    "auth.submit.register": "Cr\u00e9er mon compte",
    "auth.has_account": "D\u00e9j\u00e0 un compte ?",
    "auth.go_login": "Se connecter",
    "auth.password.min": "Min. 6 caract\u00e8res",
    "auth.success.login": "Connexion r\u00e9ussie !",
    "auth.success.register": "Compte cr\u00e9\u00e9 avec succ\u00e8s !",
    "auth.error.login": "Erreur de connexion",
    "auth.error.register": "Erreur lors de l'inscription",
    "auth.error.password": "Le mot de passe doit contenir au moins 6 caract\u00e8res",

    // Email verification
    "auth.verify.title": "V\u00e9rifiez votre email",
    "auth.verify.desc": "Un email de confirmation a \u00e9t\u00e9 envoy\u00e9 \u00e0 :",
    "auth.verify.spam": "V\u00e9rifiez aussi vos spams si vous ne trouvez pas l'email.",
    "auth.verify.resend": "Renvoyer l'email",
    "auth.verify.resent": "Email de v\u00e9rification renvoy\u00e9 !",
    "auth.verify.sent": "Email de v\u00e9rification envoy\u00e9 ! V\u00e9rifiez votre bo\u00eete de r\u00e9ception.",
    "auth.verify.required": "Email non v\u00e9rifi\u00e9",
    "auth.verify.check_inbox": "V\u00e9rifiez votre bo\u00eete de r\u00e9ception et cliquez sur le lien de confirmation.",
    "auth.verify.success": "Email v\u00e9rifi\u00e9 ! Vous pouvez maintenant vous connecter.",
    "auth.verify.error": "Lien de v\u00e9rification invalide ou expir\u00e9.",
    "auth.verify.already": "Cet email est d\u00e9j\u00e0 v\u00e9rifi\u00e9.",

    // Dashboard
    "dash.title": "Mes \u00e9tablissements",
    "dash.subtitle": "G\u00e9rez vos \u00e9tablissements et collectez des avis",
    "dash.add": "Ajouter",
    "dash.new": "Nouvel \u00e9tablissement",
    "dash.name": "Nom de l'\u00e9tablissement",
    "dash.category": "Cat\u00e9gorie",
    "dash.category.placeholder": "Restaurant, Coiffeur, etc.",
    "dash.address": "Adresse",
    "dash.phone": "T\u00e9l\u00e9phone",
    "dash.google_url": "Lien avis Google",
    "dash.threshold": "Seuil positif (\u00e9toiles)",
    "dash.threshold.help": "Indicateur interne (pas de redirection automatique)",
    "dash.delete": "Supprimer l'\u00e9tablissement",
    "dash.delete.confirm": "\u00cates-vous s\u00fbr de vouloir supprimer cet \u00e9tablissement ? Cette action est irr\u00e9versible.",
    "dash.deleted": "\u00c9tablissement supprim\u00e9 !",
    "dash.create": "Cr\u00e9er l'\u00e9tablissement",
    "dash.none.title": "Aucun \u00e9tablissement",
    "dash.none.desc": "Cr\u00e9ez votre premier \u00e9tablissement pour commencer \u00e0 collecter des avis",
    "dash.none.button": "Ajouter un \u00e9tablissement",
    "dash.active": "Actif",
    "dash.inactive": "Inactif",
    "dash.qrcodes": "QR Codes",
    "dash.analytics": "Analytics",
    "dash.created": "\u00c9tablissement cr\u00e9\u00e9 !",
    "dash.error.load": "Erreur lors du chargement",
    "dash.error.create": "Erreur lors de la cr\u00e9ation",

    // Review page
    "review.experience": "Comment \u00e9tait votre exp\u00e9rience ?",
    "review.redirect": "Merci ! Redirection vers Google...",
    "review.error": "Erreur, veuillez r\u00e9essayer",
    "review.thanks": "Merci pour votre retour !",
    "review.recorded": "Votre avis a bien \u00e9t\u00e9 enregistr\u00e9.",
    "review.improves": "prend en compte tous les retours pour s\u2019am\u00e9liorer.",
    "review.not_found": "\u00c9tablissement introuvable",
    "review.feedback": "Dites-nous comment nous am\u00e9liorer",
    "review.comment": "Votre commentaire...",
    "review.name": "Nom (optionnel)",
    "review.email_opt": "Email (optionnel)",
    "review.send": "Envoyer mon avis",
    "review.sorry3": "Merci pour votre retour",
    "review.sorry2": "Nous sommes d\u00e9sol\u00e9s...",
    "review.sorry1": "Nous sommes navr\u00e9s de votre exp\u00e9rience",
    "review.powered": "Propuls\u00e9 par",
    "review.share": "Partagez votre exp\u00e9rience",
    "review.select": "Veuillez s\u00e9lectionner une note",
    "review.send_error": "Erreur lors de l'envoi",
    "review.thanks_google": "Merci ! Vous allez \u00eatre redirig\u00e9 vers Google...",
    "review.leave_google": "Laisser un avis sur Google",
    "review.send_private": "Envoyer un retour priv\u00e9",
    "review.add_comment": "Ajouter un commentaire (optionnel)",
    "review.also_google": "Laisser aussi un avis Google",

    // Blog
    "blog.title": "Blog",
    "blog.subtitle": "Conseils et astuces pour booster vos avis Google",
    "blog.read": "Lire l'article",
    "blog.back": "Retour au blog",
    "blog.empty": "Aucun article pour le moment",
    "blog.empty.desc": "Revenez bient\u00f4t pour d\u00e9couvrir nos conseils !",
    "blog.share": "Partager",
    "blog.cta": "Commencez \u00e0 collecter des avis",
    "blog.cta.button": "Cr\u00e9er mon compte gratuit",

    // Admin Blog
    "admin.blog.title": "Articles de blog",
    "admin.blog.new": "Nouvel article",
    "admin.blog.form.title": "Titre",
    "admin.blog.form.content": "Contenu (HTML)",
    "admin.blog.form.excerpt": "Extrait",
    "admin.blog.form.cover": "URL image de couverture",
    "admin.blog.form.lang": "Langue",
    "admin.blog.form.published": "Publi\u00e9",
    "admin.blog.form.draft": "Brouillon",
    "admin.blog.save": "Enregistrer",
    "admin.blog.cancel": "Annuler",
    "admin.blog.edit": "Modifier",
    "admin.blog.delete": "Supprimer",
    "admin.blog.empty": "Aucun article",
    "admin.blog.empty.desc": "Cr\u00e9ez votre premier article de blog pour le SEO",
    "admin.blog.created": "Article cr\u00e9\u00e9 !",
    "admin.blog.updated": "Article mis \u00e0 jour !",
    "admin.blog.deleted": "Article supprim\u00e9 !",
    "admin.blog.error": "Erreur",

    // Admin Ads
    "admin.ads.title": "Publicit\u00e9s",
    "admin.ads.new": "Nouvelle publicit\u00e9",
    "admin.ads.form.title": "Titre",
    "admin.ads.form.image": "URL de l'image",
    "admin.ads.form.link": "URL du lien",
    "admin.ads.form.position": "Emplacement",
    "admin.ads.form.active": "Active",
    "admin.ads.positions.home_banner": "Banni\u00e8re accueil (haut)",
    "admin.ads.positions.home_middle": "Accueil (milieu)",
    "admin.ads.positions.home_bottom": "Accueil (bas)",
    "admin.ads.created": "Publicit\u00e9 cr\u00e9\u00e9e !",
    "admin.ads.updated": "Publicit\u00e9 mise \u00e0 jour !",
    "admin.ads.deleted": "Publicit\u00e9 supprim\u00e9e !",
    "admin.ads.empty": "Aucune publicit\u00e9",
    "admin.ads.empty.desc": "Ajoutez des publicit\u00e9s pour g\u00e9n\u00e9rer des revenus",
    "admin.ads.error": "Erreur",
    "admin.ads.activated": "Publicit\u00e9 activ\u00e9e",
    "admin.ads.deactivated": "Publicit\u00e9 d\u00e9sactiv\u00e9e",

    // Structured feedback
    "review.satisfied": "Satisfait",
    "review.not_satisfied": "Pas satisfait",
    "review.quick_feedback": "Qu'est-ce qui pourrait \u00eatre am\u00e9lior\u00e9 ?",
    "review.tag.attente": "Temps d'attente",
    "review.tag.accueil": "Accueil",
    "review.tag.produit": "Qualit\u00e9 produit",
    "review.tag.proprete": "Propret\u00e9",
    "review.tag.prix": "Prix",
    "review.tag.autre": "Autre",
    "review.score.satisfaction": "Satisfaction",
    "review.score.rapidite": "Rapidit\u00e9",
    "review.score.service": "Service",
    "review.score.qualite_prix": "Qualit\u00e9/Prix",
    "review.rate_details": "D\u00e9taillez votre exp\u00e9rience (optionnel)",
    "review.auto_response": "R\u00e9ponse de l'\u00e9tablissement",

    // Analytics insights
    "insights.title": "Analyse intelligente",
    "insights.tags": "Retours fr\u00e9quents",
    "insights.scores": "Scores d\u00e9taill\u00e9s",
    "insights.trend": "Tendance",
    "insights.trend.up": "En hausse",
    "insights.trend.down": "En baisse",
    "insights.trend.stable": "Stable",
    "insights.weekly_change": "Variation hebdo",
    "insights.top_issues": "Probl\u00e8mes fr\u00e9quents",
    "insights.keywords": "Mots cl\u00e9s",
    "insights.comparison": "Comparaison locale",
    "insights.better_than": "Mieux que {pct}% des \u00e9tablissements similaires",
    "insights.no_data": "Pas encore assez de donn\u00e9es",
    "insights.timeline": "\u00c9volution dans le temps",

    // Auto-responses
    "auto.title": "R\u00e9ponses automatiques",
    "auto.add": "Ajouter une r\u00e9ponse",
    "auto.trigger": "D\u00e9clencheur",
    "auto.trigger.positive": "Avis positif (4-5\u2b50)",
    "auto.trigger.negative": "Avis n\u00e9gatif (1-3\u2b50)",
    "auto.trigger.all": "Tous les avis",
    "auto.message": "Message",
    "auto.created": "R\u00e9ponse cr\u00e9\u00e9e !",
    "auto.deleted": "R\u00e9ponse supprim\u00e9e !",
    "auto.empty": "Aucune r\u00e9ponse automatique",
    "auto.empty.desc": "Ajoutez des r\u00e9ponses automatiques pour r\u00e9pondre aux avis",

    // Alerts
    "alerts.title": "Alertes",
    "alerts.empty": "Aucune alerte",
    "alerts.mark_read": "Marquer comme lue",
    "alerts.negative_spike": "Pic n\u00e9gatif",
    "alerts.rating_drop": "Baisse de note",

    // Export
    "export.title": "Exporter les donn\u00e9es",
    "export.button": "T\u00e9l\u00e9charger (JSON)",
    "export.success": "Donn\u00e9es export\u00e9es !",

    // Directory
    "directory.title": "Annuaire des \u00e9tablissements",
    "directory.subtitle": "D\u00e9couvrez les \u00e9tablissements inscrits sur AvisFlow",
    "directory.search": "Rechercher un \u00e9tablissement...",
    "directory.all_categories": "Toutes les cat\u00e9gories",
    "directory.no_results": "Aucun \u00e9tablissement trouv\u00e9",
    "directory.reviews": "avis",
    "directory.see_reviews": "Voir les avis",
    "nav.directory": "Annuaire",
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
    "hero.title1": "+30 Google reviews in 30 days. ",
    "hero.title2": "More customers, effortlessly.",
    "hero.subtitle": "A QR code at the counter. Your customer scans it, leaves a Google review in 30 seconds. You climb the rankings, you attract new customers. It's that simple.",
    "hero.cta": "Create my free account",
    "hero.generate_qr": "Get my first reviews \u2192",
    "hero.demo": "See how it works",
    "hero.nocard": "Free forever",
    "hero.quick": "Ready in 2 minutes",
    "hero.free": "No tech skills needed",
    "hero.badge_reviews": "+30",
    "hero.badge_reviews_label": "this month",
    "hero.badge_rating": "4.8",
    "proof.title": "Real results",
    "proof.subtitle": "The numbers speak for themselves",
    "proof.stat1": "+120",
    "proof.stat1_label": "Google reviews generated",
    "proof.stat2": "4.8\u2b50",
    "proof.stat2_label": "average customer rating",
    "proof.stat3": "+35%",
    "proof.stat3_label": "more customers",
    "proof.stat4": "30s",
    "proof.stat4_label": "to leave a review",
    "proof.disclaimer": "Results observed with our first users",
    "urgency.title": "While you hesitate...",
    "urgency.line1": "Your competitors are collecting Google reviews",
    "urgency.line2": "Every lost review = one less customer",
    "urgency.line3": "Businesses with 50+ reviews get 3x more clicks",
    "urgency.cta": "Start now \u2014 it's free",

    // Stats
    "stats.users": "Registered users",
    "stats.pages": "Pages created",
    "stats.reviews": "Reviews collected",
    "stats.avg": "Average rating",
    "stats.google": "Redirected to Google",

    // How it works - SALES oriented
    "how.title": "How to get +30 reviews in 3 steps",
    "how.subtitle": "No expertise needed. Stick a QR code, reap the results.",
    "how.step1.title": "Stick your QR code at the counter",
    "how.step1.desc": "Business card, sticker at the register, table tent... Your customers scan it in 2 seconds.",
    "how.step1.result": "100% of your customers see the QR code",
    "how.step2.title": "Customer gives feedback in 5 seconds",
    "how.step2.desc": "Ultra-simple interface: 5 stars, one click, done. No app to download, no account to create.",
    "how.step2.result": "3x participation rate vs classic forms",
    "how.step3.title": "Your Google reviews skyrocket",
    "how.step3.desc": "The customer freely chooses: public Google review or private feedback to help you improve. Result: more visibility, more customers.",
    "how.step3.result": "+30 Google reviews in 30 days on average",

    // Before/After results
    "results.title": "The real impact on your business",
    "results.subtitle": "Here's what changes when you activate AvisFlow",
    "results.before": "BEFORE AvisFlow",
    "results.after": "AFTER 30 days",
    "results.reviews_before": "12 reviews",
    "results.reviews_after": "68 reviews",
    "results.reviews_label": "Google Reviews",
    "results.rating_before": "3.9",
    "results.rating_after": "4.7",
    "results.rating_label": "Average Rating",
    "results.visibility_before": "Page 3",
    "results.visibility_after": "Top 3",
    "results.visibility_label": "Google Maps Position",
    "results.disclaimer": "Example based on results observed with our first users",
    "results.cta": "Get the same results \u2192",

    // Features
    "features.title": "Why pros choose AvisFlow",
    "features.subtitle": "Every feature is designed for one goal: attract more customers",
    "features.qr.title": "Custom QR Codes",
    "features.qr.desc": "Generate QR codes with your branding. Print them or display on screen.",
    "features.shield.title": "Your secret weapon: private feedback",
    "features.shield.desc": "Negative feedback stays private and helps you improve. Positive feedback becomes 5\u2b50 Google reviews.",
    "features.redirect.title": "Direct link to Google",
    "features.redirect.desc": "Your customers can easily leave a review on your Google page in one click.",
    "features.analytics.title": "Real-time analytics",
    "features.analytics.desc": "Track your reviews, satisfaction rate, and QR code scans.",
    "features.feedback.title": "Private feedback",
    "features.feedback.desc": "Receive negative reviews privately and respond directly to your customers.",
    "features.multi.title": "Multi-location",
    "features.multi.desc": "Manage multiple locations from a single dashboard.",

    // Pricing
    "pricing.title": "How much does it cost?",
    "pricing.subtitle": "While your competitors pay \u20ac200/month for the same thing...",
    "pricing.price": "$0",
    "pricing.forever": "Free. Forever. No catch.",
    "pricing.f1": "Unlimited locations",
    "pricing.f2": "Unlimited QR codes",
    "pricing.f3": "Unlimited review collection",
    "pricing.f4": "Full analytics dashboard",
    "pricing.f5": "Direct link to Google Reviews",
    "pricing.f6": "Private feedback",
    "pricing.f7": "Email support",
    "pricing.cta": "Create my free account",

    // Visual Demo
    "demo.title": "See the real result",
    "demo.subtitle": "3 steps, 30 seconds, one more Google review",
    "demo.step1": "Customer scans",
    "demo.step1_desc": "Place the QR code on your tables or counter",
    "demo.phone_title": "How was your experience?",
    "demo.phone_desc": "Customer rates in one click",
    "demo.google_review": "Google review posted",
    "demo.step3": "Customer chooses",
    "demo.step3_desc": "Google review or private feedback: the customer decides",

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
    "cta.title": "Every day without AvisFlow, you lose Google reviews",
    "cta.subtitle": "Your competitors are already collecting reviews. Don't fall behind.",
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
    "dash.threshold.help": "Internal indicator (no automatic redirect)",
    "dash.delete": "Delete location",
    "dash.delete.confirm": "Are you sure you want to delete this location? This action cannot be undone.",
    "dash.deleted": "Location deleted!",
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
    "review.share": "Share your experience",
    "review.select": "Please select a rating",
    "review.send_error": "Error while sending",
    "review.thanks_google": "Thank you! Redirecting to Google...",
    "review.leave_google": "Leave a Google review",
    "review.send_private": "Send private feedback",
    "review.add_comment": "Add a comment (optional)",
    "review.also_google": "Also leave a Google review",

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

    // Structured feedback
    "review.satisfied": "Satisfied",
    "review.not_satisfied": "Not satisfied",
    "review.quick_feedback": "What could be improved?",
    "review.tag.attente": "Wait time",
    "review.tag.accueil": "Welcome",
    "review.tag.produit": "Product quality",
    "review.tag.proprete": "Cleanliness",
    "review.tag.prix": "Price",
    "review.tag.autre": "Other",
    "review.score.satisfaction": "Satisfaction",
    "review.score.rapidite": "Speed",
    "review.score.service": "Service",
    "review.score.qualite_prix": "Value",
    "review.rate_details": "Rate details (optional)",
    "review.auto_response": "Response from business",

    // Analytics insights
    "insights.title": "Smart Analytics",
    "insights.tags": "Common feedback",
    "insights.scores": "Detailed scores",
    "insights.trend": "Trend",
    "insights.trend.up": "Going up",
    "insights.trend.down": "Going down",
    "insights.trend.stable": "Stable",
    "insights.weekly_change": "Weekly change",
    "insights.top_issues": "Top issues",
    "insights.keywords": "Keywords",
    "insights.comparison": "Local comparison",
    "insights.better_than": "Better than {pct}% of similar businesses",
    "insights.no_data": "Not enough data yet",
    "insights.timeline": "Timeline",

    // Auto-responses
    "auto.title": "Auto-responses",
    "auto.add": "Add response",
    "auto.trigger": "Trigger",
    "auto.trigger.positive": "Positive review (4-5\u2b50)",
    "auto.trigger.negative": "Negative review (1-3\u2b50)",
    "auto.trigger.all": "All reviews",
    "auto.message": "Message",
    "auto.created": "Response created!",
    "auto.deleted": "Response deleted!",
    "auto.empty": "No auto-responses",
    "auto.empty.desc": "Add auto-responses to reply to reviews",

    // Alerts
    "alerts.title": "Alerts",
    "alerts.empty": "No alerts",
    "alerts.mark_read": "Mark as read",
    "alerts.negative_spike": "Negative spike",
    "alerts.rating_drop": "Rating drop",

    // Export
    "export.title": "Export data",
    "export.button": "Download (JSON)",
    "export.success": "Data exported!",

    // Directory
    "directory.title": "Business Directory",
    "directory.subtitle": "Discover businesses registered on AvisFlow",
    "directory.search": "Search a business...",
    "directory.all_categories": "All categories",
    "directory.no_results": "No businesses found",
    "directory.reviews": "reviews",
    "directory.see_reviews": "See reviews",
    "nav.directory": "Directory",
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
    // Default to French — target audience is France/Belgium/Switzerland/Quebec
    return "fr";
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
      title={lang === "fr" ? "Switch to English" : "Passer en fran\u00e7ais"}
    >
      <span className="text-base">{lang === "fr" ? "\uD83C\uDDEC\uD83C\uDDE7" : "\uD83C\uDDEB\uD83C\uDDF7"}</span>
      <span>{lang === "fr" ? "EN" : "FR"}</span>
    </button>
  );
}
