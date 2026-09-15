import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProspectDetail } from "@/components/app/prospect-detail";
import { prospects } from "@/lib/mock-data";

export async function generateMetadata({ params }: PageProps<"/prospects/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: prospects.find((p) => p.id === id)?.name ?? "Prospect" };
}

export default async function ProspectPage({ params }: PageProps<"/prospects/[id]">) {
  const { id } = await params;
  if (!prospects.some((p) => p.id === id)) notFound();
  return <ProspectDetail prospectId={id} />;
}
