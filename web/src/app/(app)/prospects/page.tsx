import type { Metadata } from "next";
import { ProspectsTable } from "@/components/app/prospects-table";
import { listProspects } from "@/lib/campaigns";
import { requireWorkspace } from "@/lib/dal";

export const metadata: Metadata = { title: "Prospects" };

export default async function ProspectsPage({ searchParams }: PageProps<"/prospects">) {
  const { workspace } = await requireWorkspace();
  const { filtre, campagne } = await searchParams;
  const noWebsite = filtre === "sans-site";
  const campaignId = typeof campagne === "string" ? campagne : undefined;
  return (
    <ProspectsTable
      prospects={await listProspects(workspace.id, { noWebsite, campaignId })}
      noWebsite={noWebsite}
      campaignId={campaignId}
    />
  );
}
