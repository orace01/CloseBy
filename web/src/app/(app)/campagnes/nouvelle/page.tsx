import type { Metadata } from "next";
import { NewCampaign } from "@/components/app/new-campaign";

export const metadata: Metadata = { title: "Nouvelle campagne" };

export default function NewCampaignPage() {
  return <NewCampaign />;
}
