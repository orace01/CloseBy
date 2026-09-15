import type { Metadata } from "next";
import { CampaignsList } from "@/components/app/campaigns-list";

export const metadata: Metadata = { title: "Campagnes" };

export default function CampaignsPage() {
  return <CampaignsList />;
}
