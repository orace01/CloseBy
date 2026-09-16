import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { CampaignProgress } from "@/components/app/campaign-progress";
import { needsRestart, runAndContinue } from "@/lib/agent/runner";
import { getCampaign } from "@/lib/campaigns";
import { requireWorkspace } from "@/lib/dal";

export async function generateMetadata({ params }: PageProps<"/campagnes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const { workspace } = await requireWorkspace();
  return { title: (await getCampaign(workspace.id, id))?.campaign.name ?? "Campagne" };
}

export default async function CampaignPage({ params }: PageProps<"/campagnes/[id]">) {
  const { id } = await params;
  const { workspace } = await requireWorkspace();
  const found = await getCampaign(workspace.id, id);
  if (!found) notFound();

  // Resume a campaign whose background run was lost.
  if (needsRestart(found.row)) after(() => runAndContinue(id));

  return <CampaignProgress campaign={found.campaign} />;
}
