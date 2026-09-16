import type { Metadata } from "next";
import { and, count, desc, eq, gte, isNotNull } from "drizzle-orm";
import { AdminConsole } from "@/components/app/admin-console";
import { db } from "@/db";
import { campaign, message, user, workspace } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminPage() {
  await requireAdmin();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [[users], [activeCampaigns], [draftsToday], stopped] = await Promise.all([
    db.select({ value: count() }).from(user),
    db.select({ value: count() }).from(campaign).where(eq(campaign.status, "running")),
    db.select({ value: count() }).from(message).where(gte(message.createdAt, startOfDay)),
    // Campaigns the agent paused with a message: quota, outage, error.
    db
      .select({ id: campaign.id, name: campaign.name, workspace: workspace.name, note: campaign.note, updatedAt: campaign.updatedAt })
      .from(campaign)
      .innerJoin(workspace, eq(workspace.id, campaign.workspaceId))
      .where(and(eq(campaign.status, "paused"), isNotNull(campaign.note)))
      .orderBy(desc(campaign.updatedAt))
      .limit(20),
  ]);

  return (
    <AdminConsole
      stats={{ users: users.value, activeCampaigns: activeCampaigns.value, draftsToday: draftsToday.value }}
      incidents={stopped.map((row) => ({ ...row, note: row.note ?? "", updatedAt: row.updatedAt.toISOString() }))}
    />
  );
}
