// Offers shown on the landing page and the credits screen. Prices are provisional.
import type { Plan } from "./types";

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
