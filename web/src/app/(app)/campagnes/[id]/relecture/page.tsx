import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Review } from "@/components/app/review";
import { getCampaign, reviewQueue } from "@/lib/campaigns";
import { requireWorkspace } from "@/lib/dal";

export const metadata: Metadata = { title: "Relecture" };

export default async function ReviewPage({ params, searchParams }: PageProps<"/campagnes/[id]/relecture">) {
  const { id } = await params;
  const { prospect } = await searchParams;
  const { user, workspace } = await requireWorkspace();
  const found = await getCampaign(workspace.id, id);
  if (!found) notFound();

  return (
    <Review
      campaignId={id}
      prospects={await reviewQueue(workspace.id, id)}
      senderEmail={user.email}
      initialProspectId={typeof prospect === "string" ? prospect : undefined}
    />
  );
}
