import type { Metadata } from "next";
import { CampaignsList } from "@/components/app/campaigns-list";
import { listCampaigns } from "@/lib/campaigns";
import { requireWorkspace } from "@/lib/dal";

export const metadata: Metadata = { title: "Campagnes" };

export default async function CampaignsPage() {
  const { workspace } = await requireWorkspace();
  return <CampaignsList campaigns={await listCampaigns(workspace.id)} />;
}
