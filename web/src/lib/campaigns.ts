import "server-only";
import { and, desc, eq, gte, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { campaign, prospect } from "@/db/schema";
import type { Campaign, Prospect, TextSegment } from "@/lib/types";

// Read models for the app screens, always scoped to the viewer's workspace.

type CampaignRow = typeof campaign.$inferSelect;

type Counts = { toReview: number; withoutWebsite: number };

function toCampaign(row: CampaignRow, counts: Counts): Campaign {
  return {
    id: row.id,
    name: row.name,
    offer: row.offer,
    target: row.target,
    zone: row.zone,
    radiusKm: row.radiusKm,
    maxProspects: row.maxProspects,
    tone: row.tone,
    status: row.status === "draft" ? "running" : row.status,
    progress: { found: row.found, sitesRead: row.sitesRead, drafted: row.drafted },
    sent: row.sent,
    replies: row.replies,
    note: row.note ?? undefined,
    sourced: Boolean(row.sourcedAt),
    ...counts,
  };
}

/** Businesses without a website, once the agent has looked at them. */
const withoutWebsite = and(
  isNull(prospect.website),
  ne(prospect.stage, "pending"),
  ne(prospect.status, "excluded"),
  or(isNull(prospect.relevance), gte(prospect.relevance, 40)),
);

const countColumns = {
  toReview: sql<number>`count(*) filter (where ${prospect.stage} = 'done' and ${prospect.status} = 'to_review')`.mapWith(Number),
  withoutWebsite: sql<number>`count(*) filter (where ${withoutWebsite})`.mapWith(Number),
};

async function campaignCounts(workspaceId: string, campaignId?: string) {
  const rows = await db
    .select({ campaignId: prospect.campaignId, ...countColumns })
    .from(prospect)
    .where(and(eq(prospect.workspaceId, workspaceId), campaignId ? eq(prospect.campaignId, campaignId) : undefined))
    .groupBy(prospect.campaignId);
  return new Map(rows.map(({ campaignId: id, ...counts }) => [id, counts]));
}

const noCounts: Counts = { toReview: 0, withoutWebsite: 0 };

export async function listCampaigns(workspaceId: string) {
  const [rows, counts] = await Promise.all([
    db.select().from(campaign).where(eq(campaign.workspaceId, workspaceId)).orderBy(desc(campaign.createdAt)),
    campaignCounts(workspaceId),
  ]);
  return rows.map((row) => toCampaign(row, counts.get(row.id) ?? noCounts));
}

/** The raw row (for the agent restart check) plus its screen model. */
export async function getCampaign(workspaceId: string, id: string) {
  const row = await db.query.campaign.findFirst({ where: and(eq(campaign.id, id), eq(campaign.workspaceId, workspaceId)) });
  if (!row) return null;
  const counts = await campaignCounts(workspaceId, id);
  return { row, campaign: toCampaign(row, counts.get(id) ?? noCounts) };
}

type ProspectWithRelations = typeof prospect.$inferSelect & {
  facts: Array<{ id: string; text: string; source: string; collectedAt: Date }>;
  message: { subject: string; paragraphs: TextSegment[][]; editedBody: string | null } | null;
};

function toProspect(row: ProspectWithRelations): Prospect {
  return {
    id: row.id,
    campaignId: row.campaignId,
    name: row.name,
    activity: row.activity,
    city: row.city,
    address: row.address ?? undefined,
    distanceKm: row.distanceKm ?? 0,
    website: row.website ?? undefined,
    phone: row.phone ?? undefined,
    mapsUrl: row.mapsUrl ?? undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.reviewCount ?? undefined,
    email: row.status === "no_email" ? undefined : (row.email ?? undefined),
    emailSource: row.emailSource ?? undefined,
    nafCode: row.nafCode ?? undefined,
    source: row.source,
    collectedAt: row.collectedAt.toISOString(),
    status: row.status,
    facts: row.facts.map((f) => ({ id: f.id, text: f.text, source: f.source, collectedAt: f.collectedAt.toISOString() })),
    draft: row.message ? { subject: row.message.subject, paragraphs: row.message.paragraphs } : undefined,
    editedBody: row.message?.editedBody ?? undefined,
  };
}

const withDetails = {
  facts: { columns: { id: true, text: true, source: true, collectedAt: true } },
  message: { columns: { subject: true, paragraphs: true, editedBody: true } },
} as const;

/** Prospects shown to the user: drafted ones, and those without a public email. */
const visible = or(eq(prospect.stage, "done"), eq(prospect.status, "no_email"));

export async function listProspects(workspaceId: string, filter: { noWebsite?: boolean; campaignId?: string } = {}) {
  const rows = await db.query.prospect.findMany({
    where: and(
      eq(prospect.workspaceId, workspaceId),
      filter.noWebsite ? withoutWebsite : visible,
      filter.campaignId ? eq(prospect.campaignId, filter.campaignId) : undefined,
    ),
    with: withDetails,
    orderBy: [desc(prospect.createdAt), sql`${prospect.distanceKm} asc`],
  });
  return rows.map(toProspect);
}

export async function getProspect(workspaceId: string, id: string) {
  const row = await db.query.prospect.findFirst({
    where: and(eq(prospect.id, id), eq(prospect.workspaceId, workspaceId)),
    with: withDetails,
  });
  return row ? toProspect(row) : null;
}

export async function reviewQueue(workspaceId: string, campaignId: string) {
  const rows = await db.query.prospect.findMany({
    where: and(
      eq(prospect.workspaceId, workspaceId),
      eq(prospect.campaignId, campaignId),
      eq(prospect.stage, "done"),
      inArray(prospect.status, ["to_review", "approved", "rejected"]),
    ),
    with: withDetails,
    orderBy: [sql`${prospect.relevance} desc nulls last`, prospect.distanceKm],
  });
  return rows.map(toProspect);
}
