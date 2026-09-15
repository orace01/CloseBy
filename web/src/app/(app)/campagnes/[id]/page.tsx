import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CampaignProgress } from "@/components/app/campaign-progress";
import { campaigns } from "@/lib/mock-data";

export async function generateMetadata({ params }: PageProps<"/campagnes/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: campaigns.find((c) => c.id === id)?.name ?? "Campagne" };
}

export default async function CampaignPage({ params }: PageProps<"/campagnes/[id]">) {
  const { id } = await params;
  if (!campaigns.some((c) => c.id === id)) notFound();
  return <CampaignProgress campaignId={id} />;
}
