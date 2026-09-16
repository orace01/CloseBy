import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProspectDetail } from "@/components/app/prospect-detail";
import { getProspect } from "@/lib/campaigns";
import { requireWorkspace } from "@/lib/dal";

export async function generateMetadata({ params }: PageProps<"/prospects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const { workspace } = await requireWorkspace();
  return { title: (await getProspect(workspace.id, id))?.name ?? "Prospect" };
}

export default async function ProspectPage({ params }: PageProps<"/prospects/[id]">) {
  const { id } = await params;
  const { workspace } = await requireWorkspace();
  const prospect = await getProspect(workspace.id, id);
  if (!prospect) notFound();
  return <ProspectDetail prospect={prospect} />;
}
