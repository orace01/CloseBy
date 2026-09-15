// Sample data used until the agent backend exists. Every name, address and
// figure here is fictitious.
import type {
  Account,
  AdminIncident,
  Campaign,
  DraftEmail,
  Fact,
  MailIdentity,
  Plan,
  Prospect,
} from "./types";

const COLLECTED_AT = "2026-09-14";

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceEur: 29,
    credits: 150,
    tagline: "Pour tester et lancer vos premières campagnes",
    features: ["150 crédits par mois", "1 boîte mail connectée", "Faits sourcés et relecture", "Liste d’exclusion"],
  },
  {
    id: "pro",
    name: "Pro",
    priceEur: 79,
    credits: 600,
    tagline: "Pour prospecter chaque semaine",
    features: ["600 crédits par mois", "Plusieurs boîtes mail", "Relances validées par vous", "Suivi des réponses"],
  },
  {
    id: "agency",
    name: "Agency",
    priceEur: 199,
    credits: 2000,
    tagline: "Pour les agences et les équipes",
    features: ["2 000 crédits par mois", "Plusieurs utilisateurs", "Campagnes séparées par client", "Suivi des réponses"],
  },
];

export const account: Account = {
  name: "Camille Roux",
  company: "Studio Roux",
  email: "camille@studioroux.fr",
  initials: "CR",
  planId: "starter",
  credits: { balance: 112, renewsOn: "2026-10-01" },
  excludedCount: 14,
  language: "Français",
  tone: "Professionnel",
};

export const campaigns: Campaign[] = [
  {
    id: "restaurants-lyon",
    name: "Restaurants autour de Lyon",
    offer: "Création de site web",
    target: "Restaurants",
    zone: "Lyon",
    radiusKm: 15,
    maxProspects: 50,
    tone: "Professionnel",
    status: "running",
    progress: { found: 142, sitesRead: 97, drafted: 12 },
    sent: 8,
    replies: 2,
  },
  {
    id: "coiffeurs-villeurbanne",
    name: "Coiffeurs à Villeurbanne",
    offer: "Création de site web",
    target: "Salons de coiffure",
    zone: "Villeurbanne",
    radiusKm: 5,
    maxProspects: 30,
    tone: "Chaleureux",
    status: "done",
    progress: { found: 64, sitesRead: 64, drafted: 30 },
    sent: 24,
    replies: 3,
  },
  {
    id: "fleuristes-lyon",
    name: "Fleuristes de Lyon",
    offer: "Création de site web",
    target: "Fleuristes",
    zone: "Lyon",
    radiusKm: 10,
    maxProspects: 30,
    tone: "Professionnel",
    status: "paused",
    progress: { found: 38, sitesRead: 22, drafted: 16 },
    sent: 10,
    replies: 0,
  },
];

const PITCH =
  "Je crée des sites pour les restaurants lyonnais, avec menu modifiable et réservation en ligne. Quinze minutes pour en parler ?";

function fact(id: string, text: string, source: string): Fact {
  return { id, text, source, collectedAt: COLLECTED_AT };
}

function draft(subject: string, first: [string, string], second: [string, string]): DraftEmail {
  return {
    subject,
    paragraphs: [
      [{ text: "Bonjour," }],
      [
        { text: "J’ai vu que " },
        { text: first[0], factId: first[1] },
        { text: " et que " },
        { text: second[0], factId: second[1] },
        { text: "." },
      ],
      [{ text: PITCH }],
      [{ text: "Camille Roux" }],
    ],
  };
}

export const prospects: Prospect[] = [
  {
    id: "bistrot-margaux",
    campaignId: "restaurants-lyon",
    name: "Bistrot Margaux",
    activity: "Restaurant",
    city: "Lyon 6e",
    distanceKm: 1.2,
    website: "bistrot-margaux.fr",
    email: "contact@bistrot-margaux.fr",
    emailSource: "page Contact",
    nafCode: "56.10A",
    source: "Google Maps",
    collectedAt: COLLECTED_AT,
    status: "to_review",
    facts: [
      fact("bm-menu", "Le menu du midi n’est publié que sur Instagram.", "bistrot-margaux.fr"),
      fact("bm-resa", "Les réservations se font uniquement par téléphone.", "bistrot-margaux.fr/contact"),
      fact("bm-mobile", "Le site s’affiche mal sur mobile.", "test d’affichage mobile"),
    ],
    draft: draft(
      "Votre menu du midi, directement sur votre site ?",
      ["votre menu du midi n’est publié que sur Instagram", "bm-menu"],
      ["les réservations se font uniquement par téléphone", "bm-resa"],
    ),
  },
  {
    id: "le-petit-comptoir",
    campaignId: "restaurants-lyon",
    name: "Le Petit Comptoir",
    activity: "Bistrot",
    city: "Lyon 1er",
    distanceKm: 1.6,
    website: "lepetitcomptoir-lyon.fr",
    email: "bonjour@lepetitcomptoir-lyon.fr",
    emailSource: "pied de page",
    nafCode: "56.10A",
    source: "Google Maps",
    collectedAt: COLLECTED_AT,
    status: "approved",
    facts: [
      fact("pc-resa", "Le site ne propose pas de réservation en ligne.", "lepetitcomptoir-lyon.fr"),
      fact("pc-hours", "Les horaires n’apparaissent pas sur la page d’accueil.", "lepetitcomptoir-lyon.fr"),
    ],
    draft: draft(
      "Réserver chez vous en deux clics ?",
      ["votre site ne propose pas de réservation en ligne", "pc-resa"],
      ["vos horaires n’apparaissent pas sur l’accueil", "pc-hours"],
    ),
  },
  {
    id: "la-table-de-juliette",
    campaignId: "restaurants-lyon",
    name: "La Table de Juliette",
    activity: "Restaurant",
    city: "Lyon 2e",
    distanceKm: 2.1,
    website: "latabledejuliette.fr",
    email: "contact@latabledejuliette.fr",
    emailSource: "page Contact",
    nafCode: "56.10A",
    source: "Google Maps",
    collectedAt: COLLECTED_AT,
    status: "to_review",
    facts: [
      fact("tj-pdf", "La carte n’est disponible qu’en PDF.", "latabledejuliette.fr/carte"),
      fact("tj-mobile", "Le site s’affiche mal sur mobile.", "test d’affichage mobile"),
    ],
    draft: draft(
      "Une carte lisible sur téléphone ?",
      ["votre carte n’existe qu’en PDF", "tj-pdf"],
      ["le site s’affiche mal sur mobile", "tj-mobile"],
    ),
  },
  {
    id: "sushi-kaze",
    campaignId: "restaurants-lyon",
    name: "Sushi Kaze",
    activity: "Restaurant japonais",
    city: "Lyon 7e",
    distanceKm: 2.8,
    website: "sushikaze.fr",
    email: "commande@sushikaze.fr",
    emailSource: "page Contact",
    nafCode: "56.10A",
    source: "Google Maps",
    collectedAt: COLLECTED_AT,
    status: "to_review",
    facts: [
      fact("sk-phone", "Les commandes à emporter se font par téléphone.", "sushikaze.fr"),
      fact("sk-menu", "Le site n’a pas de page menu.", "sushikaze.fr"),
    ],
    draft: draft(
      "Vos commandes à emporter en ligne ?",
      ["les commandes à emporter se font par téléphone", "sk-phone"],
      ["votre site n’a pas de page menu", "sk-menu"],
    ),
  },
  {
    id: "pizzeria-il-forno",
    campaignId: "restaurants-lyon",
    name: "Pizzeria Il Forno",
    activity: "Pizzeria",
    city: "Villeurbanne",
    distanceKm: 3.4,
    website: "ilforno-villeurbanne.fr",
    email: "ciao@ilforno-villeurbanne.fr",
    emailSource: "page Contact",
    nafCode: "56.10C",
    source: "Google Maps",
    collectedAt: COLLECTED_AT,
    status: "sent",
    facts: [
      fact("if-order", "Pas de commande en ligne sur le site.", "ilforno-villeurbanne.fr"),
      fact("if-hours", "Les horaires affichés datent de l’an dernier.", "ilforno-villeurbanne.fr"),
    ],
    draft: draft(
      "Vos pizzas commandées en ligne ?",
      ["votre site ne permet pas de commander en ligne", "if-order"],
      ["les horaires affichés datent de l’an dernier", "if-hours"],
    ),
  },
  {
    id: "maison-berthe",
    campaignId: "restaurants-lyon",
    name: "Maison Berthe",
    activity: "Traiteur",
    city: "Caluire",
    distanceKm: 4,
    website: "maison-berthe.fr",
    email: "contact@maison-berthe.fr",
    emailSource: "page Contact",
    nafCode: "56.21Z",
    source: "Google Maps",
    collectedAt: COLLECTED_AT,
    status: "rejected",
    facts: [
      fact("mb-offers", "Les formules ne sont pas détaillées sur le site.", "maison-berthe.fr"),
      fact("mb-form", "Le formulaire de contact renvoie une erreur.", "maison-berthe.fr/contact"),
    ],
    draft: draft(
      "Vos plateaux traiteur en ligne ?",
      ["vos formules ne sont pas détaillées sur le site", "mb-offers"],
      ["le formulaire de contact renvoie une erreur", "mb-form"],
    ),
  },
  {
    id: "chez-lulu",
    campaignId: "restaurants-lyon",
    name: "Chez Lulu",
    activity: "Bouchon lyonnais",
    city: "Lyon 5e",
    distanceKm: 4.3,
    nafCode: "56.10A",
    source: "Google Maps",
    collectedAt: COLLECTED_AT,
    status: "no_email",
    facts: [fact("cl-site", "Aucun site web trouvé.", "fiche établissement")],
  },
  {
    id: "brasserie-du-parc",
    campaignId: "restaurants-lyon",
    name: "Brasserie du Parc",
    activity: "Brasserie",
    city: "Lyon 6e",
    distanceKm: 4.9,
    website: "brasseriduparc.fr",
    email: "contact@brasseriduparc.fr",
    emailSource: "page Contact",
    nafCode: "56.10A",
    source: "Google Maps",
    collectedAt: COLLECTED_AT,
    status: "replied",
    facts: [
      fact("bp-events", "La brasserie accueille des groupes, sans formulaire de demande.", "brasseriduparc.fr"),
      fact("bp-menu", "La carte n’a pas été mise à jour depuis le printemps.", "brasseriduparc.fr/carte"),
    ],
    draft: draft(
      "Vos demandes de groupes, simplifiées ?",
      ["vous accueillez des groupes sans formulaire de demande", "bp-events"],
      ["votre carte date du printemps", "bp-menu"],
    ),
  },
  {
    id: "le-kiosque",
    campaignId: "restaurants-lyon",
    name: "Le Kiosque",
    activity: "Café",
    city: "Lyon 4e",
    distanceKm: 5.2,
    nafCode: "56.30Z",
    source: "Google Maps",
    collectedAt: COLLECTED_AT,
    status: "no_email",
    facts: [],
  },
];

export const mailboxes: MailIdentity[] = [
  { id: "gmail", provider: "gmail", label: "Gmail", email: "camille@studioroux.fr", connected: true },
  { id: "outlook", provider: "outlook", label: "Outlook", email: "c.roux@outlook.fr", connected: false },
];

export const adminStats = {
  users: 1284,
  activeCampaigns: 96,
  sendsToday: 3412,
};

export const adminIncidents: AdminIncident[] = [
  { id: "inc-1", kind: "Job bloqué", critical: true, label: "Lecture des sites · Studio Roux", when: "il y a 12 min", action: "Relancer" },
  { id: "inc-2", kind: "Quota", critical: false, label: "Google Places à 92 %", when: "il y a 1 h", action: "Voir" },
  { id: "inc-3", kind: "Abus", critical: true, label: "420 envois refusés · compte 8841", when: "hier", action: "Suspendre" },
];
