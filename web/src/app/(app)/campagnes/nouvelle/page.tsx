import type { Metadata } from "next";
import { NewCampaign } from "@/components/app/new-campaign";
import { agentLimits } from "@/lib/agent/limits";

export const metadata: Metadata = { title: "Nouvelle campagne" };

export default function NewCampaignPage() {
  return <NewCampaign maxProspects={agentLimits.maxProspectsPerCampaign} />;
}
