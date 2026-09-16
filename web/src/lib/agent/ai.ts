import "server-only";
import { z } from "zod";
import type { TextSegment } from "@/lib/types";
import { generateJson, generateJsonWithModel, searchWithGoogle } from "./gemini";
import { ALLOWED_TAG_KEYS } from "./places";
import { emailsIn, fetchText, hasMailServer, htmlToText, MAX_PAGE_CHARS, type Page } from "./site";

// Every task the agent gives to Gemini. Prompts are in French because the
// campaigns and the emails are.

const RULES = `Tu travailles pour CloseBy, un outil de prospection B2B locale et responsable.
Tu n'inventes jamais d'information. Tu réponds uniquement avec le JSON demandé.`;

/* ---------- Brief ---------- */

export interface Brief {
  offer: string;
  target: string;
  zone: string;
}

export async function analyzeBrief(brief: string): Promise<Brief> {
  return generateJson({
    system: RULES,
    prompt: `Un utilisateur décrit ce qu'il vend et à qui. Extrais :
- offer : ce qu'il vend, en quelques mots (ex. « Création de site web »)
- target : le type d'entreprise ciblé, au pluriel (ex. « Restaurants »)
- zone : le nom de la ville ou du secteur seul, sans préposition (ex. « Lyon », pas « autour de Lyon »). Chaîne vide si absent.

Texte : """${brief.slice(0, 1000)}"""`,
    schema: {
      type: "object",
      properties: { offer: { type: "string" }, target: { type: "string" }, zone: { type: "string" } },
      required: ["offer", "target", "zone"],
    },
    validate: z.object({ offer: z.string().max(200), target: z.string().max(200), zone: z.string().max(200) }),
    temperature: 0.1,
  });
}

/* ---------- Search tags ---------- */

export async function chooseSearchTags(target: string): Promise<string[]> {
  const result = await generateJson({
    system: RULES,
    prompt: `Traduis cette cible de prospection en tags OpenStreetMap permettant de trouver ces établissements.
Clés autorisées : ${ALLOWED_TAG_KEYS.join(", ")}.
Donne de 1 à 6 tags au format clé=valeur, en utilisant uniquement des valeurs réellement répandues dans OpenStreetMap
(ex. amenity=restaurant, shop=hairdresser, craft=plumber, office=lawyer, healthcare=dentist, leisure=fitness_centre).

Cible : """${target.slice(0, 200)}"""`,
    schema: {
      type: "object",
      properties: { tags: { type: "array", items: { type: "string" } } },
      required: ["tags"],
    },
    validate: z.object({ tags: z.array(z.string()) }),
    temperature: 0,
  });
  return [
    ...new Set(
      result.tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => {
          const [key, value] = tag.split("=");
          return ALLOWED_TAG_KEYS.includes(key) && /^[a-z0-9_;:-]+$/.test(value ?? "");
        }),
    ),
  ].slice(0, 6);
}

/* ---------- Facts ---------- */

export interface VerifiedFact {
  text: string;
  quote: string;
  source: string;
}

export interface ProspectAnalysis {
  relevance: number;
  activity: string;
  reason: string;
  facts: VerifiedFact[];
}

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function analyzeProspect({
  name,
  offer,
  target,
  pages,
}: {
  name: string;
  offer: string;
  target: string;
  pages: Page[];
}): Promise<ProspectAnalysis> {
  const corpus = pages.map((page, i) => `### Page ${i + 1} — ${page.url}\n${page.text}`).join("\n\n");

  const result = await generateJson({
    system: RULES,
    prompt: `Un utilisateur vend : « ${offer} ». Il cible : « ${target} ».
Voici des pages publiques sur l'entreprise « ${name} » (son site, sa fiche Google, d'autres pages du web).
Ne retiens que les informations qui concernent bien cette entreprise.

1. activity : l'activité de l'entreprise en 1 à 4 mots (ex. « Restaurant italien »).
2. relevance : de 0 à 100, à quel point cette entreprise correspond à la cible. Reste au-dessus de 50 si elle correspond
   à la cible, même si elle semble déjà équipée. Descends sous 40 seulement si ce n'est pas la cible
   (chaîne nationale, annuaire, activité différente) ou si l'offre lui est clairement inutile.
3. reason : une phrase qui justifie la note.
4. facts : de 0 à 5 faits précis et utiles pour personnaliser un e-mail de prospection
   (histoire, spécialité, actualité, projet, valeurs, chiffres…). Pour chaque fait :
   - text : le fait reformulé en une phrase courte
   - quote : la phrase EXACTE copiée mot pour mot depuis la page (15 à 200 caractères)
   - url : l'URL de la page où se trouve la citation
   N'utilise pas les coordonnées, horaires, mentions légales ou cookies comme faits.
   L'absence de site web est un fait utile si elle est indiquée sur la fiche.

${corpus}`,
    schema: {
      type: "object",
      properties: {
        activity: { type: "string" },
        relevance: { type: "integer" },
        reason: { type: "string" },
        facts: {
          type: "array",
          items: {
            type: "object",
            properties: { text: { type: "string" }, quote: { type: "string" }, url: { type: "string" } },
            required: ["text", "quote", "url"],
          },
        },
      },
      required: ["activity", "relevance", "reason", "facts"],
    },
    validate: z.object({
      activity: z.string(),
      relevance: z.number(),
      reason: z.string(),
      facts: z.array(z.object({ text: z.string(), quote: z.string(), url: z.string() })),
    }),
    temperature: 0.2,
  });

  // Keep only facts whose quote really appears on the cited page.
  const facts: VerifiedFact[] = [];
  for (const candidate of result.facts) {
    const quote = candidate.quote.trim();
    if (quote.length < 15 || !candidate.text.trim()) continue;
    const page = pages.find((p) => p.url === candidate.url) ?? pages.find((p) => normalize(p.text).includes(normalize(quote)));
    if (!page || !normalize(page.text).includes(normalize(quote))) continue;
    facts.push({ text: candidate.text.trim().slice(0, 300), quote: quote.slice(0, 300), source: page.url });
  }

  return {
    relevance: Math.max(0, Math.min(100, Math.round(result.relevance))),
    activity: result.activity.trim().slice(0, 60) || target,
    reason: result.reason.slice(0, 300),
    facts: facts.slice(0, 4),
  };
}

/* ---------- Draft ---------- */

export interface Draft {
  subject: string;
  paragraphs: TextSegment[][];
  model: string;
}

export async function draftEmail({
  prospectName,
  activity,
  facts,
  offer,
  tone,
  senderName,
  senderCompany,
}: {
  prospectName: string;
  activity: string;
  facts: Array<{ id: string; text: string; quote: string }>;
  offer: string;
  tone: string;
  senderName: string;
  senderCompany: string;
}): Promise<Draft> {
  const factList = facts.map((fact) => `- [${fact.id}] ${fact.text} (citation : « ${fact.quote} »)`).join("\n");

  const { value: result, model } = await generateJsonWithModel({
    system: `${RULES}
Tu rédiges des e-mails de prospection courts, sincères et naturels, en français, sans formules creuses ni ton publicitaire.`,
    prompt: `Rédige un premier e-mail de prospection.

Expéditeur : ${senderName}, ${senderCompany}
Offre : ${offer}
Ton : ${tone}
Destinataire : ${prospectName} (${activity})

Faits vérifiés sur le destinataire (identifiants entre crochets) :
${factList}

Règles :
- 80 à 140 mots, 3 ou 4 paragraphes, vouvoiement.
- Le premier paragraphe s'appuie sur un ou deux faits ci-dessus, de façon précise et naturelle.
- N'affirme rien sur le destinataire qui ne soit pas dans les faits, et ne suppose aucun problème de son côté.
- Présente l'expéditeur par son entreprise (« Chez ${senderCompany}, nous… ») : ne devine ni son genre ni son métier.
- Pas de promesse chiffrée, pas de superlatifs, pas de pièce jointe, pas de lien.
- Termine par une question simple (ex. proposer un court échange). N'écris ni formule de politesse finale ni signature : elles sont ajoutées automatiquement.
- Aucun texte à compléter entre crochets ou accolades.
- subject : objet court (moins de 60 caractères), sans majuscules inutiles ni point d'exclamation.
- Découpe chaque paragraphe en segments. Un segment qui reprend un fait porte son identifiant dans factId ; les autres ont factId vide.`,
    schema: {
      type: "object",
      properties: {
        subject: { type: "string" },
        paragraphs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              segments: {
                type: "array",
                items: {
                  type: "object",
                  properties: { text: { type: "string" }, factId: { type: "string" } },
                  required: ["text", "factId"],
                },
              },
            },
            required: ["segments"],
          },
        },
      },
      required: ["subject", "paragraphs"],
    },
    validate: z.object({
      subject: z.string().min(3).max(120),
      paragraphs: z
        .array(z.object({ segments: z.array(z.object({ text: z.string(), factId: z.string() })).min(1) }))
        .min(2)
        .max(6),
    }),
    temperature: 0.7,
  });

  const knownIds = new Set(facts.map((fact) => fact.id));
  const paragraphs = result.paragraphs
    .map((paragraph) =>
      paragraph.segments
        .filter((segment) => segment.text)
        .map((segment) => (knownIds.has(segment.factId) ? { text: segment.text, factId: segment.factId } : { text: segment.text })),
    )
    .filter((paragraph) => paragraph.length > 0);

  const plain = `${result.subject} ${paragraphs.flat().map((s) => s.text).join(" ")}`;
  if (/[[\]{}]/.test(plain)) throw new Error("Draft still contains placeholders.");
  if (!paragraphs.flat().some((segment) => segment.factId)) throw new Error("Draft does not use any verified fact.");

  paragraphs.push([{ text: `Cordialement,\n${senderName}\n${senderCompany}` }]);
  return { subject: result.subject.trim(), paragraphs, model };
}

/* ---------- Web search (businesses without a usable website) ---------- */

/** Directories and platforms: their own addresses are never the prospect's. */
const PLATFORM_DOMAINS = /(^|\.)(pagesjaunes|societe|pappers|infogreffe|facebook|instagram|linkedin|google|tripadvisor|yelp|mappy|justacote|118712|annuaire|verif|kompass|doctolib|planity|treatwell|ubereats|deliveroo|thefork|lafourchette|leboncoin)\./i;

export interface WebFindings {
  pages: Page[];
  email?: { value: string; source: string };
}

/**
 * Looks the business up on Google (through Gemini) and keeps only what can be
 * re-read on the cited pages: the email must appear on one of them.
 */
export async function findOnWeb({
  name,
  activity,
  address,
  city,
}: {
  name: string;
  activity: string;
  address?: string;
  city: string;
}): Promise<WebFindings> {
  const { text, sources } = await searchWithGoogle({
    system: RULES,
    prompt: `Cherche sur le web l'entreprise « ${name} » (${activity}), ${address ?? city}.
Trouve son adresse e-mail de contact publique si elle existe (pas celle d'un annuaire ou d'une plateforme),
et les pages qui parlent de cette entreprise précise (son site, sa page d'annuaire, un article de presse locale…).
Réponds par un JSON : {"email": "adresse ou null"}. Si tu n'es pas certain qu'il s'agit de la même entreprise, réponds null.`,
  });

  const claimed = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0]?.toLowerCase();

  const pages: Page[] = [];
  let email: WebFindings["email"];
  for (const source of sources.slice(0, 5)) {
    const page = await fetchText(source.uri).catch(() => null);
    if (!page) continue;
    pages.push({ url: page.url, text: htmlToText(page.body).slice(0, MAX_PAGE_CHARS) });
    if (!email && claimed && !PLATFORM_DOMAINS.test(claimed.split("@")[1]) && emailsIn(page.body).includes(claimed)) {
      email = { value: claimed, source: page.url };
    }
  }
  if (email && !(await hasMailServer(email.value))) email = undefined;
  return { pages, email };
}
