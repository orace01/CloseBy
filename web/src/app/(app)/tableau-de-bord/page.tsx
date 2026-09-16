import type { Metadata } from "next";
import { Dashboard } from "@/components/app/dashboard";
import { listCampaigns } from "@/lib/campaigns";
import { requireWorkspace } from "@/lib/dal";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const { user, workspace } = await requireWorkspace();
  return <Dashboard firstName={user.name.split(" ")[0]} campaigns={await listCampaigns(workspace.id)} />;
}
