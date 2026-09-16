"use server";

import { and, count, eq, gte, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { campaign, message, prospect, suppression } from "@/db/schema";
import { analyzeBrief } from "@/lib/agent/ai";
import { agentLimits } from "@/lib/agent/limits";
import { runAndContinue } from "@/lib/agent/runner";
import { parseBrief, type ParsedBrief } from "@/lib/brief";
import { requireWorkspace } from "@/lib/dal";

export async function analyzeBriefAction(brief: string): Promise<ParsedBrief> {
  await requireWorkspace();
  const text = brief.trim().slice(0, 1000);
  if (!text) return parseBrief("");
  try {
    const result = await analyzeBrief(text);
    const fallback = parseBrief(text);
    return {
      offer: result.offer.trim() || fallback.offer,
      target: result.target.trim() || fallback.target,
      zone: result.zone.trim() || fallback.zone,
    };
  } catch (error) {
    // The form stays usable without the AI: the user can correct the fields.
    console.error("[brief]", error);
    return parseBrief(text);
  }
}

export type LaunchState = { error?: string } | undefined;

const launchSchema = z.object({
  brief: z.string().max(1000).optional(),
  offer: z.string().trim().min(2, "Précisez votre offre.").max(200),
  target: z.string().trim().min(2, "Précisez la cible.").max(200),
  zone: z.string().trim().min(2, "Précisez la zone.").max(200),
  radius: z.coerce.number().int().min(1).max(50),
  volume: z.coerce
    .number()
    .int()
    .min(1)
    .max(agentLimits.maxProspectsPerCampaign, `${agentLimits.maxProspectsPerCampaign} prospects maximum par campagne pour le moment.`),
  tone: z.string().trim().min(2).max(40),
});

export async function launchCampaign(_state: LaunchState, formData: FormData): Promise<LaunchState> {
  const { workspace } = await requireWorkspace();
  const parsed = launchSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!process.env.GEMINI_API_KEY) return { error: "L’agent n’est pas encore configuré (clé Gemini manquante)." };
  if (workspace.creditBalance < 1) return { error: "Vous n’avez plus de crédits." };

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [{ launched }] = await db
    .select({ launched: count() })
    .from(campaign)
    .where(and(eq(campaign.workspaceId, workspace.id), gte(campaign.createdAt, since)));
  if (launched >= agentLimits.maxCampaignsPerDay) {
    return { error: `Vous avez lancé ${launched} campagnes en 24 h, le maximum pour le moment. Réessayez demain.` };
  }

  const data = parsed.data;
  const [created] = await db
    .insert(campaign)
    .values({
      workspaceId: workspace.id,
      name: `${data.target} · ${data.zone}`,
      brief: data.brief,
      offer: data.offer,
      target: data.target,
      zone: data.zone,
      radiusKm: data.radius,
      maxProspects: data.volume,
      tone: data.tone,
      status: "running",
    })
    .returning({ id: campaign.id });

  after(() => runAndContinue(created.id));
  revalidatePath("/campagnes");
  redirect(`/campagnes/${created.id}`);
}

export async function setCampaignPaused(campaignId: string, paused: boolean) {
  const { workspace } = await requireWorkspace();
  const [updated] = await db
    .update(campaign)
    .set({ status: paused ? "paused" : "running", note: null })
    .where(and(eq(campaign.id, campaignId), eq(campaign.workspaceId, workspace.id), ne(campaign.status, "done")))
    .returning({ id: campaign.id });
  if (updated && !paused) after(() => runAndContinue(campaignId));
  revalidatePath("/campagnes", "layout");
}

async function ownedProspect(prospectId: string) {
  const { workspace } = await requireWorkspace();
  const row = await db.query.prospect.findFirst({
    where: and(eq(prospect.id, prospectId), eq(prospect.workspaceId, workspace.id)),
    with: { message: { columns: { id: true } } },
  });
  return row ? { workspace, row } : null;
}

export async function decideProspect(prospectId: string, decision: "approved" | "rejected" | "to_review") {
  const owned = await ownedProspect(prospectId);
  if (!owned?.row.message || !["to_review", "approved", "rejected"].includes(owned.row.status)) return;
  await db.transaction(async (tx) => {
    await tx.update(prospect).set({ status: decision }).where(eq(prospect.id, prospectId));
    await tx
      .update(message)
      .set({ approvedAt: decision === "approved" ? new Date() : null })
      .where(eq(message.prospectId, prospectId));
  });
  revalidatePath(`/campagnes/${owned.row.campaignId}`, "layout");
}

export async function saveEditedBody(prospectId: string, body: string) {
  const owned = await ownedProspect(prospectId);
  if (!owned?.row.message) return;
  const value = body.trim().slice(0, 10_000);
  await db.update(message).set({ editedBody: value || null }).where(eq(message.prospectId, prospectId));
}

export async function toggleExclusion(prospectId: string) {
  const owned = await ownedProspect(prospectId);
  if (!owned) return;
  const { workspace, row } = owned;
  const email = row.email?.toLowerCase();

  await db.transaction(async (tx) => {
    if (row.status === "excluded") {
      const restored = row.message ? "to_review" : "no_email";
      await tx.update(prospect).set({ status: restored }).where(eq(prospect.id, row.id));
      if (email) {
        await tx.delete(suppression).where(and(eq(suppression.workspaceId, workspace.id), eq(suppression.value, email)));
      }
    } else {
      await tx.update(prospect).set({ status: "excluded" }).where(eq(prospect.id, row.id));
      if (email) {
        await tx
          .insert(suppression)
          .values({ workspaceId: workspace.id, value: email, kind: "email", reason: "Exclu par l’utilisateur", source: row.id })
          .onConflictDoNothing();
      }
    }
  });
  revalidatePath(`/prospects/${row.id}`);
  revalidatePath("/prospects");
}
