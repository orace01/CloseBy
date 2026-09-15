import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Review } from "@/components/app/review";
import { campaigns } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Relecture" };

export default async function ReviewPage({ params, searchParams }: PageProps<"/campagnes/[id]/relecture">) {
  const { id } = await params;
  const { prospect } = await searchParams;
  if (!campaigns.some((c) => c.id === id)) notFound();
  return <Review campaignId={id} initialProspectId={typeof prospect === "string" ? prospect : undefined} />;
}
