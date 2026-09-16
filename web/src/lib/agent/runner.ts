import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { and, asc, eq, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { campaign, creditLedger, fact, message, prospect, suppression, user, workspace, workspaceMember } from "@/db/schema";
import { appBaseUrl } from "@/lib/auth-config";
import { analyzeProspect, chooseSearchTags, draftEmail, findOnWeb } from "./ai";
import { GeminiError, webSearchEnabled } from "./gemini";
import { geocodeWithGoogle, GooglePlacesError, googlePlacesEnabled, searchGooglePlaces } from "./google-places";
import { geocode, PlacesUnavailable, searchPlaces, type Place } from "./places";
import { readSite, type Page } from "./site";

// The agent works in slices: each run takes the campaign lock, handles
// prospects until its time budget is spent, then asks for the next run.
// A run can also be restarted by anyone viewing the campaign, so a lost
// hand-off only delays the work.

/** Work budget per run, kept well under the function's maxDuration (300 s). */
const RUN_BUDGET_MS = 170_000;
const LOCK_MS = 290_000;
/** Below this score a prospect is set aside without costing a credit. */
const MIN_RELEVANCE = 40;
/** Consecutive runs blocked by the AI rate limit before the campaign pauses. */
const MAX_BLOCKED_RUNS = 5;

type Campaign = typeof campaign.$inferSelect;
type Prospect = typeof prospect.$inferSelect;

class OutOfCredits extends Error {}

export type RunOutcome = "more" | "blocked" | "finished" | "locked";

const log = (campaignId: string, ...args: unknown[]) => console.info(`[agent ${campaignId.slice(0, 8)}]`, ...args);

async function acquireLock(campaignId: string) {
  const [locked] = await db
    .update(campaign)
    .set({ lockedUntil: new Date(Date.now() + LOCK_MS) })
    .where(
      and(
        eq(campaign.id, campaignId),
        eq(campaign.status, "running"),
        or(isNull(campaign.lockedUntil), lt(campaign.lockedUntil, new Date())),
      ),
    )
    .returning();
  return locked;
}

async function stop(campaignId: string, status: "done" | "paused", note: string | null) {
  await db.update(campaign).set({ status, note, lockedUntil: null }).where(eq(campaign.id, campaignId));
  log(campaignId, status, note ?? "");
}

/** Finds businesses with Google Maps when a key is configured, otherwise OpenStreetMap. */
async function findPlaces(current: Campaign): Promise<{ places: Place[]; city: string; tags: string[] } | string> {
  if (googlePlacesEnabled()) {
    const zone = await geocodeWithGoogle(current.zone);
    if (!zone) return `Zone « ${current.zone} » introuvable. Essayez un nom de ville.`;
    const places = await searchGooglePlaces({ target: current.target, lat: zone.lat, lon: zone.lon, radiusKm: current.radiusKm });
    return { places, city: zone.city, tags: [`google:${current.target}`] };
  }

  const zone = await geocode(current.zone);
  if (!zone) return `Zone « ${current.zone} » introuvable. Essayez un nom de ville.`;
  const tags = await chooseSearchTags(current.target);
  if (tags.length === 0) return "Cette cible n’a pas pu être traduite en recherche. Reformulez-la.";
  const places = await searchPlaces({ tags, lat: zone.lat, lon: zone.lon, radiusKm: current.radiusKm });
  return { places, city: zone.city, tags };
}

/** "37 Rue du Mail" → "37 Rue du Mail, Angers"; a missing address becomes the city. */
function withCity(address: string | undefined, city: string) {
  if (!address) return city;
  return address.toLocaleLowerCase("fr-FR").includes(city.toLocaleLowerCase("fr-FR")) ? address : `${address}, ${city}`;
}

async function source(current: Campaign) {
  const result = await findPlaces(current);
  if (typeof result === "string") return stop(current.id, "done", result);
  const { places, city, tags } = result;

  // Skip businesses already prospected by this workspace or on its exclusion list.
  const [known, excluded] = await Promise.all([
    db
      .select({ website: prospect.website, sourceRef: prospect.sourceRef })
      .from(prospect)
      .where(eq(prospect.workspaceId, current.workspaceId)),
    db.select({ value: suppression.value }).from(suppression).where(eq(suppression.workspaceId, current.workspaceId)),
  ]);
  const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, "");
  const knownHosts = new Set(known.flatMap((row) => (row.website ? [hostOf(row.website)] : [])));
  const knownRefs = new Set(known.flatMap((row) => (row.sourceRef ? [row.sourceRef] : [])));
  const excludedValues = new Set(excluded.map((row) => row.value.toLowerCase()));

  const selected = places
    .filter((place) => {
      if (knownRefs.has(place.sourceRef)) return false;
      if (place.email && excludedValues.has(place.email.toLowerCase())) return false;
      if (!place.website) return true;
      const host = hostOf(place.website);
      return !knownHosts.has(host) && !excludedValues.has(host);
    })
    .slice(0, current.maxProspects);

  await db.transaction(async (tx) => {
    if (selected.length > 0) {
      await tx.insert(prospect).values(
        selected.map((place) => ({
          workspaceId: current.workspaceId,
          campaignId: current.id,
          name: place.name,
          activity: place.category ?? current.target,
          city: place.city ?? city,
          address: withCity(place.address, place.city ?? city),
          distanceKm: place.distanceKm,
          website: place.website,
          phone: place.phone,
          mapsUrl: place.mapsUrl,
          rating: place.rating,
          reviewCount: place.reviewCount,
          email: place.email,
          emailSource: place.email ? place.source : undefined,
          source: place.source,
          sourceRef: place.sourceRef,
        })),
      );
    }
    await tx
      .update(campaign)
      .set({ found: selected.length, searchTags: tags, sourcedAt: new Date() })
      .where(eq(campaign.id, current.id));
  });
  log(current.id, `sourced ${selected.length} of ${places.length} places for`, tags.join(", "));

  if (selected.length === 0) {
    await stop(current.id, "done", "Aucune nouvelle entreprise trouvée dans cette zone. Élargissez le rayon ou la cible.");
  }
}

async function skip(p: Prospect, reason: string, patch: Partial<Prospect> = {}) {
  await db.transaction(async (tx) => {
    await tx
      .update(prospect)
      .set({ ...patch, stage: "skipped", skipReason: reason })
      .where(eq(prospect.id, p.id));
    await tx
      .update(campaign)
      .set({ sitesRead: sql`${campaign.sitesRead} + 1` })
      .where(eq(campaign.id, p.campaignId));
  });
  log(p.campaignId, `skip ${p.name}: ${reason}`);
}

async function senderOf(workspaceId: string) {
  const [row] = await db
    .select({ name: user.name, company: workspace.name, offer: workspace.offer })
    .from(workspaceMember)
    .innerJoin(user, eq(user.id, workspaceMember.userId))
    .innerJoin(workspace, eq(workspace.id, workspaceMember.workspaceId))
    .where(and(eq(workspaceMember.workspaceId, workspaceId), eq(workspaceMember.role, "owner")))
    .limit(1);
  return row;
}

/** The business listing (Google Maps or OpenStreetMap) as a page facts can quote. */
function listingPage(p: Prospect): Page | null {
  if (!p.mapsUrl) return null;
  const lines = [
    `Fiche ${p.source} de ${p.name}`,
    `Activité : ${p.activity}`,
    p.address && `Adresse : ${p.address}`,
    p.rating && p.reviewCount ? `Note Google : ${p.rating.toLocaleString("fr-FR")}/5 sur ${p.reviewCount} avis` : null,
    !p.website && "Site web : aucun site web référencé",
  ];
  return { url: p.mapsUrl, text: lines.filter(Boolean).join("\n") };
}

async function handleProspect(
  current: Campaign,
  p: Prospect,
  sender: { name: string; company: string },
  run: { webSearchAvailable: boolean },
) {
  const pages: Page[] = [];
  let found: { value: string; source: string } | undefined;

  if (p.website) {
    const reading = await readSite(p.website, p.email ?? undefined).catch((error: Error) => {
      log(current.id, `read failed ${p.website}: ${error.message}`);
      return null;
    });
    if (reading) {
      pages.push(...reading.pages);
      found = reading.email;
    }
  }

  // No site, or no address on it: look the business up on Google.
  if (!found && run.webSearchAvailable) {
    try {
      const web = await findOnWeb({ name: p.name, activity: p.activity, address: p.address ?? undefined, city: p.city });
      pages.push(...web.pages);
      found = web.email;
    } catch (error) {
      if (error instanceof GeminiError && error.dailyQuota) throw error;
      // Search grounding is not in Gemini's free tier: stop trying for this run.
      run.webSearchAvailable = false;
      log(current.id, `web search unavailable: ${(error as Error).message}`);
    }
  }

  if (!found) return skip(p, "Aucune adresse e-mail publique trouvée.", { status: "no_email", email: null, emailSource: null });

  const listing = listingPage(p);
  if (listing) pages.push(listing);
  const reading = { pages, email: found };

  const email = reading.email.value;
  const [blocked] = await db
    .select({ id: suppression.id })
    .from(suppression)
    .where(
      and(
        eq(suppression.workspaceId, current.workspaceId),
        or(eq(suppression.value, email), eq(suppression.value, email.split("@")[1])),
      ),
    )
    .limit(1);
  if (blocked) return skip(p, "Adresse sur la liste d’exclusion.", { status: "excluded", email });

  const contact = { email, emailSource: reading.email.source };
  const analysis = await analyzeProspect({ name: p.name, offer: current.offer, target: current.target, pages: reading.pages });
  const profile = { ...contact, activity: analysis.activity, relevance: analysis.relevance };
  if (analysis.relevance < MIN_RELEVANCE) return skip(p, `Peu pertinent : ${analysis.reason}`, profile);
  if (analysis.facts.length === 0) return skip(p, "Pas assez d’informations publiques pour personnaliser.", profile);

  // The model sees short labels; the email stores the real fact ids.
  const facts = analysis.facts.map((item, i) => ({ ...item, id: crypto.randomUUID(), label: `F${i + 1}` }));
  const labelToId = new Map(facts.map((item) => [item.label, item.id]));

  let draft;
  try {
    draft = await draftEmail({
      prospectName: p.name,
      activity: analysis.activity,
      facts: facts.map((item) => ({ id: item.label, text: item.text, quote: item.quote })),
      offer: current.offer,
      tone: current.tone,
      senderName: sender.name,
      senderCompany: sender.company,
    });
  } catch (error) {
    if (error instanceof GeminiError) throw error;
    return skip(p, "Rédaction impossible avec les informations trouvées.", profile);
  }
  const paragraphs = draft.paragraphs.map((paragraph) =>
    paragraph.map((segment) => (segment.factId ? { text: segment.text, factId: labelToId.get(segment.factId) } : segment)),
  );

  await db.transaction(async (tx) => {
    const [debited] = await tx
      .update(workspace)
      .set({ creditBalance: sql`${workspace.creditBalance} - 1` })
      .where(and(eq(workspace.id, current.workspaceId), sql`${workspace.creditBalance} >= 1`))
      .returning({ id: workspace.id });
    if (!debited) throw new OutOfCredits();

    await tx.insert(fact).values(facts.map((item) => ({ id: item.id, prospectId: p.id, text: item.text, quote: item.quote, source: item.source })));
    await tx.insert(message).values({ prospectId: p.id, subject: draft.subject, paragraphs, model: draft.model });
    await tx.insert(creditLedger).values({ workspaceId: current.workspaceId, operation: "draft", quantity: -1, referenceId: p.id });
    await tx
      .update(prospect)
      .set({ ...profile, stage: "done", status: "to_review", skipReason: null })
      .where(eq(prospect.id, p.id));
    await tx
      .update(campaign)
      .set({ sitesRead: sql`${campaign.sitesRead} + 1`, drafted: sql`${campaign.drafted} + 1`, note: null })
      .where(eq(campaign.id, current.id));
  });
  log(current.id, `drafted ${p.name} <${email}> (${analysis.relevance})`);
}

/** Runs one slice of work on a campaign. */
export async function advanceCampaign(campaignId: string, blockedRuns = 0): Promise<RunOutcome> {
  const current = await acquireLock(campaignId);
  if (!current) return "locked";
  const startedAt = Date.now();

  try {
    if (!current.sourcedAt) {
      await source(current);
      const [after] = await db.select({ status: campaign.status }).from(campaign).where(eq(campaign.id, campaignId));
      if (after?.status !== "running") return "finished";
    }

    const sender = await senderOf(current.workspaceId);
    const run = { webSearchAvailable: webSearchEnabled };
    if (!sender) {
      await stop(campaignId, "paused", "Compte introuvable.");
      return "finished";
    }

    while (Date.now() - startedAt < RUN_BUDGET_MS) {
      // Honour a pause requested while this run was working.
      const [state] = await db.select({ status: campaign.status }).from(campaign).where(eq(campaign.id, campaignId));
      if (state?.status !== "running") return "finished";

      const [next] = await db
        .select()
        .from(prospect)
        .where(and(eq(prospect.campaignId, campaignId), eq(prospect.stage, "pending")))
        .orderBy(asc(prospect.distanceKm))
        .limit(1);
      if (!next) {
        await stop(campaignId, "done", null);
        return "finished";
      }
      await handleProspect(current, next, sender, run);
    }
    return "more";
  } catch (error) {
    if (error instanceof OutOfCredits) {
      await stop(campaignId, "paused", "Crédits épuisés. Rechargez vos crédits pour reprendre.");
      return "finished";
    }
    if (error instanceof GeminiError && error.dailyQuota) {
      await stop(campaignId, "paused", "Quota quotidien de l’IA atteint. Reprenez la campagne demain.");
      return "finished";
    }
    if (error instanceof GooglePlacesError && !error.retryable) {
      await stop(campaignId, "paused", "Google Maps a refusé la recherche. Vérifiez la clé Google Maps et l’API Places.");
      return "finished";
    }
    const busyService =
      error instanceof PlacesUnavailable || error instanceof GooglePlacesError ? "la carte" : error instanceof GeminiError && error.retryable ? "l’IA" : null;
    if (busyService) {
      log(campaignId, `service busy (${blockedRuns + 1}/${MAX_BLOCKED_RUNS}):`, (error as Error).message);
      if (blockedRuns + 1 >= MAX_BLOCKED_RUNS) {
        await stop(campaignId, "paused", `Le service de ${busyService} ne répond pas. Reprenez la campagne un peu plus tard.`);
        return "finished";
      }
      await db
        .update(campaign)
        .set({ note: `Le service de ${busyService} est très sollicité, l’agent réessaie dans un instant.` })
        .where(eq(campaign.id, campaignId));
      return "blocked";
    }
    console.error(`[agent ${campaignId.slice(0, 8)}]`, error);
    const note =
      error instanceof GeminiError
        ? "Le service d’IA a refusé la requête. Vérifiez la clé Gemini et le modèle configuré."
        : "Une erreur est survenue. Reprenez la campagne pour réessayer.";
    await stop(campaignId, "paused", note);
    return "finished";
  } finally {
    await db.update(campaign).set({ lockedUntil: null }).where(eq(campaign.id, campaignId));
  }
}

/* ---------- Hand-off between runs ---------- */

function runToken(campaignId: string) {
  return createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "").update(`agent-run:${campaignId}`).digest("hex");
}

export function isValidRunToken(campaignId: string, token: string) {
  const expected = Buffer.from(runToken(campaignId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

function selfUrl() {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return appBaseUrl ?? "http://localhost:3000";
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs a slice, then hands the rest of the work to a fresh function invocation. */
export async function runAndContinue(campaignId: string, blockedRuns = 0) {
  const outcome = await advanceCampaign(campaignId, blockedRuns);
  if (outcome !== "more" && outcome !== "blocked") return;
  if (outcome === "blocked") await sleep(30_000);

  try {
    const response = await fetch(`${selfUrl()}/api/agent/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ campaignId, token: runToken(campaignId), blockedRuns: outcome === "blocked" ? blockedRuns + 1 : 0 }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) log(campaignId, `hand-off refused: ${response.status}`);
  } catch (error) {
    // The next visit to the campaign page restarts the agent.
    log(campaignId, `hand-off failed: ${(error as Error).message}`);
  }
}

/** True when a running campaign has no active run (e.g. a hand-off was lost). */
export function needsRestart(c: Pick<Campaign, "status" | "lockedUntil" | "updatedAt">) {
  // Recent activity means a hand-off may be in flight: give it time first.
  const idle = Date.now() - c.updatedAt.getTime() > 45_000;
  return c.status === "running" && idle && (!c.lockedUntil || c.lockedUntil < new Date());
}
