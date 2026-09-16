"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { user as userTable, workspace, workspaceMember } from "@/db/schema";
import { requireUser } from "@/lib/dal";
import { TONES } from "@/lib/onboarding";

export type OnboardingState = { error?: string; step?: number } | undefined;

const steps = [
  z.object({
    name: z.string().trim().min(1, "Indiquez votre nom.").max(80, "Ce nom est trop long."),
    company: z.string().trim().min(1, "Indiquez le nom de votre entreprise.").max(120, "Ce nom est trop long."),
  }),
  z.object({
    offer: z
      .string()
      .trim()
      .min(10, "Décrivez votre offre en une phrase (10 caractères minimum).")
      .max(500, "Restez sous 500 caractères."),
    tone: z.enum(TONES, { error: "Choisissez un ton." }),
  }),
  z.object({
    terms: z.literal("on", { error: "Acceptez les règles d’utilisation pour continuer." }),
  }),
];

export async function completeOnboarding(_state: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const current = await requireUser();
  const values = Object.fromEntries(["name", "company", "offer", "tone", "terms"].map((key) => [key, formData.get(key) ?? undefined]));

  const data: Record<string, string> = {};
  for (const [step, schema] of steps.entries()) {
    const result = schema.safeParse(values);
    if (!result.success) return { error: result.error.issues[0].message, step };
    Object.assign(data, result.data);
  }

  await db.transaction(async (tx) => {
    await tx.update(userTable).set({ name: data.name, onboardedAt: new Date() }).where(eq(userTable.id, current.id));

    const membership = await tx.query.workspaceMember.findFirst({ where: eq(workspaceMember.userId, current.id) });
    if (membership) {
      await tx
        .update(workspace)
        .set({ name: data.company, offer: data.offer, tone: data.tone })
        .where(eq(workspace.id, membership.workspaceId));
    } else {
      const [created] = await tx
        .insert(workspace)
        .values({ name: data.company, offer: data.offer, tone: data.tone })
        .returning({ id: workspace.id });
      await tx.insert(workspaceMember).values({ workspaceId: created.id, userId: current.id, role: "owner" });
    }
  });

  redirect("/tableau-de-bord");
}
